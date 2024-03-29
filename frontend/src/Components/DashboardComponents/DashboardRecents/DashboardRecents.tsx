import { useContext, useState } from 'react';
import { DashboardContext } from '../../../state/contexts/DashboardContext';
import CourseContainer from '../../UtilsComponents/CourseContainer/CourseContainer';
import { useTranslation } from 'react-i18next';
import { UserContext } from '../../../state/contexts/UserContext';
import Button from '../../UtilsComponents/Buttons/Button';
import { useNavigate } from 'react-router';
import useRoutes from '../../../state/hooks/useRoutes';
import Info from '../../HelpComponents';

export const DashboardRecents = () => {
	const {
		courses: recentCourses,
		setFormJoinClassOpen,
		setOpenFormCreateCourse,
	} = useContext(DashboardContext);
	const { t } = useTranslation();
	const { user } = useContext(UserContext);
	const { routes } = useRoutes();
	const navigate = useNavigate();

	const [timelineOpen, setTimelineOpen] = useState(false);

	return (
		<div className="h-full p-4">
			<div className="section-title flex flex-row justify-between w-1/3">
				{t('dashboard.recents.title')}{' '}
				<Info.Icon
					// onClick={() => setTimelineOpen(true)}
					hoverPopup={{
						position: 'right center',
					}}
				>
					<Info.Box
						useDefaultStyle
						text={t('help.dashboard.views.recent_courses')}
					/>
				</Info.Icon>
			</div>
			<div className="border-b w-1/3 border-[color:var(--bg-shade-four-color)]" />
			{recentCourses && recentCourses.length > 0 ? (
				<>
					{user?.isProfessor() && (
						<Button
							className="!text-sm mt-4"
							variant="primary"
							onClick={() => setOpenFormCreateCourse(true)}
						>
							{t('dashboard.courses.add')}
						</Button>
					)}
					<CourseContainer courses={recentCourses} />
				</>
			) : (
				<div className="w-full h-[calc(100%-2rem)] text-[color:var(--fg-shade-four-color)] text-center flex flex-col items-center justify-center">
					<i>
						{user?.isProfessor()
							? t('dashboard.recents.empty.professor')
							: t('dashboard.recents.empty.student')}
					</i>
					<div className="flex flex-row">
						<Button
							className="!text-xs mt-2"
							variant="primary"
							onClick={() =>
								user?.isProfessor()
									? navigate(routes.auth.create_classroom.path)
									: setFormJoinClassOpen(true)
							}
						>
							{user?.isProfessor()
								? t('dashboard.classrooms.add.professor')
								: t('dashboard.classrooms.add.student')}
						</Button>
						{user?.isProfessor() && (
							<Button
								className="!text-xs mt-2 ml-4"
								variant="primary"
								onClick={() => setOpenFormCreateCourse(true)}
							>
								{t('dashboard.courses.add')}
							</Button>
						)}
					</div>
				</div>
			)}
			<Info.Slides
				open={timelineOpen}
				setOpen={setTimelineOpen}
				title="Recent Courses Help"
			>
				<Info.Slide title="Page 1">
					<span>
						Lorem ipsum dolor sit amet, consectetur adipisicing elit.
						Accusantium distinctio ducimus ipsam modi mollitia nemo odio quos
						reprehenderit sapiente voluptate. Aperiam architecto debitis iste
						nesciunt possimus quis rerum ut veritatis.
					</span>
				</Info.Slide>
				<Info.Slide title="Page 2">
					<span>
						Lorem ipsum dolor sit amet, consectetur adipisicing elit.
						Accusantium distinctio ducimus ipsam modi mollitia nemo odio quos
						reprehenderit sapiente voluptate. Aperiam architecto debitis iste
						nesciunt possimus quis rerum ut veritatis.
					</span>
				</Info.Slide>
			</Info.Slides>
		</div>
	);
};

export default DashboardRecents;
