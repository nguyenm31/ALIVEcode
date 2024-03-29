import { ChallengeAIProps, StyledAliveChallenge } from './challengeAITypes';
import { useEffect, useState, useContext, useRef, useMemo } from 'react';
import LineInterface from '../../../Components/ChallengeComponents/LineInterface/LineInterface';
import { UserContext } from '../../../state/contexts/UserContext';
import Cmd from '../../../Components/ChallengeComponents/Cmd/Cmd';
import ChallengeAIExecutor from './ChallengeAIExecutor';
import useCmd from '../../../state/hooks/useCmd';
import { ChallengeAI as ChallengeAIModel } from '../../../Models/Challenge/challenges/challenge_ai.entity';
import dataAI from './dataAI.json';
import ChallengeTable from '../../../Components/ChallengeComponents/ChallengeTable/ChallengeTable';
import ChallengeGraph from '../../../Components/ChallengeComponents/ChallengeGraph/ChallengeGraph';
import PolyOptimizer from './artificial_intelligence/PolyOptmizer';
import RegressionOptimizer from './artificial_intelligence/RegressionOptimizer';
import DataTypes from '../../../Components/ChallengeComponents/ChallengeGraph/DataTypes';
import PolyRegression from '../../../Components/ChallengeComponents/ChallengeGraph/PolyRegression';
import { ChallengeContext } from '../../../state/contexts/ChallengeContext';
import { useForceUpdate } from '../../../state/hooks/useForceUpdate';
import ChallengeToolsBar from '../../../Components/ChallengeComponents/ChallengeToolsBar/ChallengeToolsBar';
import { NeuralNetwork } from './artificial_intelligence/ai_models/ai_neural_networks/NeuralNetwork';
import { ActivationFunction } from './artificial_intelligence/ai_functions/Function';
import { Matrix } from './artificial_intelligence/AIUtils';
import { useAlert } from 'react-alert';

/**
 * Ai challenge page. Contains all the components to display and make the ai challenge functionnal.
 *
 * @param {ChallengeAIModel} challenge ai challenge object
 * @param {boolean} editMode if the challenge is in editMode or not
 * @param {ChallengeProgression} progression the challenge progression of the current user
 * @param {string} initialCode the initial code of the challenge
 * @param {(challenge: ChallengeAIModel) => void} setChallenge callback used to modify the challenge in the parent state
 * @param {(progression: ChallengeProgression) => void} setProgression callback used to modify the challenge progression in the parent state
 *
 * @author Félix Jobin, Enric Soldevila, Mathis Laroche
 */
