import { LevelCardProps, StyledLevelCard } from './levelCardTypes';
import useRoutes from '../../../state/hooks/useRoutes';
import {
	faHeart,
	faPencilAlt,
	faPlay,
} from '@fortawesome/free-solid-svg-icons';
import LevelButton from './LevelButton/LevelButton';
import { useContext } from 'react';
import { UserContext } from '../../../state/contexts/UserContext';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Badge from '../../UtilsComponents/Badge/Badge';

/**
 * Display of a level that contains all its informations
 * (name, description, tags, creator, etc)
 *
 * @param {boolean} enterEdit if true, when the card is clicked, it goes in editMode
 * @param {LevelAlive | LevelCode | Level} level Level
 *
 * @author MoSk3
 */
const LevelCard = ({ level, enterEdit }: LevelCardProps) => {
	const navigate = useNavigate();
	const { routes } = useRoutes();
	const { user } = useContext(UserContext);
	const { t } = useTranslation();

	return (
		<StyledLevelCard>
			<div className="content">
				<div className="details-section">
					<div className="level-name">{level.name}</div>
					<div className="level-tags">
						Tags:{' '}
						<Badge variant="primary" className="bg-green-500 text-xl">
							{level.getTypeDisplay()}
						</Badge>
						{level.tags.map((t, idx) => (
							<Badge
								variant="primary"
								key={idx}
								className="bg-green-300 text-xl"
							>
								{t}
							</Badge>
						))}
					</div>
					<div className="level-desc">
						{level.description || t('msg.desc.empty')}
					</div>
				</div>
				<div className="info-section">
					<div className="buttons-section">
						{level.creator && level.creator.id === user?.id && (
							<LevelButton
								onClick={() =>
									navigate(
										routes.auth.level_edit.path.replace(':levelId', level.id),
									)
								}
								bgColor="var(--secondary-color)"
								color="white"
								icon={faPencilAlt}
								size="2x"
							/>
						)}
						<LevelButton
							bgColor="rgb(255, 58, 58)"
							color="white"
							icon={faHeart}
							size="2x"
						/>
						<LevelButton
							onClick={() =>
								enterEdit
									? navigate(
											routes.auth.level_edit.path.replace(':levelId', level.id),
									  )
									: navigate(
											routes.auth.level_play.path.replace(':levelId', level.id),
									  )
							}
							left="2px"
							bgColor="var(--third-color)"
							color="white"
							icon={faPlay}
							size="2x"
						/>
					</div>
				</div>
			</div>
			<div className="footer">
				<div>
					{t('msg.creator')}:{' '}
					{level.creator
						? level.creator.getDisplayName()
						: t('msg.deleted_user')}
				</div>
				<div>
					{t('msg.creation_date')}: {level.creationDate.toLocaleString()}
				</div>
				<div>
					{t('msg.update_date')}: {level.creationDate.toLocaleString()}
				</div>
			</div>
		</StyledLevelCard>
	);
};

export default LevelCard;
