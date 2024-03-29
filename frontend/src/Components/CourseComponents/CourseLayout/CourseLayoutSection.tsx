import { faCaretDown, faCaretUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Disclosure } from '@headlessui/react';
import { useContext } from 'react';
import { Section } from '../../../Models/Course/section.entity';
import { CourseContext } from '../../../state/contexts/CourseContext';
import LoadingScreen from '../../UtilsComponents/LoadingScreen/LoadingScreen';
import ButtonAddCourseElement from './ButtonAddCourseElement';
import CourseLayoutElement from './CourseLayoutElement';
import { CourseLayoutSectionProps } from './courseLayoutTypes';
import DraggedCourseLayoutElement from './DraggedCourseLayoutElement';

/**
 * Component that shows the section in the layout view and handles different actions like collapsing or
 * expanding its activities and subsections
 *
 * @author Mathis Laroche, Enric Soldevila
 */
const CourseLayoutSection = ({
	courseElement,
	isDragged,
}: CourseLayoutSectionProps) => {
	const section = courseElement.section as Section;
	const { courseElements, isCreator } = useContext(CourseContext);

	return (
		<Disclosure as="div" defaultOpen>
			{({ open }) => (
				<>
					<Disclosure.Button>
						<FontAwesomeIcon
							icon={open ? faCaretDown : faCaretUp}
							size="lg"
							className="pb-1 ml-6 [color:grey]"
						/>
					</Disclosure.Button>
					<Disclosure.Panel className="border-opacity-20 border-[color:grey] border-l ml-7 text-sm border-b pb-2">
						<div id={`section-${section.name}`}>
							{section.elementsOrder === undefined ? (
								<LoadingScreen size="3x" relative />
							) : (
								<></>
							)}
							{section.elementsOrder?.map(
								id =>
									courseElements &&
									id in courseElements.current &&
									(isDragged ? (
										<DraggedCourseLayoutElement
											key={id}
											element={courseElements.current[id]}
										/>
									) : (
										<CourseLayoutElement
											key={id}
											element={courseElements.current[id]}
										/>
									)),
							)}
						</div>
						{isCreator() && <ButtonAddCourseElement section={section} />}
					</Disclosure.Panel>
				</>
			)}
		</Disclosure>
	);
};

export default CourseLayoutSection;
