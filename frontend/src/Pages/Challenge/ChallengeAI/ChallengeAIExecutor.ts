import ChallengeCodeExecutor from '../ChallengeCode/ChallengeCodeExecutor';
import { typeAskForUserInput } from '../challengeTypes';
import { AlertManager } from 'react-alert';

// TODO: robotConnected

class ChallengeAIExecutor extends ChallengeCodeExecutor {
	private executableFuncs: any;

	constructor(
		executables: { [key: string]: CallableFunction },
		challengeName: string,
		askForUserInput: typeAskForUserInput,
		alert?: AlertManager,
	) {
		super(challengeName, askForUserInput, alert);

		this.doBeforeRun(() => {
			this.executableFuncs.resetGraph();
		});

		this.doAfterStop(() => {
			this.executableFuncs.resetGraph();
		});

		this.registerActions([
			
			{
				actionId: 800,
				action: {
					label: 'Create Regression',
					type: 'NORMAL',
					apply: params => {
						if (params.every((param: any) => typeof param === 'number')) {
							this.executableFuncs.createAndShowReg(
								params[0],
								params[1],
								params[2],
								params[3],
							);
						}
					},
				},
			},
			{
				actionId: 801,
				action: {
					label: 'Optimize Regression',
					type: 'NORMAL',
					apply: params => {
						if (params.every((param: any) => typeof param === 'number')) {
							const paramRegression = this.executableFuncs.optimizeRegression(
								params[0],
								params[1],
							);
							if (paramRegression !== undefined) {
								this.cmd?.print('Nouveaux paramètres de la régression :');
								this.cmd?.print(paramRegression);
							}
						}
					},
				},
			},
			{
				actionId: 802,
				action: {
					label: 'Show Data',
					type: 'NORMAL',
					apply: () => this.executableFuncs.showDataCloud(),
				},
			},

			{
				actionId: 803,
				action: {
					label: 'Evaluate',
					type: 'GET',
					apply: (params, _, response) => {
						if (typeof params[0] === 'number') {
							response?.push(this.executableFuncs.evaluate(params[0]));
							console.log("Response sent : " + this.executableFuncs.evaluate(params[0]));
							//this.cmd?.print("Modèle évalué avec " + params[0] + " => " + this.executableFuncs.evaluate(params[0]));

							this.perform_next();
						}
							
					},
				},
			}, 
			
			{
				actionId: 804,
				action: {
					label: 'Cost Function',
					type: 'NORMAL',
					apply: () => {
						const out = this.executableFuncs.costMSE();
						this.cmd?.print(out);
					},
				},
			},
			{
				actionId: 805,
				action: {
					label: 'Test ANN',
					type: 'NORMAL',
					apply: () => {
						this.executableFuncs.testNeuralNetwork(this.cmd);
					}
				}
			}
		]);

		this.executableFuncs = executables;
	}
}

export default ChallengeAIExecutor;
