import { memo, useContext, useState } from 'react';
import {
	AIInterfaceProps,
	AITabModel,
	StyledAIInterface,
} from './AIInterfaceTypes';
import { ThemeContext } from '../../../state/contexts/ThemeContext';
import AITab from './AITab';
import ChallengeTable from '../ChallengeTable/ChallengeTable';

/**
 * This component represents the visual interface in every ChallengeAI. It handles the
 * management of all 4 tabs in this component.
 *
 * @param handleHyperparamChange a callback function called when a hyperparameter is changed in
 * the hyperparameters tab.
 * @param className the names of optional CSS classes.
 * @param tabs the tab components of the AIInterface.
 * @param hyperparams the initial hyperparameter values for the hyperparameters table.
 *
 * @author Félix Jobin
 */
const AIInterface = memo(
	({
		handleHyperparamChange,
		className,
		tabs: initialTabs,
		data,
		hyperparams: initialHyperparams,
	}: AIInterfaceProps) => {
		// The selected theme to apply to this component
		const { theme } = useContext(ThemeContext);

		// The tab icons to display on the interface
		const [tabs, setTabs] = useState<AITabModel[]>(() => {
			return (
				initialTabs || [
					// If the tabs array was empty
					{
						title: 'New tab',
						open: true,
					},
				]
			);
		});

		/**
		 * Updates the state of every tab icon and the content
		 * shown in the parent component.
		 * @param idx the opened tab's index.
		 */
		const setOpenedTab = (idx: number) => {
			console.log(data);
			const updatedTabs = tabs.map((t, i) => {
				t.open = i === idx;
				return t;
			});
			setTabs(updatedTabs);
		};

		return (
			<StyledAIInterface
				theme={theme}
				className={'h-3/5 w-full flex flex-col ' + className}
			>
				<div className="bg w-full h-full">
					<div className="ai-tabs w-full items-center overflow-x-auto">
						<div className="dropdown-menu w-full h-full">
							<div className="head-text">Modèle choisi :</div>
							<select className="dropdown">
								<option value="NN">Réseau de neurones</option>
								<option value="REG">Régression</option>
							</select>
						</div>
						{tabs.map((tab, index) => (
							<div className="w-fit">
								<AITab
									key={index}
									tab={tab}
									setOpen={() => setOpenedTab(index)}
								/>
							</div>
						))}
					</div>
					{tabs[0].open ? (
						<ChallengeTable data={data} isData={true} />
					) : tabs[1].open ? (
						<div />
					) : tabs[2].open ? (
						<>
							<h1 className="header">Valeurs des hyperparamètres</h1>
							<ChallengeTable
								hyperparams={initialHyperparams}
								isData={false}
								handleHyperparamsChange={handleHyperparamChange}
							/>
						</>
					) : (
						<div />
					)}
				</div>
			</StyledAIInterface>
		);
	},
);

export default AIInterface;