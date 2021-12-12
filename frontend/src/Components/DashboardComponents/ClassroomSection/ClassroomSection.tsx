import { ClassroomSectionProps } from './classroomSectionTypes';
import { useState, useEffect } from 'react';
import {
	faAngleDown,
	faAngleUp,
	faCalculator,
	faCode,
	faFlask,
	faProjectDiagram,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useForceUpdate } from '../../../state/hooks/useForceUpdate';
import CourseSection from '../CourseSection/CourseSection';
import { CLASSROOM_SUBJECT } from '../../../Models/Classroom/classroom.entity';
import { formatTooLong } from '../../../Types/formatting';
import { useLocation, useHistory } from 'react-router';
import { useQuery } from '../../../state/hooks/useQuery';

const ClassroomSection = ({
	classroom,
	onClick,
	selected,
}: ClassroomSectionProps) => {
	const [isHovering, setIsHovering] = useState(false);
	const [isOpen, setIsOpen] = useState(false);
	const forceUpdate = useForceUpdate();
	const location = useLocation();
	const history = useHistory();
	const query = useQuery();

	useEffect(() => {
		setIsOpen(query.get('open')?.includes(classroom.id) ?? false);
	}, [classroom.id, query]);

	useEffect(() => {
		if (isOpen && !classroom.courses) {
			const loadCourses = async () => {
				await classroom.getCourses();
				forceUpdate();
			};

			loadCourses();
		}
	}, [classroom, forceUpdate, isOpen]);

	let icon = faCode;
	switch (classroom.subject) {
		case CLASSROOM_SUBJECT.INFORMATIC:
			icon = faCode;
			break;
		case CLASSROOM_SUBJECT.SCIENCE:
			icon = faFlask;
			break;
		case CLASSROOM_SUBJECT.MATH:
			icon = faCalculator;
			break;
		case CLASSROOM_SUBJECT.AI:
			icon = faProjectDiagram;
			break;
	}

	return (
		<>
			<div
				className={'sidebar-classroom ' + (selected ? 'sidebar-selected' : '')}
				onMouseEnter={() => setIsHovering(true)}
				onMouseLeave={() => setIsHovering(false)}
				onClick={onClick}
			>
				<FontAwesomeIcon className="sidebar-icon" icon={icon} />
				<label className="sidebar-classroom-text">
					{formatTooLong(classroom.name, 25)}
				</label>
				{isHovering && (
					<FontAwesomeIcon
						className="sidebar-icon-right"
						onClick={e => {
							e.stopPropagation();
							setIsOpen(!isOpen);

							// Update Search query
							if (isOpen) {
								const q = query.get('open');
								if (q) {
									const ids = q.split('_');
									const newQuery = ids
										.filter(id => id !== classroom.id)
										.join('_');
									if (newQuery.length <= 0) query.delete('open');
									else query.set('open', newQuery);
								}
							} else {
								if (query.has('open'))
									query.set('open', query.get('open') + '_' + classroom.id);
								else query.set('open', classroom.id);
							}
							history.push({
								pathname: location.pathname,
								search: query.toString(),
							});
						}}
						icon={isOpen ? faAngleUp : faAngleDown}
					/>
				)}
			</div>
			{isOpen &&
				(classroom.courses && classroom.courses?.length > 0 ? (
					classroom.courses.map((course, idx) => (
						<CourseSection key={idx} course={course}></CourseSection>
					))
				) : (
					<div className="sidebar-course">
						<label className="sidebar-course-text no-cursor">
							<i>No Courses</i>
						</label>
					</div>
				))}
			<hr />
		</>
	);
};

export default ClassroomSection;
