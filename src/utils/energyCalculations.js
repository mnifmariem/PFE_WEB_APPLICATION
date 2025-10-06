// Calcule la régression linéaire
export function linearRegression(X, y) {
  const n = X.length;
  const meanX = X.reduce((a, b) => a + b, 0) / n;
  const meanY = y.reduce((a, b) => a + b, 0) / n;
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

// Calcule le R²
export function r2Score(yTrue, yPred) {
  const meanY = yTrue.reduce((a, b) => a + b) / yTrue.length;
  const ssTot = yTrue.reduce((a, b) => a + (b - meanY) ** 2, 0);
  const ssRes = yTrue.reduce((a, b, i) => a + (b - yPred[i]) ** 2, 0);
  return 1 - (ssRes / ssTot);
}

// Pourcentage d'économie d'énergie
export function savingsPercent(s1, s2) {
  return s1.map((val, i) => 100 * (val - s2[i]) / val);
}