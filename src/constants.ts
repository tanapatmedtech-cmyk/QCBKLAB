import { Instrument, QCConfig } from './types';

export const INSTRUMENTS: Instrument[] = [
  { id: 'inst-1', name: 'Alinity c', model: 'Abbott' },
  { id: 'inst-2', name: 'Cobas c501', model: 'Roche' },
  { id: 'inst-3', name: 'Atellica CH', model: 'Siemens' },
  { id: 'inst-4', name: 'Architect i2000SR', model: 'Abbott' },
];

export const QC_CONFIGS: QCConfig[] = [
  {
    id: 'test-glu',
    testName: 'Glucose',
    unit: 'mg/dL',
    tea: 10.0,
    level1: { mean: 100, sd: 2.5 },
    level2: { mean: 250, sd: 5.0 },
    level3: { mean: 400, sd: 8.0 },
  },
  {
    id: 'test-cre',
    testName: 'Creatinine',
    unit: 'mg/dL',
    tea: 15.0,
    level1: { mean: 1.0, sd: 0.05 },
    level2: { mean: 4.0, sd: 0.15 },
    level3: { mean: 8.0, sd: 0.30 },
  },
  {
    id: 'test-alt',
    testName: 'ALT (SGPT)',
    unit: 'U/L',
    tea: 20.0,
    level1: { mean: 45, sd: 3.2 },
    level2: { mean: 120, sd: 6.5 },
    level3: { mean: 350, sd: 18.0 },
  },
  {
    id: 'test-hba1c',
    testName: 'HbA1c',
    unit: '%',
    tea: 6.0,
    level1: { mean: 5.2, sd: 0.12 },
    level2: { mean: 9.8, sd: 0.25 },
  },
  {
    id: 'test-cho',
    testName: 'Cholesterol',
    unit: 'mg/dL',
    tea: 10.0,
    level1: { mean: 150, sd: 4.5 },
    level2: { mean: 280, sd: 7.2 },
  },
];

export const WESTGARD_RULES = {
  W1_2S: '1-2s (Warning)',
  R1_3S: '1-3s (Rejection)',
  R2_2S: '2-2s (Rejection)',
  R_4S: 'R-4s (Rejection)',
};
