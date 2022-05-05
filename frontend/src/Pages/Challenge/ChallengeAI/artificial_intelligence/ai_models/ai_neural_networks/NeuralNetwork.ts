import {
	Matrix,
	normalize,
	normalizeByRow,
	randomMatrix,
	zeros,
} from '../../AIUtils';
import { NeuralLayer } from './NeuralLayer';
import { ActivationFunction } from '../../ai_functions/ActivationFunction';
import { Model } from '../Model';
import {
	NNHyperparameters,
	NNModelParams,
	ModelTypes,
} from '../../AIEnumsInterfaces';

/**
 * This class represents a whole Neural Network. It contains every layers that
 * composes it, its number of inputs and numebr of outputs.
 *
 * A Neural Network can be used to make predictions based on its parameters, which
 * have a randomized initial value and can be trained with a NNOptimizer to make
 * better predictions on a specific situation.
 */
export class NeuralNetwork extends Model {
	// The layers attribute represents the hidden layers plus the output layer.
	// The input layer doesn't need its own object since it doesn't have weights or biases.
	private layers: NeuralLayer[];
	private nbInputs: number;
	private nbOutputs: number;

	/**
	 * Creates or loads a Neural Network Model, based on the NNModelParams object given
	 * in arguments. If this object contains only an empty array, the constructor
	 * creates a new Model with random parameters. If the layerParams property in
	 * modelParams has values in it, then the constructor creates a Model with the same
	 * parameters as specified in the object.
	 * @param id the identifier of the Model.
	 * @param hyperparameters an object describing all hyperparameters of the Neural Network.
	 * @param modelParams the parameters values of the Neural Network. Its layerParams
	 * property can be empty if we want to create a Neural Network from scratch.
	 */
	constructor(
		id: number,
		hyperparameters: NNHyperparameters,
		modelParams: NNModelParams,
	) {
		super(id, ModelTypes.NeuralNetwork);

		// Assinging values to properties
		this.nbInputs = hyperparameters.model.nb_inputs;
		this.nbOutputs = hyperparameters.model.nb_outputs;

		// Choosing the right method depending if the model already exists
		if (modelParams.layerParams.length === 0) this.createModel(hyperparameters);
		else this.loadModel(modelParams, hyperparameters);
	}

	protected loadModel(
		modelParams: NNModelParams,
		hyperparams: NNHyperparameters,
	) {
		let nbLayers: number = this.layers.length;

		// Hidden layers
		for (let layer: number = 0; layer < nbLayers; layer++) {
			// Initiates the layers if its the first layer
			this.layers.push(
				new NeuralLayer(
					modelParams.layerParams[layer].biases.length,
					hyperparams.model.activations_by_layer[layer],
					new Matrix(modelParams.layerParams[layer].weights),
					new Matrix([modelParams.layerParams[layer].biases]).transpose(),
				),
			);
		}
	}

	protected createModel(hyperparams: NNHyperparameters) {
		let weights: Matrix;
		let biases: Matrix;
		let previousNbNeurons: number = 0;
		let currentNbNeurons: number = 0;
		let neuronsByLayer = hyperparams.model.neurons_by_layer;

		let activationFunctions: ActivationFunction[] =
			hyperparams.model.activations_by_layer;
		let nbActivations: number = activationFunctions.length;

		// If the number of activation functions is smaller than the number of layers,
		// fills the activation function array until its of the same length as the number of layers.
		if (nbActivations < neuronsByLayer.length + 1) {
			for (let i: number = nbActivations; i < neuronsByLayer.length + 1; i++) {
				activationFunctions.push(activationFunctions[i - 1]);
			}
		}

		// Hidden layers and output layer
		for (let layer: number = 0; layer < nbActivations; layer++) {
			// Number of neurons from the previous layer (can be the input layer)
			previousNbNeurons =
				layer === 0 ? this.nbInputs : neuronsByLayer[layer - 1];
			// NUmber of neurons of the current layer (can be the output layer)
			currentNbNeurons =
				layer === nbActivations - 1 ? this.nbOutputs : neuronsByLayer[layer];
			// Initialization of weights and biases
			weights = randomMatrix(currentNbNeurons, previousNbNeurons);
			biases = new Matrix(zeros(currentNbNeurons, 1));

			// Initiates the layers if its the first layer
			if (layer === 0)
				this.layers = [
					new NeuralLayer(
						currentNbNeurons,
						activationFunctions[layer],
						weights,
						biases,
					),
				];
			// Creates a hidden layer if its another layer
			else
				this.layers.push(
					new NeuralLayer(
						currentNbNeurons,
						activationFunctions[layer],
						weights,
						biases,
					),
				);
		}
	}

