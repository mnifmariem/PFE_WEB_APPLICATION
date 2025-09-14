// backend/src/utils/calculations.js
class Calculations {
  static linearRegression(X, y) {
    const n = X.length;
    const meanX = X.reduce((a, b) => a + b) / n;
    const meanY = y.reduce((a, b) => a + b) / n;
    
    let numerator = 0;
    let denominator = 0;
    
    for (let i = 0; i < n; i++) {
      numerator += (X[i] - meanX) * (y[i] - meanY);
      denominator += (X[i] - meanX) ** 2;
    }
    
    const slope = numerator / denominator;
    const intercept = meanY - slope * meanX;
    
    return { slope, intercept };
  }

  static r2Score(yTrue, yPred) {
    const meanY = yTrue.reduce((a, b) => a + b) / yTrue.length;
    const ssTot = yTrue.reduce((a, b) => a + (b - meanY) ** 2, 0);
    const ssRes = yTrue.reduce((a, b, i) => a + (b - yPred[i]) ** 2, 0);
    return 1 - (ssRes / ssTot);
  }

  static calculateLinearRegression(dataSizes, analysisData) {
    const scenario1Values = analysisData.map(item => item.scenario1Energy || item.scenario1Latency);
    const scenario2Values = analysisData.map(item => item.scenario2Energy || item.scenario2Latency);
    
    const model1 = this.linearRegression(dataSizes, scenario1Values);
    const model2 = this.linearRegression(dataSizes, scenario2Values);
    
    const pred1 = dataSizes.map(x => model1.slope * x + model1.intercept);
    const pred2 = dataSizes.map(x => model2.slope * x + model2.intercept);
    
    const r2_1 = this.r2Score(scenario1Values, pred1);
    const r2_2 = this.r2Score(scenario2Values, pred2);
    
    return {
      scenario1: { ...model1, r2: r2_1 },
      scenario2: { ...model2, r2: r2_2 }
    };
  }

  static extrapolateEnergy(size, scenario) {
    const energyModels = {
      scenario1: { slope: 0.0777, intercept: 0.8965 },
      scenario2: { slope: 0.0142, intercept: 2.4681 }
    };
    
    const model = energyModels[scenario];
    return model.slope * size + model.intercept;
  }

  static extrapolateLatency(size, scenario) {
    const latencyModels = {
      scenario1: { slope: 0.297, intercept: 15.2 },
      scenario2: { slope: 0.108, intercept: 12.8 }
    };
    
    const model = latencyModels[scenario];
    return model.slope * size + model.intercept;
  }
}

module.exports = Calculations;