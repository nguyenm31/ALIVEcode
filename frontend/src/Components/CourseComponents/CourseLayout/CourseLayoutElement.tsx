import { faBars, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useContext, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CourseContext } from '../../../state/contexts/CourseContext';
import AlertConfirm from '../../UtilsComponents/Alert/AlertConfirm/AlertConfirm';
import FormInput from '../../UtilsComponents/FormInput/FormInput';
import CourseLayoutActivity from './CourseLayoutActivity';
import CourseLayoutSection from './CourseLayoutSection';
import { CourseLayoutElementProps } from './courseLayoutTypes';
import {
	CourseElementActivity,
	CourseElementSection,
} from '../../../Models/Course/course_element.entity';

/**
 * Component that wraps a CourseElement to show it properly on the layout view
 *
 * @param element The element wrapped
 *
 * @author Mathis Laroche
 */
const CourseLayoutElement = ({ element }: CourseLayoutElementProps) => {
	const {
		renameElement,
		deleteElement,
		isNewCourseElement,
		setCourseElementNotNew,
	} = useContext(CourseContext);
	const { t } = useTranslation();
	const [confirmDelete, setConfirmDelete] = useState(false);
	const [isRenaming, setIsRenaming] = useState(false);
	const inputRef = useRef<HTMLInputElement>();

	/**
	 * Handles the renaming of an element
	 *
	 * @author Mathis Laroche
	 */
	const rename = async () => {
		if (isNewCourseElement(element)) {
			setCourseElementNotNew(element);
		}
		if (isRenaming) {
			setIsRenaming(false);
		}
		if (
			inputRef.current?.value &&
			inputRef.current.value.trim() !== element.name
		) {
			await renameElement(element, inputRef.current.value.trim());
		}
	};

	return (
		<div className="py-2 pl-2 laptop:pl-3 desktop:pl-4">
			<div className="group text-base flex items-center" onClick={() => {}}>
				<FontAwesomeIcon
					icon={faBars}
					size="lg"
					className="text-[color:var(--foreground-color)] transition-all duration-75 group-hover:cursor-grab group-hover:opacity-50 opacity-0"
				/>
				<div className="ml-2 py-3 rounded-sm border p-[0.2rem] border-[color:var(--bg-shade-four-color)] text-[color:var(--foreground-color)] flex items-center w-full justify-between">
					<div className="flex flex-row">
						{element?.activity && element?.icon ? (
							<FontAwesomeIcon
								icon={element.icon}
								className="[color:var(--bg-shade-four-color)] mr-3 ml-2 mt-1"
							/>
						) : (
							<span className="invisible pl-3" />
						)}
						{isRenaming || isNewCourseElement(element) ? (
							<FormInput
								ref={inputRef as any}
								type="text"
								autoFocus
								onKeyPress={(event: KeyboardEvent) =>
									event.key.toLowerCase() === 'enter' && rename()
								}
								onFocus={() => {
									setIsRenaming(true);
								}}
								onBlur={rename}
								onClick={rename}
								className="bg-[color:var(--background-color)] w-full"
								defaultValue={element.name}
							/>
						) : (
							<div className="flex flex-row">
								<span
									onClick={() => setIsRenaming(true)}
									className={'cursor-pointer'}
								>
									{element.name}
								</span>
								{element.activity && (
									<div className="invisible group-hover:visible">
										<CourseLayoutActivity
											courseElement={element as CourseElementActivity}
										/>
									</div>
								)}
							</div>
						)}
					</div>
					<div>
						<FontAwesomeIcon
							icon={faTrash}
							size="lg"
							className="[color:var(--bg-shade-four-color)] mr-2 hover:[color:red] cursor-pointer invisible group-hover:visible transition-all duration-75 ease-in"
							onClick={() => setConfirmDelete(true)}
						/>
					</div>
				</div>
			</div>
			{element.section && (
				<CourseLayoutSection courseElement={element as CourseElementSection} />
			)}
			<AlertConfirm
				open={confirmDelete}
				title={t('couse.section.delete')}
				setOpen={setConfirmDelete}
				onConfirm={async () => {
					await deleteElement(element);
				}}
				hideFooter
			/>
		</div>
	);
};

export default CourseLayoutElement;
