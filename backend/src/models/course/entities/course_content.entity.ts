import { Exclude } from 'class-transformer';
import { IsEmpty } from 'class-validator';
import { Entity, OneToOne, ManyToOne, PrimaryGeneratedColumn, JoinColumn } from 'typeorm';
import { ActivityEntity } from './activity.entity';
import { CourseEntity } from './course.entity';
import { SectionEntity } from './section.entity';

@Entity()
export class CourseElement {
  @PrimaryGeneratedColumn('increment')
  @Exclude({ toClassOnly: true })
  @IsEmpty()
  id: number;

  /*****---Parents (only one at a time)---*****/

  /** If the section is at top level, it contains a course parent */
  @ManyToOne(() => CourseEntity, course => course.elements)
  courseParent: CourseEntity;

  /** If the section is not at top level (inside another section), it contains that parent section */
  @ManyToOne(() => SectionEntity, section => section.elements)
  sectionParent: SectionEntity;

  /*****---------------------------------*****/

  /*****---Elements (only one at a time)---*****/

  /** If the element is an activity **/
  @OneToOne(() => ActivityEntity, act => act.course_element)
  @JoinColumn()
  activity: ActivityEntity;

  /** If the element is a section **/
  @OneToOne(() => SectionEntity, sect => sect.course_elements)
  @JoinColumn()
  section: SectionEntity;

  /*****-----------------------------------*****/
}