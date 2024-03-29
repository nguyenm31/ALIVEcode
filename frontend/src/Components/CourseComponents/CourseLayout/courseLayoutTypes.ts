import styled from 'styled-components';
import {
	CourseElement,
	CourseElementActivity,
} from '../../../Models/Course/course_element.entity';
import { Section } from '../../../Models/Course/section.entity';
import { themes } from '../../../state/contexts/ThemeContext';
import { CourseElementSection } from '../../../Models/Course/course_element.entity';
import React from 'react';

export type CourseLayoutElementProps = {
	element: CourseElement;
};

type NavigationOptions = {
	isNavigationOpen: boolean;
	editMode: boolean;
};

export type CourseLayoutSectionProps = {
	courseElement: CourseElementSection;
	isDragged?: boolean;
};

export type CourseLayoutActivityProps = {
	courseElement: CourseElementActivity;
};

export type ButtonAddCourseElementProps = {
	section?: Section;
};

export const StyledCourseLayout = styled.div`
	color: white;

	/* Navbar size */
	height: calc(100vh - 56px);
	width: 100%;
	left: 0;
	box-sizing: content-box;
	position: fixed;

	${({ options }: { options: NavigationOptions }) =>
		options.isNavigationOpen ? `margin-left: 0;` : `margin-left: -20vw;`}

	${({ theme }) =>
		theme.name === themes.light.name &&
		'border-right: 1px solid rgb(161, 161, 161);'}
	border-top-right-radius: 10px;
	border-bottom-right-radius: 10px;
	transition: all 0.35s;
	overflow-y: auto;
	touch-action: auto;
	z-index: 10;

	.course-nav-title {
		padding: 10px 5px 10px 5px;
		font-size: 1.2rem;
		color: var(--foreground-color);
	}
	.course-edit-button {
		display: grid;
		align-items: left;
		grid-template-columns: 5fr 1fr;
	}

	.course-nav-header {
		background-color: var(--primary-color);
	}

	.course-nav-body {
		padding: 15px;
		text-align: left;
	}

	.course-section {
		padding-bottom: 15px;
		padding-top: 15px;
	}

	.course-section-header,
	.course-activity {
		border-radius: 5px;
		transition: 0.2s;
		cursor: pointer;
	}

	.course-section-header {
		font-size: 18px;
		width: 100%;
		padding: 10px;
		background-color: ${({ theme }) => {
			if (theme.name === themes.light.name) return 'var(--secondary-color)';
			if (theme.name === themes.dark.name) return 'var(--primary-color)';
		}};
	}

	.course-section-header-edit {
		display: grid;
		grid-template-columns: ${({ options }: { options: NavigationOptions }) =>
			options.editMode ? '5fr 1fr;' : '1fr;'};
		align-items: center;
	}

	.course-activity {
		width: 100%;
		margin-top: 5px;
		padding: 10px;
		background-color: ${({ theme }) => {
			if (theme.name === themes.light.name) return 'var(--third-color)';
			if (theme.name === themes.dark.name) return 'var(--secondary-color)';
		}};
		display: grid;
		grid-template-columns: ${({ options }: { options: NavigationOptions }) =>
			options.editMode ? '5fr 1fr;' : '1fr;'};
	}

	.course-section-body {
		width: 100%;
	}

	.course-section-header:hover,
	.course-activity:hover {
		background-color: var(--contrast-color);
	}
`;
