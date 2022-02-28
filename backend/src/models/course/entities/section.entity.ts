import { Exclude } from 'class-transformer';
import { IsEmpty, IsNotEmpty, Length, ValidateIf } from 'class-validator';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { CourseElementEntity } from './course_element.entity';

/**
 * Section model in the database
 * @author Enric Soldevila
 */
@Entity()
export class SectionEntity {
  /** Id of the Section (0, 1, 2, ..., n) */
  @PrimaryGeneratedColumn('increment')
  @Exclude({ toClassOnly: true })
  @IsEmpty()
  id: number;

  /** Name of the section */
  @IsNotEmpty()
  @Column({ nullable: false })
  @Length(3, 100)
  name: string;

  /** CourseElements inside the section */
  @OneToMany(() => CourseElementEntity, content => content.sectionParent)
  @IsEmpty()
  elements: CourseElementEntity[];

  /** Display order of the CourseElements */
  @ValidateIf((lst: any) => Array.isArray(lst) && lst.every(el => Number.isInteger(el)))
  @Column({ type: 'json', default: [] })
  @Exclude({ toClassOnly: true })
  @IsEmpty()
  elementsOrder: number[];

  /** CourseElement attached to the section */
  @OneToOne(() => CourseElementEntity, el => el.section, { onDelete: 'CASCADE', cascade: true })
  @JoinColumn()
  @IsEmpty()
  courseElement: CourseElementEntity;
}
