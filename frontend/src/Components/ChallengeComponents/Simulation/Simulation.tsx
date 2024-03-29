import FillContainer from '../../UtilsComponents/FillContainer/FillContainer';
import { sketch } from './Sketch/simulation/sketch';
import { SimulationProps, StyledSimulation } from './simulationTypes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExpand } from '@fortawesome/free-solid-svg-icons';
import $ from 'jquery';
import LoadingScreen from '../../UtilsComponents/LoadingScreen/LoadingScreen';
import { useState, useCallback, useRef, useEffect, useContext } from 'react';
import Modal from '../../UtilsComponents/Modal/Modal';
import { useTranslation } from 'react-i18next';
import FormModal from '../../UtilsComponents/FormModal/FormModal';
import ConnectCarForm from '../ConnectCarForm/ConnectCarForm';
import { ReactP5Wrapper } from 'react-p5-wrapper';
import { useForceUpdate } from '../../../state/hooks/useForceUpdate';
import { ThemeContext } from '../../../state/contexts/ThemeContext';

/**
 * Simulation component that draws the car and make it functionnal
 *
 * @param {(s: any) => void} init init function that has the generated sketch as an argument
 *
 * @author Ecoral360
 * @author Enric Soldevila
 */
const Simulation = ({
	init,
	onChange,
	id,
	stopExecution,
	setShowConfetti,
}: SimulationProps) => {
	const [loading, setLoading] = useState(true);
	const [loseModalOpen, setLoseModalOpen] = useState(false);
	const [loseDescripton, setLoseDescription] = useState('');
	const [winModalOpen, setWinModalOpen] = useState(false);
	const [connectModalOpen, setConnectModalOpen] = useState(false);
	const [deathGif, setDeathGif] = useState<string>();
	const sketchRef = useRef<any>(null);
	const { t } = useTranslation();
	const { theme } = useContext(ThemeContext);
	const forceUpdate = useForceUpdate();

	useEffect(() => {
		forceUpdate();
		return () => {
			sketchRef.current && sketchRef.current.cleanup();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		sketchRef.current && sketchRef.current.cleanup();
		setLoading(true);
	}, [id]);

	const onLose = useCallback(
		(death_gif: string, msg: string) => {
			setDeathGif(death_gif);
			setLoseDescription(msg);
			setLoseModalOpen(true);
			stopExecution();
		},
		[stopExecution],
	);

	const onWin = useCallback(() => {
		setWinModalOpen(true);
		setShowConfetti(true);
		stopExecution();
	}, [stopExecution, setShowConfetti]);

	const onConnectCar = useCallback(() => {
		setConnectModalOpen(true);
	}, []);

	return (
		<StyledSimulation>
			<div className="h-full w-full" id={id}>
				<FontAwesomeIcon
					className="absolute top-2 right-2 zoom-button"
					icon={faExpand}
					size="2x"
					color="black"
				/>
				{$(`#${id}`).length ? (
					<>
						<ReactP5Wrapper
							className="w-full h-full bg-white"
							fullscreenDiv="fullscreen-div"
							canvasDiv={$(`#${id}`)}
							zoomButton={''}
							sketch={sketch}
							onChange={onChange}
							onWin={onWin}
							onLose={onLose}
							onConnectCar={onConnectCar}
							init={(s: any) => {
								sketchRef.current = s;
								setLoading(false);
								init(s);
							}}
						/>
						{loading && <LoadingScreen bg={theme.color.background} relative />}

						{/* Div for removing the default p5 loading message*/}
						<div id="p5_loading"></div>
					</>
				) : (
					<LoadingScreen relative />
				)}
			</div>
			<FillContainer className="fullscreen-div" startAtTop />
			<Modal
				title={t('simulation.modal.lose')}
				open={loseModalOpen}
				setOpen={setLoseModalOpen}
				hideCloseButton
				centered
				centeredText
				submitText={t('simulation.modal.retry')}
			>
				<img alt="lose gif" src={deathGif} height="200px" />
				<br />
				{t(loseDescripton)}
			</Modal>
			<Modal
				title={t('simulation.modal.win')}
				open={winModalOpen}
				setOpen={bool => {
					if (!bool) {
						setWinModalOpen(false);
						setShowConfetti(false);
					}
				}}
				hideCloseButton
				centered
				centeredText
				submitText={t('simulation.modal.continue')}
			>
				🎉🎉🎉
			</Modal>
			<FormModal
				open={connectModalOpen}
				title={t('simulation.modal.connect_car.title')}
				hideFooter
				setOpen={setConnectModalOpen}
			>
				<ConnectCarForm setOpen={setConnectModalOpen} />
			</FormModal>
		</StyledSimulation>
	);
};

export default Simulation;
