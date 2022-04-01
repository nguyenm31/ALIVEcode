import { matMul, matMulElementWise, Matrix, matMulConstant, zeros, matSubtract } from '../../AIUtils';
import { ActivationFunction } from '../../ai_functions/ActivationFunction';
import { CostFunction } from '../../ai_functions/CostFunction';
import { NeuralNetwork } from '../../ai_models/ai_neural_networks/NeuralNetwork';


export class GradientDescent
{
  private learningRate: number;
  private epochs: number;
  private model: NeuralNetwork;
  private costFunc: CostFunction;
  
  public constructor(model: NeuralNetwork, costFunc: CostFunction, learningRate: number, epochs: number) {
    this.learningRate = learningRate;
    this.epochs = epochs;
    this.model = model;
    this.costFunc = costFunc;
  }

  public optimizeOneEpoch(inputs: Matrix, outputArray: Matrix[], real: Matrix, ) {
    const activations: ActivationFunction[] = this.model.getAllActivations();
    const nbLayers: number = this.model.getAllActivations().length;
    const inputArray: Matrix[] = [inputs].concat(outputArray).slice(0, -1);
    const nbData: number = inputs.getValue()[0].length;
    const predicted: Matrix = outputArray[outputArray.length - 1];
    
    let dz: Matrix = new Matrix(zeros(1, 1)); // Derivative with respect to the inputs of the layer.
    let dw: Matrix; // Derivative with respect to the weights of the layer.
    let db: Matrix; // Derivative with respect to the biases of the layer.
    let newWeights: Matrix; // New values of weights calculated for a layer.
    let newBiases: Matrix; // New values of biases calculated for a layer.

    for (let layer: number = nbLayers - 1; layer >= 0; layer--) {
      if (layer !== nbLayers - 1) { // Calculation of dz for the output layer
        dz = matMul(this.model.getWeightsByLayer(layer + 1), dz)
        dz = matMulElementWise(dz, activations[layer].matDerivative(outputArray[layer]));
      } 
      else { // Calculation of dz for hidden layers
        dz = matMulElementWise(
          this.costFunc.matDerivative(predicted, real), 
          activations[layer].matDerivative(outputArray[layer]));
      }
      console.log("dz calculated")
      
      // Calculation of dw for each layer
      console.log(dz.getRows() + " and " + dz.getColumns())
      dw = matMulConstant(matMul(dz, inputArray[layer].transpose()), 1 / nbData);
      console.log("dw calculated")
      // Calculation of new weights for each layer
      newWeights = matSubtract(this.model.getWeightsByLayer(layer), matMulConstant(dw, this.learningRate));
      this.model.setWeightsByLayer(layer, newWeights);

      // Calculation of db for each layer
      db = matMulConstant( dz.sumOfAllRows(), 1 / nbData);
      // Calculation of new biases for each layer
      newBiases = matSubtract(this.model.getBiasesByLayer(layer), matMulConstant(db, this.learningRate));
      this.model.setWeightsByLayer(layer, newBiases);


      /*
      ERREUR DE TAILLES POUR MULTIPLICATION MATRICIELLE
      ERREUR DE TAILLES POUR ADDITION DE MATRICES
      */
    }
  }
}