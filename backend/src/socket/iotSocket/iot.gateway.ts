import { Logger, UseInterceptors, Controller, Body, HttpException, HttpStatus, Post, UseFilters } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server, WebSocket } from 'ws';
import {
  IoTActionRequestFromWatcher,
  IoTUpdateRequestFromObject,
  IoTRouteRequestFromObject,
  IoTUpdateDocumentRequestFromObject,
  IoTGetDocRequestFromObject,
  IOT_EVENT,
} from './iotSocket.types';
import { IoTObjectService } from '../../models/iot/IoTobject/IoTobject.service';
import { DTOInterceptor } from '../../utils/interceptors/dto.interceptor';
import { IoTObjectEntity } from '../../models/iot/IoTobject/entities/IoTobject.entity';
import { IoTProjectService } from '../../models/iot/IoTproject/IoTproject.service';
import {
  WatcherClient,
  WatcherClientConnectPayload,
  ObjectClientConnectPayload,
  ObjectClient,
} from './iotSocket.types';
import { IoTExceptionFilter } from './iot.exception';
import {
  IoTListenRequestFromObject,
  IoTGetFieldRequestFromObject,
  IoTBroadcastRequestFromBoth,
} from './iotSocket.types';

@UseInterceptors(DTOInterceptor)
@WebSocketGateway(8881)
@Controller('iot/aliot')
export class IoTGateway implements OnGatewayDisconnect, OnGatewayConnection, OnGatewayInit {
  private logger: Logger = new Logger('IoTGateway');

  constructor(private iotObjectService: IoTObjectService, private iotProjectService: IoTProjectService) {}

  @WebSocketServer()
  server: Server;

  afterInit() {
    this.logger.log(`Initialized`);
  }

  handleConnection() {
    this.logger.log(`Client connected`);
  }

  handleDisconnect(@ConnectedSocket() socket: WebSocket) {
    this.logger.log(`Client disconnected`);
    ObjectClient.objects = ObjectClient.objects.filter(obj => obj.getSocket() !== socket);
    WatcherClient.clients = WatcherClient.watchers.filter(w => w.getSocket() !== socket);
  }

  @UseFilters(new IoTExceptionFilter())
  @SubscribeMessage('connect_watcher')
  connect_watcher(@ConnectedSocket() socket: WebSocket, @MessageBody() payload: WatcherClientConnectPayload) {
    if (!payload.iotProjectId || !payload.iotProjectName) throw new WsException('Bad payload');
    if (WatcherClient.isSocketAlreadyWatcher(socket)) throw new WsException('Already connected as a watcher');

    const client = new WatcherClient(socket, payload.iotProjectId);
    client.register();

    this.logger.log(
      `Watcher connected and listening on project : ${payload.iotProjectName} id : ${payload.iotProjectId}`,
    );

    client.sendEvent(IOT_EVENT.CONNECT_SUCCESS, 'Watcher connected');
  }

  @UseFilters(new IoTExceptionFilter())
  @SubscribeMessage(IOT_EVENT.CONNECT_OBJECT)
  async connect_object(@ConnectedSocket() socket: WebSocket, @MessageBody() payload: ObjectClientConnectPayload) {
    if (!payload.id) throw new WsException('Bad payload');
    if (WatcherClient.isSocketAlreadyWatcher(socket)) throw new WsException('Already connected as a watcher');
    if (ObjectClient.getClientById(payload.id))
      throw new WsException(`An IoTObject is already connected with the id "${payload.id}"`);

    // Checks if the object exists in the database and checks for permissions for projects
    let iotObject: IoTObjectEntity;
    try {
      iotObject = await this.iotObjectService.findOneWithLoadedProjects(payload.id);
    } catch (err) {
      throw new WsException(`Objet with id "${payload.id}" is not registered on ALIVEcode`);
    }

    // Register client
    const projectId = iotObject.currentIotProject.id;
    const client = new ObjectClient(socket, payload.id, projectId);
    client.register();

    // Logging
    this.logger.log(`IoTObject connect with id : ${payload.id}`);

    this.iotObjectService.addIoTObjectLog(iotObject, IOT_EVENT.CONNECT_SUCCESS, 'Connected to ALIVEcode');

    client.sendEvent(IOT_EVENT.CONNECT_SUCCESS, null);
  }

