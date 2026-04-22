import { QCResult, QCConfig } from '../types';

export function checkWestgardRules(
  currentValue: number,
  previousResults: QCResult[],
  config: QCConfig,
  level: 1 | 2 | 3
): string[] {
  const violations: string[] = [];
  const levelParams = level === 1 ? config.level1 : (level === 2 ? config.level2 : config.level3);
  
  if (!levelParams) return [];
  
  const { mean, sd } = levelParams;

  const zScore = (currentValue - mean) / sd;
  const absZ = Math.abs(zScore);

  // 1-2s (Warning)
  if (absZ > 2) {
    violations.push('1-2s');
  }

  // 1-3s (Rejection)
  if (absZ > 3) {
    violations.push('1-3s');
  }

  // Multi-rule checks (need previous results)
  const lastResults = previousResults.filter((r) => r.level === level).slice(-1);
  
  if (lastResults.length >= 1) {
    const prev = lastResults[0];
    const prevZ = (prev.value - mean) / sd;

    // 2-2s (Rejection)
    // Two consecutive results > 2SD in same direction
    if (absZ > 2 && Math.abs(prevZ) > 2 && Math.sign(zScore) === Math.sign(prevZ)) {
      violations.push('2-2s');
    }

    // R-4s (Rejection)
    // Range between two results in same run > 4SD
    // (Note: Strictly R-4s usually refers to Level 1 vs Level 2 in same run,
    // but often interpreted as consecutive points too. 
    // Here we check consecutive points for simplicity if requested in a single level context)
    if (Math.abs(zScore - prevZ) > 4) {
      violations.push('R-4s');
    }
  }

  return violations;
}

export function calculateSD(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const squareDiffs = values.map((v) => Math.pow(v - mean, 2));
  const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / (values.length - 1);
  return Math.sqrt(avgSquareDiff);
}

export function calculateCV(mean: number, sd: number): number {
  if (mean === 0) return 0;
  return (sd / mean) * 100;
}

export function calculateBias(observedMean: number, targetMean: number): number {
  if (targetMean === 0) return 0;
  return ((observedMean - targetMean) / targetMean) * 100;
}

export function calculateSigma(tea: number, bias: number, cv: number): number {
  if (cv === 0) return 0;
  return (tea - Math.abs(bias)) / cv;
}

export function getQCMetrics(results: number[], targetMean: number, tea: number): QCMetrics {
  if (results.length === 0) {
    return { mean: 0, sd: 0, cv: 0, bias: 0, sigma: 0, uncertainty: 0 };
  }
  const mean = results.reduce((a, b) => a + b, 0) / results.length;
  const sd = calculateSD(results);
  const cv = calculateCV(mean, sd);
  const bias = Math.abs(calculateBias(mean, targetMean));
  const sigma = calculateSigma(tea, bias, cv);

  // Expanded Uncertainty (U) k=2 (95% confidence)
  // Simplified formula U = k * sqrt(SD^2 + (Bias_Abs)^2)
  const bias_val = Math.abs(mean - targetMean);
  const uncertainty = 2 * Math.sqrt(Math.pow(sd, 2) + Math.pow(bias_val, 2));

  return { mean, sd, cv, bias, sigma, uncertainty };
}

export function calculateSDI(result: number, peerMean: number, peerSD: number): number {
  if (peerSD === 0) return 0;
  return (result - peerMean) / peerSD;
}

export function getSigmaMessage(sigma: number) {
  if (sigma >= 6) return 'World Class';
  if (sigma >= 4) return 'Good';
  if (sigma >= 3) return 'Marginal';
  return 'Unacceptable';
}

export function suggestWestgardRules(sigma: number): string[] {
  if (sigma >= 6) return ['1-3s']; // Excellent
  if (sigma >= 5) return ['1-3s', '2-2s', 'R-4s']; // 1-3s/2-2s/R-4s
  if (sigma >= 4) return ['1-3s', '2-2s', 'R-4s', '4-1s']; // +4-1s
  if (sigma >= 3) return ['1-3s', '2-2s', 'R-4s', '4-1s', '10-x']; // +10-x
  return ['1-3s', '2-2s', 'R-4s', '4-1s', '10-x', 'N-multi']; // Pedantic
}

import { QCMetrics } from '../types';
