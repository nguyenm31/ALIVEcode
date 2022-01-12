import { Logger, UseInterceptors } from '@nestjs/common';
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
  IoTSocketRouteRequestFromObject,
  IoTUpdateDocumentRequestFromObject,
  IoTGetAllRequestFromObject,
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
import { IOTPROJECT_INTERACT_RIGHTS } from '../../models/iot/IoTproject/entities/IoTproject.entity';
import { IoTListenRequestFromObject } from './iotSocket.types';

@UseInterceptors(DTOInterceptor)
@WebSocketGateway(8881)
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

  async objectPermissionFilter(socket: WebSocket, projectId: string) {
    const object = ObjectClient.getClientBySocket(socket);
    if (!object) throw new WsException('Forbidden');

    const project = await this.iotProjectService.findOne(projectId);
    if (!project) throw new WsException('No project with id');

    if (project.interactRights !== IOTPROJECT_INTERACT_RIGHTS.ANYONE && !object.hasProjectRights(projectId))
      throw new WsException('Forbidden');

    return { project, object };
  }

  @SubscribeMessage('connect_watcher')
  connect_watcher(@ConnectedSocket() socket: WebSocket, @MessageBody() payload: WatcherClientConnectPayload) {
    if (!payload.iotProjectId || !payload.iotProjectName) throw new WsException('Bad payload');
    if (WatcherClient.isSocketAlreadyWatcher(socket)) throw new WsException('Already connected as a watcher');

    const client = new WatcherClient(socket, payload.iotProjectId);
    client.register();

    this.logger.log(
      `Watcher connected and listening on project : ${payload.iotProjectName} id : ${payload.iotProjectId}`,
    );

    client.sendCustom('connect-success', 'Watcher connected');
  }

  @SubscribeMessage('connect_object')
  async connect_object(@ConnectedSocket() socket: WebSocket, @MessageBody() payload: ObjectClientConnectPayload) {
    if (!payload.id) throw new WsException('Bad payload');
    if (WatcherClient.isSocketAlreadyWatcher(socket)) throw new WsException('Already connected as a watcher');

    // Checks if the object exists in the database and checks for permissions for projects
    let iotObject: IoTObjectEntity;
    try {
      iotObject = await this.iotObjectService.findOneWithLoadedProjects(payload.id);
    } catch (err) {
      throw new WsException('Id not registered on ALIVEcode');
    }

    // Register client
    const projectRights = iotObject.iotProjects.map(p => p.id);
    const client = new ObjectClient(socket, payload.id, projectRights);
    client.register();

    // Logging
    this.logger.log(`IoTObject connect with id : ${payload.id}`);
  }

  @SubscribeMessage('send_update')
  async send_update(@ConnectedSocket() socket: WebSocket, @MessageBody() payload: IoTUpdateRequestFromObject) {
    if (!payload.id || !payload.projectId || payload.value == null) throw new WsException('Bad payload');

    const object = ObjectClient.getClientBySocket(socket);
    if (!object) throw new WsException('Forbidden');

    if (!payload.projectId.includes('/')) {
      const project = await this.iotProjectService.findOne(payload.projectId);
      if (!project) throw new WsException('No project with id');

      if (project.interactRights !== IOTPROJECT_INTERACT_RIGHTS.ANYONE && !object.hasProjectRights(project.id))
        throw new WsException('Forbidden');

      await this.iotProjectService.updateComponent(project.id, payload.id, payload.value);
    } else {
      await this.iotProjectService.updateComponent(payload.projectId, payload.id, payload.value);
    }

    object.sendUpdate(payload);
  }

  @SubscribeMessage('update')
  async update(@ConnectedSocket() socket: WebSocket, @MessageBody() payload: IoTUpdateDocumentRequestFromObject) {
    if (!payload.projectId || payload.fields == null || typeof payload.fields !== 'object')
      throw new WsException('Bad payload');
    this.objectPermissionFilter(socket, payload.projectId);

    await this.iotProjectService.updateDocument(payload.projectId, payload.fields);
  }

  @SubscribeMessage('get_all')
  async getAll(@ConnectedSocket() socket: WebSocket, @MessageBody() payload: IoTGetAllRequestFromObject) {
    if (!payload.projectId) throw new WsException('Bad payload');
    this.objectPermissionFilter(socket, payload.projectId);

    /*return {
      type: 'get',
      value: await this.iotProjectService.getDocument(payload.projectId),
    };*/
  }

  @SubscribeMessage('listen')
  async listen(@ConnectedSocket() socket: WebSocket, @MessageBody() payload: IoTListenRequestFromObject) {
    if (!payload.projectId && Array.isArray(payload.fields)) throw new WsException('Bad payload');
    const { object } = await this.objectPermissionFilter(socket, payload.projectId);

    const fields = payload.fields.filter(f => typeof f === 'string');
    object.listen(payload.projectId, fields);
  }

  @SubscribeMessage('send_object')
  send_object(@ConnectedSocket() socket: WebSocket, @MessageBody() payload: IoTActionRequestFromWatcher) {
    if (!payload.targetId || !payload.actionId || !payload.value) throw new WsException('Bad payload');

    const watcher = WatcherClient.getClientBySocket(socket);
    if (!watcher) throw new WsException('Forbidden');

    // TOOD : Add sending permission
    //if (!watcher.hasProjectRights(payload.projectId)) throw new WsException('Forbidden');

    watcher.sendActionToObject(payload);
  }

  @SubscribeMessage('send_route')
  async send_route(@ConnectedSocket() socket: WebSocket, @MessageBody() payload: IoTSocketRouteRequestFromObject) {
    if (!payload.routePath || !payload.data || !payload.projectId) throw new WsException('Bad payload');
    this.objectPermissionFilter(socket, payload.projectId);

    const { route } = await this.iotProjectService.findOneWithRoute(payload.projectId, payload.routePath);
    await this.iotProjectService.sendRoute(route, payload.data);
  }
}