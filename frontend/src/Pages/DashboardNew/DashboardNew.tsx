import { DashboardNewProps, StyledDashboard, SwitchTabActions } from './dashboardNewTypes';
import { useContext, useState, useEffect, useReducer } from 'react';
import { UserContext } from '../../state/contexts/UserContext';
import { useHistory } from 'react-router-dom';
import { Col, Row } from 'react-bootstrap';
import api from '../../Models/api';
import FormModal from '../../Components/UtilsComponents/FormModal/FormModal';
import JoinClassroomForm from '../../Components/ClassroomComponents/JoinClassroomForm/JoinClassroomForm';
import { useTranslation } from 'react-i18next';
import { Classroom as ClassroomModel } from '../../Models/Classroom/classroom.entity';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
	faBook,
	faHistory,
	faStar,
	faPlus,
} from '@fortawesome/free-solid-svg-icons';
import ClassroomSection from '../../Components/DashboardComponents/ClassroomSection/ClassroomSection';
import Classroom from '../Classroom/Classroom';
import { useLocation } from 'react-router';
import { useQuery } from '../../state/hooks/useQuery';

const SwitchTabReducer = (
	state: { index: number; classroom?: ClassroomModel },
	action: SwitchTabActions,
): { index: number; classroom?: ClassroomModel } => {
	switch (action.type) {
		case 'recents':
			action.history.push({
				pathname: `/dashboard/recents`,
				search: action.query.toString(),
			});
			return { index: 0 };
		case 'summary':
			action.history.push({
				pathname: `/dashboard/summary`,
				search: action.query.toString(),
			});
			return { index: 1 };
		case 'classrooms':
			if (action.classroom) {
				action.query.set('id', action.classroom.id);
				action.history.push({
					pathname: `/dashboard/classroom?id=${action.classroom.id}`,
					search: action.query.toString(),
				});
				return { index: 2, classroom: action.classroom };
			}
			return SwitchTabReducer(state, {
				type: 'recents',
				history: action.history,
				query: action.query,
			});
		default:
			return { index: 0 };
	}
};

/**
 * Dashboard page that contains all the links to the different pages of the plaform
 *
 * @author MoSk3
 */
const DashboardNew = (props: DashboardNewProps) => {
	const { user } = useContext(UserContext);
	const { t } = useTranslation();
	const [classrooms, setClassrooms] = useState<ClassroomModel[]>([]);
	const [formJoinClassOpen, setFormJoinClassOpen] = useState(false);
	const [hoveringClassroom, setHoveringClassroom] = useState(false);
	useState<ClassroomModel | null>(null);
	const history = useHistory();
	const query = useQuery();
	const { pathname } = useLocation();
	const [tabSelected, setTabSelected] = useReducer(SwitchTabReducer, {
		index: 0,
	});

	useEffect(() => {
		if (pathname.endsWith('summary'))
			setTabSelected({ type: 'summary', history, query });
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (!user) return;
		const getClassrooms = async () => {
			const data = await api.db.users.getClassrooms({
				id: user.id,
			});
			setClassrooms(data);
		};
		getClassrooms();
	}, [user]);

	useEffect(() => {
		if (classrooms && tabSelected.index !== 2) {
			const classroomId = query.get('id');
			const classroom = classrooms.find(c => c.id === classroomId);
			if (!classroom) return;
			setTabSelected({ type: 'classrooms', classroom, history, query });
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [classrooms]);

	const renderTabSelected = () => {
		switch (tabSelected.index) {
			case 0:
				return 'Récent';
			case 1:
				return 'Sommaire';
			case 2:
				if (!tabSelected.classroom) return;
				return (
					<Classroom
						key={tabSelected.classroom.id}
						classroomProp={tabSelected.classroom}
					/>
				);
		}
	};

	return (
		<StyledDashboard>
			<Row className="dashboard-row" xs={1} md={2}>
				<Col className="sidebar no-float" xs={12} md={2} sm={3}>
					<div
						className={
							'sidebar-btn ' +
							(tabSelected.index === 0 ? 'sidebar-selected' : '')
						}
						onClick={() => setTabSelected({ type: 'recents', history, query })}
					>
						<FontAwesomeIcon className="sidebar-icon" icon={faHistory} />
						<label className="sidebar-btn-text">Formations Récentes</label>
					</div>
					<div
						className={
							'sidebar-btn ' +
							(tabSelected.index === 1 ? 'sidebar-selected' : '')
						}
						onClick={() => setTabSelected({ type: 'summary', history, query })}
					>
						<FontAwesomeIcon className="sidebar-icon" icon={faStar} />
						<label className="sidebar-btn-text">Sommaire</label>
					</div>

					<hr />

					<div
						className="sidebar-header"
						onMouseEnter={() => setHoveringClassroom(true)}
						onMouseLeave={() => setHoveringClassroom(false)}
					>
						<FontAwesomeIcon className="sidebar-icon" icon={faBook} />
						<label className="sidebar-header-text">Classes</label>
						{hoveringClassroom && (
							<FontAwesomeIcon className="sidebar-icon-right" icon={faPlus} />
						)}
					</div>

					<hr />

					{classrooms.map((classroom, idx) => (
						<ClassroomSection
							key={idx}
							selected={tabSelected.classroom?.id === classroom.id}
							onClick={() => {
								setTabSelected({
									type: 'classrooms',
									classroom,
									history,
									query,
								});
							}}
							classroom={classroom}
						></ClassroomSection>
					))}
				</Col>
				<Col className="content no-float" xs={12} md={10} sm={9}>
					{renderTabSelected()}
				</Col>
			</Row>
			<FormModal
				title={t('form.join_classroom.title')}
				open={formJoinClassOpen}
				onClose={() => setFormJoinClassOpen(false)}
			>
				<JoinClassroomForm />
			</FormModal>
		</StyledDashboard>
	);
};

export default DashboardNew;