  @UseFilters(new IoTExceptionFilter())
  @SubscribeMessage('send_update')
  async send_update(@ConnectedSocket() socket: WebSocket, @MessageBody() payload: IoTUpdateRequestFromObject) {
    if (!payload.id || payload.value == null) throw new WsException('Bad payload');
    const object = ObjectClient.getClientBySocket(socket);
    if (!object) throw new WsException('Forbidden');

    await this.iotProjectService.updateComponent(object.projectId, payload.id, payload.value);
  }

  @UseFilters(new IoTExceptionFilter())
  @SubscribeMessage('update')
  async update(@ConnectedSocket() socket: WebSocket, @MessageBody() payload: IoTUpdateDocumentRequestFromObject) {
    if (payload.fields == null || typeof payload.fields !== 'object') throw new WsException('Bad payload');
    const object = ObjectClient.getClientBySocket(socket);
    if (!object) throw new WsException('Forbidden');

    await this.iotProjectService.updateDocumentFields(object.projectId, payload.fields);
  }

  @UseFilters(new IoTExceptionFilter())
  @SubscribeMessage('listen')
  async listen(@ConnectedSocket() socket: WebSocket, @MessageBody() payload: IoTListenRequestFromObject) {
    if (!Array.isArray(payload.fields)) throw new WsException('Bad payload');
    const client = ObjectClient.getClientBySocket(socket);
    if (!client) throw new WsException('Forbidden');

    const fields = payload.fields.filter(f => typeof f === 'string');
    const object = await this.iotObjectService.findOne(client.id);

    await this.iotObjectService.subscribeListener(object, fields);
  }

  @UseFilters(new IoTExceptionFilter())
  @SubscribeMessage('send_object')
  async send_object(@ConnectedSocket() socket: WebSocket, @MessageBody() payload: IoTActionRequestFromWatcher) {
    if (!payload.targetId || payload.actionId == null || payload.value == null) throw new WsException('Bad payload');
    const watcher = WatcherClient.getClientBySocket(socket);
    if (!watcher) throw new WsException('Forbidden');

    const object = await this.iotObjectService.findOneWithLoadedProjects(payload.targetId);
    if (object.currentIotProject?.id !== watcher.projectId) throw new WsException('Not in the same project');

    await this.iotObjectService.sendAction(object, payload.actionId, payload.value);
  }

  @UseFilters(new IoTExceptionFilter())
  @SubscribeMessage('send_route')
  async send_route(@ConnectedSocket() socket: WebSocket, @MessageBody() payload: IoTRouteRequestFromObject) {
    if (!payload.routePath || !payload.data) throw new WsException('Bad payload');
    const object = ObjectClient.getClientBySocket(socket);
    if (!object) throw new WsException('Forbidden');

    const { route } = await this.iotProjectService.findOneWithRoute(object.projectId, payload.routePath);
    await this.iotProjectService.sendRoute(route, payload.data);
  }

  @UseFilters(new IoTExceptionFilter())
  @SubscribeMessage('broadcast')
  async broadcast(@ConnectedSocket() socket: WebSocket, @MessageBody() payload: IoTBroadcastRequestFromBoth) {
    if (!payload.data) throw new WsException('Bad payload');
    const client = ObjectClient.getClientBySocket(socket);
    if (!client) throw new WsException('Forbidden');

    const project = await this.iotProjectService.findOne(client.projectId);
    await this.iotProjectService.broadcast(project, payload.data);
  }

  /*****   HTTP PROTOCOLS   *****/

  @Post('getDoc')
  async getAll(@Body() payload: IoTGetDocRequestFromObject) {
    if (!payload.projectId || !payload.projectId || !payload.objectId)
      throw new HttpException('Bad payload', HttpStatus.BAD_REQUEST);
    const obj = ObjectClient.getClientById(payload.objectId);
    if (!obj || obj.projectId !== payload.projectId) throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);

    return await this.iotProjectService.getDocument(payload.projectId);
  }

  @Post('getField')
  async getField(@Body() payload: IoTGetFieldRequestFromObject) {
    if (!payload.projectId || !payload.objectId || !payload.field)
      throw new HttpException('Bad payload', HttpStatus.BAD_REQUEST);
    const obj = ObjectClient.getClientById(payload.objectId);
    if (!obj || obj.projectId !== payload.projectId) throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);

    return await this.iotProjectService.getField(payload.projectId, payload.field);
  }
}