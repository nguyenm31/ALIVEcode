import React, { createContext, MutableRefObject } from 'react';
import { Activity } from '../../Models/Course/activity.entity';
import { Course } from '../../Models/Course/course.entity';
import {
	CourseContent,
	CourseElement,
	CourseParent,
} from '../../Models/Course/course_element.entity';
import { Section } from '../../Models/Course/section.entity';
import { CourseElementActivity } from '../../Models/Course/course_element.entity';
import {
	CourseTabState,
	SwitchCourseTabActions,
} from '../../Pages/Course/courseTypes';

export type CourseContextValues = {
	course?: Course;
	courseElements?: MutableRefObject<{ [id: number]: CourseElement }>;
	isNewCourseElement: (element: CourseElement) => boolean;
	setCourseElementNotNew: (element: CourseElement) => void;
	isNavigationOpen: boolean;
	tab: CourseTabState;
	setTab: React.Dispatch<SwitchCourseTabActions>;
	setTitle: (newTitle: string) => Promise<void>;
	loadSectionElements: (section: Section) => Promise<any>;
	renameElement: (element: CourseElement, newName: string) => void;
	setIsElementVisible: (element: CourseElement, isVisible: boolean) => void;
	updateActivity: (
		activity: Activity,
		fields: {
			[name in keyof Activity]?: Activity[name];
		},
	) => Promise<void>;
	setIsNavigationOpen: (bool: boolean) => void;
	addContent: (
		content: CourseContent,
		name: string,
		sectionParent?: Section,
	) => Promise<CourseElement | undefined>;
	deleteElement: (element: CourseElement) => Promise<void>;
	moveElement: (
		element: CourseElement,
		newIdx: number,
		newParent: CourseParent,
	) => Promise<void>;
	openActivityForm: (sectionParent?: Section) => void;
	setOpenModalImportResource: (state: boolean) => void;
	removeResourceFromActivity: (activity: Activity) => void;
	loadActivityResource: (activity: Activity) => void;
	getNextActivity: (
		activity: CourseElementActivity,
	) => CourseElementActivity | null;
	getPreviousActivity: (
		activity: CourseElementActivity,
	) => CourseElementActivity | null;
	isCreator: () => boolean;
	forceUpdateCourse: () => void;
};

export const CourseContext = createContext<CourseContextValues>({
	isNavigationOpen: true,
	tab: { tab: 'view', openedSections: [] },
	setCourseElementNotNew: () => {},
	isNewCourseElement: () => false,
	setTab: () => {},
	setTitle: async () => {},
	updateActivity: async () => {},
	setIsNavigationOpen: async () => {},
	addContent: async () => undefined,
	renameElement: () => {},
	setIsElementVisible: () => {},
	deleteElement: async () => {},
	moveElement: async () => {},
	loadSectionElements: async () => {},
	openActivityForm: () => {},
	setOpenModalImportResource: () => {},
	removeResourceFromActivity: () => {},
	loadActivityResource: () => null,
	getNextActivity: () => null,
	getPreviousActivity: () => null,
	isCreator: () => false,
	forceUpdateCourse: () => {},
});