const ChallengeAI = ({ initialCode }: ChallengeAIProps) => {
	const { user } = useContext(UserContext);
	const {
		challenge: challengeUntyped,
		executor: executorUntyped,
		editMode,
		progression,
		setProgression,
		saveChallengeTimed,
		saveProgressionTimed,
		askForUserInput,
	} = useContext(ChallengeContext);
	const challenge = challengeUntyped as ChallengeAIModel;
	const executor =
		executorUntyped as React.MutableRefObject<ChallengeAIExecutor | null>;

	const forceUpdate = useForceUpdate();
	const [cmdRef, cmd] = useCmd();
	const alert = useAlert();

	executor.current = useMemo(
		() =>
			(executor.current = new ChallengeAIExecutor(
				{
					createAndShowReg,
					showDataCloud,
					resetGraph,
					optimizeRegression,
					evaluate: (x: number) => evaluate(x),
					costMSE: () => costMSE(),
					showRegression,
					testNeuralNetwork,
				},
				challenge.name,
				askForUserInput,
				alerts,
			)),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[challenge?.id, user],
	);

	const lineInterfaceContentChanges = (content: any) => {
		if (executor.current) executor.current.lineInterfaceContent = content;
		if (!editMode && progression) {
			progression.data.code = content;
			const updatedProgression = progression;
			setProgression(updatedProgression);
			saveProgressionTimed();
		}
	};

	useEffect(() => {
		if (!cmd) return forceUpdate();
		if (executor.current) executor.current.cmd = cmd;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [cmd]);

	//Set the data for the challenge
	const [data] = useState(dataAI);
	let allFuncs = useRef<PolyRegression[]>([]);
	let lastFunc = useRef<PolyRegression>();

	//The dataset of the prototype AI course
	const mainDataset: DataTypes = {
		type: 'scatter',
		label: "Distance parcourue en fonction de l'énergie",
		data: data,
		backgroundColor: 'var(--contrast-color)',
		borderWidth: 1,
	};

	//The initial dataset of any course, which is no data
	const initialDataset: DataTypes = Object.freeze({
		type: 'scatter',
		label: "Distance parcourue en fonction de l'énergie",
		data: [{}],
		backgroundColor: 'var(--contrast-color)',
		borderWidth: 1,
	});
	let datasets = useRef([initialDataset, initialDataset]);
	const [chartData, setChartData] = useState({ datasets: [initialDataset] });

	/**
	 * Resets the dataset array and the data shown on the graph.
	 */
	function resetGraph() {
		datasets.current = [initialDataset, initialDataset];
		allFuncs.current = [];
		setChart();
	}

	/**
	 * Sets the chartData datasets with the datasets array.
	 */
	function setChart() {
		setChartData({ datasets: [...datasets.current] });
	}

	/**
	 * Adds a new datasets to the dataset array.
	 * @param newData the new dataset to add.
	 */
	function setDataOnGraph(newData: DataTypes): void {
		if (datasets.current[0] === initialDataset) {
			datasets.current = [newData];
		} else datasets.current[1] = newData;
		setChart();
	}

	//-------------------------- Alivescript functions ----------------------------//

	/**
	 * Sets the data of the graph to the challenge's data and displays it on the screen
	 */
	function showDataCloud(): void {
		setDataOnGraph(mainDataset);
	}

	/**
	 * Replaces the func with a new one with the specified parameters.
	 * @param a the param a of a polynomial regression.
	 * @param b the param b of a polynomial regression.
	 * @param c the param c of a polynomial regression.
	 * @param d the param d of a polynomial regression.
	 */
	function createRegression(a: number, b: number, c: number, d: number) {
		lastFunc.current = new PolyRegression(a, b, c, d);
		allFuncs.current.push(lastFunc.current);
	}

	/**
	 * Generates the latest regression's points and shows them on the graph.
	 */
	function showRegression() {
		const points = lastFunc.current!.generatePoints();
		setDataOnGraph(points);
	}

	/**
	 * Creates the new Regression and displays it on the graph.
	 * @param a the param a of a polynomial regression.
	 * @param b the param b of a polynomial regression.
	 * @param c the param c of a polynomial regression.
	 * @param d the param d of a polynomial regression.
	 */
	function createAndShowReg(a: number, b: number, c: number, d: number): void {
		createRegression(a, b, c, d);
		showRegression();
	}

	/**
	 * Calculates the MSE cost for the current regression compared to the dataset of the challenge.
	 * @returns the calculated cost.
	 */
	function costMSE(): string {
		setDataOnGraph(mainDataset);
		showRegression();
		return 'Erreur du modèle : ' + lastFunc.current!.computeMSE(data);
	}

	/**
	 * Creates a new Regression that fits as close as possible the data and shows it on
	 * the graph.
	 * @param lr the learning rate for the optimization algorithm.
	 */
	function optimizeRegression(lr: number, epoch: number): string | void {
		if (!lastFunc.current) return;
		const optimizer: PolyOptimizer = new PolyOptimizer(
			lastFunc.current,
			lr,
			epoch,
			RegressionOptimizer.costMSE,
		);
		lastFunc.current = optimizer.optimize(data);
		showRegression();
		return lastFunc.current.paramsToString();
	}

	/**
	 * Evaluates the model with the value specified and returns the result.
	 * @param x the input of the model.
	 * @returns the output of the model.
	 */
	function evaluate(x: number): number {
		setDataOnGraph(mainDataset);
		showRegression();
		return lastFunc.current!.compute(x);
	}

	// FOR TESTING PURPOSE ONLY, TO BE DELETED WHEN NEURAL NETWORK IMPLEMENTATION WORKS //

	function testNeuralNetwork(cmd: any) {
		const neuronsByLayer: number[] = [2, 2];
		const nbInputs: number = 3;
		const nbOutputs: number = 1;
		const activations: ActivationFunction[] = [
			new ActivationFunction(ActivationFunction.SIGMOID),
			new ActivationFunction(ActivationFunction.RELU),
		];
		const outputAct: ActivationFunction = new ActivationFunction(
			ActivationFunction.RELU,
		);

		const data: Matrix = new Matrix([
			[0.4, 0.03, 0.5, 0.88, 0.1],
			[0.4, 0.03, 0.5, 0.88, 0.1],
			[0.4, 0.03, 0.5, 0.88, 0.1],
		]);

		let myNetwork: NeuralNetwork = new NeuralNetwork(
			neuronsByLayer,
			activations,
			outputAct,
			nbInputs,
			nbOutputs,
		);

		let predictions: Matrix = myNetwork.predict(data);
		predictions.displayInCmd(cmd);
		//cmd?.print(predictions.getRows())
		//cmd?.print(predictions.getColumns())
	}

	// END OF TEST FUNCTION //

	return (
		<>
			<StyledAliveChallenge>
				<div className="h-full flex flex-row">
					{/* Left Side of screen */}
					<div className="w-1/2 h-full flex flex-col">
						{/* Barre d'infos du niveau */}
						<ChallengeToolsBar />
						{/* Interface de code */}
						{editMode ? (
							/* Interface du code avec les tabs */
							<LineInterface
								key="edit-mode"
								hasTabs
								tabs={[
									{
										title: 'Initial Code',
										open: true,
										defaultContent: challenge.initialCode,
										onChange: content => {
											challenge.initialCode = content;
											saveChallengeTimed();
										},
									},
									{
										title: 'Solution',
										open: false,
										defaultContent: challenge.solution,
										onChange: content => {
											challenge.solution = content;
											saveChallengeTimed();
										},
									},
								]}
								handleChange={lineInterfaceContentChanges}
							/>
						) : (
							/* Interface de code sans les tabs */
							<LineInterface
								key="play-mode"
								initialContent={initialCode}
								handleChange={lineInterfaceContentChanges}
							/>
						)}
					</div>

					{/* Right Side of screen 
							Contains the graph and the console
					*/}
					<div className="flex flex-col w-1/2">
						<div className="h-3/5 w-full flex flex-row data-section">
							<div className="w-1/3 h-full">
								<ChallengeTable
									data={data}
									xData="Énergie utilisée (kWh)"
									yData="Distance parcourue (km)"
								/>
							</div>
							<div className="w-2/3 h-full">
								<ChallengeGraph
									data={chartData}
									title="Distance parcourue selon l'énergie utilisée"
									xAxis="Énergie utilisée (kWh)"
									yAxis="Distance parcourue (km)"
								/>
							</div>
						</div>
						<div className="h-2/5 flex-1 command">
							<Cmd ref={cmdRef}></Cmd>
						</div>
					</div>
				</div>
			</StyledAliveChallenge>
		</>
	);
};

export default ChallengeAI;
