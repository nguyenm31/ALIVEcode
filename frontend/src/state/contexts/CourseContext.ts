import { createContext, MutableRefObject } from 'react';
import { Activity } from '../../Models/Course/activity.entity';
import { Course } from '../../Models/Course/course.entity';
import {
	CourseContent,
	CourseElement,
} from '../../Models/Course/course_element.entity';
import { Section } from '../../Models/Course/section.entity';

export type CourseContextValues = {
	course?: Course;
	section?: MutableRefObject<Section | undefined>;
	activity?: MutableRefObject<Activity | undefined>;
	courseElements?: MutableRefObject<{ [id: number]: CourseElement }>;
	courseEditorMode: 'navigation' | 'layout';
	isNavigationOpen: boolean;
	canEdit: boolean;
	isEditMode: boolean;
	setEditMode: (value: boolean) => void;
	setCourseEditorMode: (value: 'navigation' | 'layout') => void;
	setTitle: (newTitle: string) => Promise<void>;
	loadActivity: (section: Section, activity: Activity) => Promise<any>;
	loadSectionElements: (section: Section) => Promise<any>;
	renameElement: (element: CourseElement, newName: string) => void;
	closeCurrentActivity: () => void;
	saveActivity: (activity: Activity) => Promise<void>;
	saveActivityContent: (data: string) => Promise<void>;
	setIsNavigationOpen: (bool: boolean) => void;
	addContent: (
		content: CourseContent,
		sectionParent?: Section,
	) => Promise<void>;
	deleteElement: (element: CourseElement) => Promise<void>;
	moveElement: (
		element: CourseElement,
		newIdx: number,
		newParent: CourseElement,
	) => Promise<void>;
	openSectionForm: (sectionParent?: Section) => void;
	openActivityForm: (sectionParent?: Section) => void;
};

export const CourseContext = createContext<CourseContextValues>({
	canEdit: false,
	isNavigationOpen: true,
	courseEditorMode: 'navigation',
	isEditMode: false,
	setEditMode: (..._) => {},
	setCourseEditorMode: (..._) => {},
	setTitle: async (newTitle: string) => {},
	loadActivity: async (section: Section, activity: Activity) => {},
	closeCurrentActivity: () => {},
	saveActivity: async (activity: Activity) => {},
	saveActivityContent: async (data: string) => {},
	setIsNavigationOpen: async (bool: boolean) => {},
	addContent: async (content: CourseContent, sectionParent?: Section) => {},
	renameElement: (element: CourseElement, newName: string) => {},
	deleteElement: async (element: CourseElement) => {},
	moveElement: async (
		element: CourseElement,
		newIdx: number,
		newParent: CourseElement,
	) => {},
	loadSectionElements: async (section: Section) => {},
	openSectionForm: () => {},
	openActivityForm: () => {},
});