	//---- PREDICTION METHODS ----//

	public predict(inputs: Matrix): Matrix {
		let output: Matrix[] = this.predictReturnAll(inputs);
		//throw new Error("Test des erreurs");
		return output[output.length - 1];
	}

	public predictReturnAll(inputs: Matrix): Matrix[] {
		let output: Matrix = normalizeByRow(inputs);
		let outputArray: Matrix[] = [];

		// Computes the outputs for each layer.
		for (let i: number = 0; i < this.layers.length; i++) {
			output = this.layers[i].computeLayer(output);
			outputArray.push(output);
		}
		return outputArray;
	}

	//---- WEIGHTS METHODS ----//
	/**
	 * Returns the weights Matrix of a specified layer.
	 * @param layer the layer's index (starting at 0).
	 * @returns the weights Matrix of the layer.
	 */
	public getWeightsByLayer(layer: number): Matrix {
		return this.layers[layer].getWeights();
	}

	/**
	 * Returns the weights from all layers of the neural network in an array
	 * of Matrices.
	 * @returns an array of Matrices with all weights.
	 */
	public getAllWeights(): Matrix[] {
		let allWeights: Matrix[] = [this.layers[0].getWeights()];
		for (let layer: number = 1; layer < this.layers.length; layer++) {
			allWeights.push(this.layers[layer].getWeights());
		}
		return allWeights;
	}

	/**
	 * Sets the current weights of the specified layer to the new
	 * biases given in parameters.
	 * @param layer the layer to set.
	 * @param newWeights the new values for biases.
	 */
	public setWeightsByLayer(layer: number, newWeights: Matrix) {
		this.layers[layer].setWeights(newWeights);
	}

	//---- BIASES BY LAYER ----//
	/**
	 * Returns the biases Matrix of a specified layer.
	 * @param layer the layer's index (starting at 0).
	 * @returns the biases Matrix of the layer.
	 */
	public getBiasesByLayer(layer: number): Matrix {
		return this.layers[layer].getBiases();
	}

	/**
	 * Returns the biases from all layers of the neural network in an array
	 * of Matrices.
	 * @returns an array of Matrices with all biases.
	 */
	public getAllBiases(): Matrix[] {
		let allBiases: Matrix[] = [this.layers[0].getBiases()];
		for (let layer: number = 1; layer < this.layers.length; layer++) {
			allBiases.push(this.layers[layer].getBiases());
		}
		return allBiases;
	}

	/**
	 * Sets the current biases of the specified layer to the new
	 * biases given in parameters.
	 * @param layer the layer to set.
	 * @param newBiases the new values for biases.
	 */
	public setBiasesByLayer(layer: number, newBiases: Matrix) {
		this.layers[layer].setBiases(newBiases);
	}

	/**
	 * Returns all activation functions of hidden layers and the output layer. The output
	 * activation is the last element of the returned array.
	 * @returns an array of activation functions from the neural network.
	 */
	public getAllActivations(): ActivationFunction[] {
		let allActivations: ActivationFunction[] = [];

		for (let layer: number = 0; layer < this.layers.length; layer++) {
			allActivations.push(this.layers[layer].getActivation());
		}
		return allActivations;
	}
}