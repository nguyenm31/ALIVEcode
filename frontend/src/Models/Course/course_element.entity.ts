import { Type, Exclude, Expose } from 'class-transformer';
import { Activity } from './activity.entity';
import { Course } from './course.entity';
import { Section } from './section.entity';

export type CourseContent = Activity | Section;

export type CourseParent = Course | Section;

/**
 * CourseElement model in the database
 * @author Enric Soldevila
 * @author Mathis Laroche
 */
@Exclude()
export class CourseElement {
	/** Id of the CourseElement (0, 1, 2, ..., n) */
	@Expose({ toClassOnly: true })
	id: number;

	/*****---Parents ---*****/

	/** The course that the element belongs to */
	@Expose({ toClassOnly: true })
	@Type(() => Course)
	course: Course;

	/** If the section is not at top level (inside another section), it contains that parent section */
	@Expose({ toClassOnly: true })
	@Type(() => Section)
	sectionParent?: Section;

	/*****---------------------------------*****/

	/*****---Elements (only one at a time)---*****/

	/** If the element is an activity **/
	@Expose({ toClassOnly: true })
	@Type(() => Activity)
	activity?: Activity;

	/** If the element is a section **/
	@Expose({ toClassOnly: true })
	@Type(() => Section)
	section?: Section;

	/*****-----------------------------------*****/

	get name() {
		return this.getName();
	}

	set name(value: string) {
		if (this.section) this.section.name = value;
		else if (this.activity) this.activity.name = value;
	}

	get parent() {
		return this.getParent();
	}

	/**
	 * Check if the element is a section
	 * @returns if the element is a section
	 * @author Mathis Laroche
	 */
	get isSection() {
		return this.section !== undefined;
	}

	initialize() {
		if (this.section) {
			this.section.elements || (this.section.elements = []);
			this.section.elementsOrder || (this.section.elementsOrder = []);
			this.section.courseElement = this;
		} else if (this.activity) {
			this.activity.courseElement = this;
		}
	}

	/**
	 * Get the content of the element (section or activity)
	 * @returns The content of the activity
	 * @author Mathis Laroche
	 */
	getContent(): CourseContent {
		if (!(this.activity && this.section))
			throw new TypeError(
				"The CourseElement doesn't have an activity or a section",
			);
		return this.activity || this.section;
	}

	/**
	 * Get the parent of the element (course or section)
	 * @returns The parent of the element
	 * @author Mathis Laroche
	 */
	getParent(): CourseParent {
		if (!(this.course && this.sectionParent))
			throw new TypeError("The CourseElement doesn't have a parent");
		return this.sectionParent || this.course;
	}

	/**
	 * Gets the name of the element, that is either the name of the section or the name of the activity
	 * @returns the name of the element
	 * @author Mathis Laroche
	 */
	getName(): string {
		return this.activity?.name || this.section!.name;
	}

	/**
	 * Check if the element is an activity
	 * @returns if the element is an activity
	 * @author Mathis Laroche
	 */
	isActivity(): boolean {
		return this.activity !== undefined;
	}
}
