import { faUserGraduate } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useContext, useLayoutEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { CourseContext } from '../../../state/contexts/CourseContext';
import useRoutes from '../../../state/hooks/useRoutes';
import ButtonAddCourseElement from './ButtonAddCourseElement';
import CourseLayoutElement from './CourseLayoutElement';
import { Section } from '../../../Models/Course/section.entity';
import { plainToClass } from 'class-transformer';
import LoadingScreen from '../../UtilsComponents/LoadingScreen/LoadingScreen';
import Info from '../../HelpComponents';
import { TutorialContext } from '../../../state/contexts/TutorialContext';

/**
 * Component that handles the layout view of a course
 *
 * @author Mathis Laroche
 */
const CourseLayout = () => {
	const {
		course,
		courseElements,
		isCreator,
		setTab,
		addContent,
		openActivityForm,
	} = useContext(CourseContext);
	const { routes, goTo } = useRoutes();
	const { t } = useTranslation();
	const titleRef = useRef<HTMLDivElement>(null);
	const goToStudentViewRef = useRef<HTMLDivElement>(null);
	const { registerTutorial } = useContext(TutorialContext);

	useLayoutEffect(() => {
		return registerTutorial({
			name: 'CourseLayout',
			targets: [
				{
					infoBox: <Info.Box text={t('help.course_layout.welcome')} />,
				},
				{
					ref: document.getElementById('course-title'),
					infoBox: <Info.Box text={t('help.course_layout.edit_title')} />,
					position: 'bottom center',
				},
				{
					ref: goToStudentViewRef.current,
					infoBox: <Info.Box text={t('help.course_layout.see_student_view')} />,
					position: 'right center',
				},
				{
					ref: document.getElementById('course-view'),
					infoBox: <Info.Box text={t('help.course_layout.see_view')} />,
					position: 'left center',
				},
			],
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [t]);

	if (!course) {
		goTo(routes.auth.dashboard.path);
		return <></>;
	}

	return (
		<div className="w-full h-full overflow-y-auto relative p-6">
			<div className="sticky z-10 right-6 top-0">
				<FontAwesomeIcon
					icon={faUserGraduate}
					forwardedRef={goToStudentViewRef}
					name={t('course.activity.open_in_student_view')}
					size="3x"
					title={t('course.student_view')}
					className="absolute ml-5 hover:cursor-pointer [color:var(--foreground-color)]"
					onClick={() => setTab({ tab: 'view' })}
				/>
			</div>
			<div className="flex flex-col justify-center md:px-52 pl-3 pr-12 min-w-fit w-[100%] whitespace-nowrap">
				<div className="text-center text-2xl mb-4" ref={titleRef}>
					{t('course.layout')}
				</div>
				{!courseElements?.current ? (
					<LoadingScreen />
				) : Object.keys(courseElements.current).length === 0 ? (
					<>
						<label className="text-center">{t('course.empty')}</label>
						<div className="mt-4 flex justify-center">
							{isCreator() && (
								<div className="text-[color:var(--logo-color)] text-center">
									<span
										className="p-2 cursor-pointer rounded-lg transition-all hover:bg-[color:var(--bg-shade-one-color)]"
										onClick={async () => {
											const newSection: Section = plainToClass(Section, {});
											await addContent(
												newSection,
												t('course.section.new_name', { num: 1 }),
											);
										}}
									>
										{t('course.section.new')}
									</span>
									<span className="border-r mx-2 w-1 mt-2 py-1 border-[color:var(--bg-shade-four-color)] " />
									<span
										className="p-2 cursor-pointer rounded-lg transition-all hover:bg-[color:var(--bg-shade-one-color)]"
										onClick={() => {
											openActivityForm();
										}}
									>
										{t('course.activity.new')}
									</span>
								</div>
							)}
						</div>
					</>
				) : (
					<>
						<div
							className="text-left "
							/*onDragEnter={event => {
								const target = event.target as HTMLDivElement;
								if (target?.className === 'course-layout-element') {
									target.style.borderBottom = '2 solid cyan';
									console.log(event);
								}
							}}
							onDragExit={event => {
								const target = event.target as HTMLDivElement;
								if (target?.className === 'course-layout-element') {
									target.style.borderBottom = '';
								}
							}}*/
						>
							{courseElements?.current &&
								course.elementsOrder.map(
									id =>
										id in courseElements.current && (
											<div key={id} className="course-layout-element">
												<CourseLayoutElement
													element={courseElements.current[id]}
												/>
											</div>
										),
								)}
						</div>
						<div className="pb-5">
							{isCreator() && <ButtonAddCourseElement />}
						</div>
					</>
				)}
			</div>
		</div>
	);
};

export default CourseLayout;
