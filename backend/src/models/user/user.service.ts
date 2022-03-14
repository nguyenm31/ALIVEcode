import { Injectable, HttpException, HttpStatus, Scope, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { StudentEntity, ProfessorEntity } from './entities/user.entity';
import { UserEntity } from './entities/user.entity';
import { compare, hash } from 'bcryptjs';
import { Response } from 'express';
import { createAccessToken, setRefreshToken, createRefreshToken } from './auth';
import { verify } from 'jsonwebtoken';
import { AuthPayload } from '../../utils/types/auth.payload';
import { REQUEST } from '@nestjs/core';
import { ClassroomEntity } from '../classroom/entities/classroom.entity';
import { IoTProjectEntity } from '../iot/IoTproject/entities/IoTproject.entity';
import { IoTObjectEntity } from '../iot/IoTobject/entities/IoTobject.entity';
import { ChallengeEntity } from '../challenge/entities/challenge.entity';
import { CourseEntity } from '../course/entities/course.entity';
import { MyRequest } from '../../utils/guards/auth.guard';
import { CourseHistoryEntity } from '../course/entities/course_history.entity';
import { NameMigrationDTO } from './dto/name_migration.dto';
import { ResourceEntity } from '../resource/entities/resource.entity';

@Injectable({ scope: Scope.REQUEST })
export class UserService {
  [x: string]: any;
  constructor(
    @InjectRepository(UserEntity) private userRepository: Repository<UserEntity>,
    @InjectRepository(ProfessorEntity)
    private professorRepository: Repository<ProfessorEntity>,
    @InjectRepository(StudentEntity) private studentRepository: Repository<StudentEntity>,
    @InjectRepository(ClassroomEntity) private classroomRepository: Repository<ClassroomEntity>,
    @InjectRepository(CourseEntity) private courseRepository: Repository<CourseEntity>,
    @InjectRepository(CourseHistoryEntity) private courseHistoryRepo: Repository<CourseHistoryEntity>,
    @InjectRepository(ResourceEntity) private resourceRepo: Repository<ResourceEntity>,
    @InjectRepository(IoTProjectEntity) private iotProjectRepository: Repository<IoTProjectEntity>,
    @InjectRepository(IoTObjectEntity) private iotObjectRepository: Repository<IoTObjectEntity>,
    @InjectRepository(ChallengeEntity) private challengeRepo: Repository<ChallengeEntity>,
    @Inject(REQUEST) private req: MyRequest,
  ) {}
  async createStudent(createStudentDto: UserEntity) {
    const hashedPassword = await hash(createStudentDto.password, 12);
    createStudentDto.password = hashedPassword;

    try {
      return await this.studentRepository.save(createStudentDto);
    } catch (err) {
      if ((err as any).detail.includes('Key (email)='))
        throw new HttpException('This email is already in use', HttpStatus.CONFLICT);
    }
  }

  async createProfessor(createProfessorDto: ProfessorEntity) {
    const hashedPassword = await hash(createProfessorDto.password, 12);
    createProfessorDto.password = hashedPassword;

    try {
      const professor = await this.professorRepository.save(createProfessorDto);
      return professor;
    } catch (err) {
      if ((err as any).detail.includes('Key (email)='))
        throw new HttpException('This email is already in use', HttpStatus.CONFLICT);
    }
  }

  async login(email: string, password: string, res: Response) {
    const user = await this.findByEmail(email);

    if (!user) {
      throw 'Error';
    }

    const valid = await compare(password, user.password);
    if (!valid) {
      throw 'Error';
    }

    setRefreshToken(res, createRefreshToken(user));

    return {
      accessToken: createAccessToken(user),
    };
  }

  logout(res: Response) {
    setRefreshToken(res, '');
    return {};
  }

  async refreshToken(res: Response) {
    const req = this.req;

    const refreshToken = req.cookies.wif;
    if (!refreshToken) throw new HttpException('No credentials were provided', HttpStatus.UNAUTHORIZED);

    let payload: AuthPayload;

    try {
      payload = verify(refreshToken, process.env.REFRESH_TOKEN_SECRET_KEY) as AuthPayload;
    } catch {
      throw new HttpException('Invalid Credentials', HttpStatus.UNAUTHORIZED);
    }
    if (!payload) throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);

    const user = await this.findById(payload.id);
    if (!user) throw new HttpException('', HttpStatus.UNAUTHORIZED);

    setRefreshToken(res, createRefreshToken(user));

    return {
      accessToken: createAccessToken(user),
    };
  }

  findAll() {
    return this.userRepository.find({ relations: ['classrooms'] });
  }

  findAllProfs() {
    return this.professorRepository.find();
  }

  findAllStudents() {
    return this.studentRepository.find();
  }

  async findByEmail(email: string) {
    return await this.userRepository.findOne({ where: { email: email } });
  }

  async findById(id: string) {
    const user = await this.userRepository.findOne(id);
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    return user;
  }

  async nameMigration(userId: string, nameMigrationDto: NameMigrationDTO) {
    return await this.studentRepository.save({ id: userId, oldStudentName: null, ...nameMigrationDto });
  }

  async update(userId: string, updateUserDto: UserEntity) {
    return await this.userRepository.save({ id: userId, ...updateUserDto });
  }

  remove(user: UserEntity) {
    return this.userRepository.remove(user);
  }

  async getClassrooms(user: UserEntity) {
    if (user instanceof ProfessorEntity) return await this.classroomRepository.find({ where: { creator: user } });
    if (user instanceof StudentEntity)
      return (await this.studentRepository.findOne(user.id, { relations: ['classrooms'] })).classrooms;
    return [];
  }

  async getCourses(user: UserEntity) {
    if (user instanceof ProfessorEntity) return await this.courseRepository.find({ where: { creator: user } });
    if (user instanceof StudentEntity)
      return (
        await this.studentRepository.findOne(user.id, { relations: ['classrooms', 'classrooms.courses'] })
      ).classrooms.flatMap(c => c.courses);
    return [];
  }

  async getRecentCourses(user: UserEntity) {
    const courses = await this.courseHistoryRepo
      .createQueryBuilder('course_history')
      .leftJoinAndSelect('course_history.course', 'course')
      .leftJoinAndSelect('course_history.user', 'user')
      .where('user.id = :userId', { userId: user.id })
      .orderBy('course_history.lastInteraction', 'DESC')
      .getMany();

    return courses.map(c => c.course);
  }

  async accessCourse(user: UserEntity, course: CourseEntity) {
    let courseHistory = await this.courseHistoryRepo
      .createQueryBuilder('course_history')
      .leftJoinAndSelect('course_history.course', 'course')
      .leftJoinAndSelect('course_history.user', 'user')
      .where('course.id = :courseId', { courseId: course.id })
      .andWhere('user.id = :userId', { userId: user.id })
      .getOne();
    if (!courseHistory) {
      courseHistory = await this.courseHistoryRepo.save({
        user,
        course,
        lastInteraction: new Date(),
      });
    } else {
      courseHistory.lastInteraction = new Date();
      await this.courseHistoryRepo.save(courseHistory);
    }
  }

  async getResources(user: ProfessorEntity) {
    return await this.resourceRepo.find({ where: { creator: user }, order: { updateDate: 'DESC' } });
  }

  async getIoTProjects(user: UserEntity) {
    return await this.iotProjectRepository.find({ where: { creator: user } });
  }

  async getIoTObjects(user: UserEntity) {
    return await this.iotObjectRepository.find({ where: { creator: user } });
  }
  async getResults(user: UserEntity) {
    return await this.userRepository.find({ where: { id: user } });
  }
  async getChallenges(user: UserEntity, query: string) {
    return await this.challengeRepo.find({
      where: { creator: user, name: ILike(`%${query ?? ''}%`) },
      order: {
        creationDate: 'DESC',
        name: 'ASC',
      },
    });
  }
}
