import { CourseLayoutActivityProps } from './courseLayoutTypes';
import { useContext } from 'react';
import Activity from '../Activities/Activity';
import { useTranslation } from 'react-i18next';
import Modal from '../../UtilsComponents/Modal/Modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExpandAlt, faUserGraduate } from '@fortawesome/free-solid-svg-icons';
import { CourseContext } from '../../../state/contexts/CourseContext';

/**
 * Useful component to show an activity (currently empty)
 *
 * @param courseElement
 *
 * @author Mathis Laroche
 */
const CourseLayoutActivity = ({ courseElement }: CourseLayoutActivityProps) => {
	const { t } = useTranslation();
	const { tab, setTab } = useContext(CourseContext);

	return (
		<>
			<div
				className="bg-[color:var(--bg-shade-one-color)] rounded-sm ml-4 pr-2 text-[color:var(--bg-shade-four-color)] font-bold cursor-pointer hover:bg-[color:var(--bg-shade-three-color)] hover:[color:var(--fg-shade-four-color)]"
				onClick={() =>
					courseElement.activity !== undefined &&
					setTab({ openedActivity: courseElement })
				}
			>
				<FontAwesomeIcon icon={faExpandAlt} className="mx-2" />
				{t('course.activity.open')}
			</div>
			<Modal
				key={courseElement?.activity?.id + tab.tab}
				size="lg"
				open={tab.openedActivity === courseElement}
				setOpen={(state: boolean) => !state && setTab({ openedActivity: null })}
				centered
				hideTitle
				hideFooter
				closeCross
				dialogClassName="rounded-[3px] h-full"
				backdropClassName="bg-[color:black] opacity-50"
				topBar={
					<div className="p-2 pb-0 w-full bg-[color:var(--background-color)]">
						<div
							className="w-fit rounded-sm p-1 pl-0 pr-2 [color:var(--fg-shade-three-color)] font-bold cursor-pointer hover:bg-[color:var(--bg-shade-one-color)]"
							onClick={() => setTab({ tab: 'view' })}
						>
							<FontAwesomeIcon icon={faUserGraduate} className="mx-2" />
							{t('course.activity.open_in_student_view')}
						</div>
					</div>
				}
			>
				<div className="h-full">
					<Activity editMode courseElement={courseElement} />
				</div>
			</Modal>
		</>
	);
};

export default CourseLayoutActivity;
