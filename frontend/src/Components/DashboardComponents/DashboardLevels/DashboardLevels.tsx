import Button from '../../UtilsComponents/Buttons/Button';
import useRoutes from '../../../state/hooks/useRoutes';
import ChallengeList from '../../../Pages/Level/ChallengeList/ChallengeList';
import { useTranslation } from 'react-i18next';

export const DashboardLevels = () => {
	const { routes } = useRoutes();
	const { t } = useTranslation();

	return (
		<div className="h-full p-4">
			<div className="section-title">{t('dashboard.levels.title')}</div>
			<div className="border-b w-1/3 border-[color:var(--bg-shade-four-color)]"></div>
			<div className="flex items-center justify-center pt-8 pb-5 flex-col laptop:flex-row gap-4 laptop:gap-8">
				<Button
					className="w-full tablet:w-[20rem]"
					variant="primary"
					to={routes.auth.challenge_browse.path}
				>
					{t('dashboard.levels.browse_levels')}
				</Button>
				<Button
					className="w-full tablet:w-[20rem]"
					variant="secondary"
					to={routes.auth.challenge_create.path}
				>
					{t('dashboard.levels.create_level')}
				</Button>
			</div>
			<ChallengeList></ChallengeList>
		</div>
	);
};

export default DashboardLevels;
