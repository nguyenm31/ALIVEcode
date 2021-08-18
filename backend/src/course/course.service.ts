import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CourseEntity } from './entities/course.entity';
import { Repository } from 'typeorm';
import { ProfessorEntity } from '../user/entities/professor.entity';
import { SectionEntity } from './entities/section.entity';

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(CourseEntity) private courseRepository: Repository<CourseEntity>,
    @InjectRepository(SectionEntity) private sectionRepository: Repository<SectionEntity>,
  ) {}

  async create(professor: ProfessorEntity, createCourseDto: CourseEntity) {
    const course = this.courseRepository.create(createCourseDto);
    course.creator = professor;
    return await this.courseRepository.save(course);
  }

  async findAll() {
    return await this.courseRepository.find();
  }

  async findOne(id: string) {
    if (!id) throw new HttpException('Bad request', HttpStatus.BAD_REQUEST);
    const course = await this.courseRepository.findOne(id);
    if (!course) throw new HttpException('Course not found', HttpStatus.NOT_FOUND);
    return course;
  }

  async update(id: string, updateCourseDto: CourseEntity) {
    return await this.courseRepository.update(id, updateCourseDto);
  }

  async remove(course: CourseEntity) {
    return await this.courseRepository.remove(course);
  }

  async findOneWithSections(courseId) {
    const course = await this.courseRepository.findOne(courseId, { relations: ['sections'] });
    if (!course) throw new HttpException('Course not found', HttpStatus.NOT_FOUND);
    return course;
  }

  async createSection(courseId: string, createSectionDTO: SectionEntity) {
    const course = await this.findOneWithSections(courseId);

    const section = this.sectionRepository.create(createSectionDTO);
    await this.sectionRepository.save(section);

    course.sections.push(section);
    this.courseRepository.save(course);
    return section;
  }

  async getSections(courseId: string) {
    const course = await this.findOneWithSections(courseId);
    return course.sections;
  }
}