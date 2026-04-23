import * as tf from '@tensorflow/tfjs';

/**
 * Trains a simple Dense Neural Network to project the 30-day forecast based on recent trend data.
 */
export async function generatePortfolioForecast(currentValue) {
  // Synthesize 60 days of historical data leading up to the currentValue.
  // We'll create a slightly noisy upward/downward curve.
  const days = 60;
  const historyX = [];
  const historyY = [];

  const startValue = currentValue * 0.9; // Assume 10% growth over 60 days

  for (let i = 0; i < days; i++) {
    historyX.push([i]);
    // Linear growth + slight random noise
    let noise = (Math.random() - 0.5) * (currentValue * 0.01);
    let interpolated = startValue + ((currentValue - startValue) * (i / days));
    historyY.push([interpolated + noise]);
  }

  // Force the last point to be exactly the current value
  historyX[days - 1] = [days - 1];
  historyY[days - 1] = [currentValue];

  // Convert to Tensors
  const inputTensor = tf.tensor2d(historyX);
  const labelTensor = tf.tensor2d(historyY);

  // Normalize inputs
  const inputMax = inputTensor.max();
  const inputMin = inputTensor.min();
  const labelMax = labelTensor.max();
  const labelMin = labelTensor.min();

  const normalizedInputs = inputTensor.sub(inputMin).div(inputMax.sub(inputMin));
  const normalizedLabels = labelTensor.sub(labelMin).div(labelMax.sub(labelMin));

  // Build Model
  const model = tf.sequential();
  model.add(tf.layers.dense({ inputShape: [1], units: 8, activation: 'relu' }));
  model.add(tf.layers.dense({ units: 1 }));

  model.compile({
    optimizer: tf.train.adam(0.1),
    loss: 'meanSquaredError'
  });

  // Train the model
  await model.fit(normalizedInputs, normalizedLabels, {
    epochs: 50,
    shuffle: true,
    verbose: 0
  });

  // Predict the next 30 days
  const futureDays = 30;
  const futureX = [];
  for (let i = 0; i < futureDays; i++) {
    futureX.push([days + i]);
  }
  
  const futureInputTensor = tf.tensor2d(futureX);
  const normalizedFutureInput = futureInputTensor.sub(inputMin).div(inputMax.sub(inputMin));

  const predictedNormalized = model.predict(normalizedFutureInput);
  
  // Un-normalize
  const unNormalized = predictedNormalized.mul(labelMax.sub(labelMin)).add(labelMin);
  const projectedValues = Array.from(unNormalized.dataSync());

  // Memory cleanup
  inputTensor.dispose();
  labelTensor.dispose();
  normalizedInputs.dispose();
  normalizedLabels.dispose();
  futureInputTensor.dispose();
  normalizedFutureInput.dispose();
  predictedNormalized.dispose();
  unNormalized.dispose();

  // Return formatted forecast data
  return projectedValues.map((val, index) => ({
    day: `Day +${index + 1}`,
    projectedValue: Math.round(val)
  }));
}
