export interface User {
  id: string;
  name: string;
  password?: string;
  licenseNumber: string;
  role: 'MT' | 'MD' | 'ADMIN';
  status: 'PENDING' | 'APPROVED' | 'DENIED';
}

export interface QCResult {
  id: string;
  date: string;
  value: number;
  level: 1 | 2 | 3;
  instrumentId: string;
  testId: string;
  operatorId: string;
  comment?: string;
  westgardViolations: string[];
  status?: 'active' | 'deleted';
  deleteReason?: string;
  eventId?: string;
}

export interface QCEvent {
  id: string;
  date: string;
  type: 'calibration' | 'reagent_change' | 'maintenance' | 'control_lot_change';
  testId: string;
  instrumentId: string;
  lotNumber?: string;
  operatorId: string;
  description: string;
}

export interface EQAResult {
  id: string;
  cycle: string; // e.g., "Cycle 1/2026"
  testId: string;
  instrumentId: string;
  yourResult: number;
  peerMean: number;
  peerSD: number;
  targetValue?: number; // Optional, some schemes use target value
  date: string;
  score?: number; // SDI or VIS
  bias?: number;
  sigma?: number;
  comment?: string;
  reagentLot?: string;
  reagentExp?: string;
}

export interface QCConfig {
  id: string;
  testName: string;
  unit: string;
  tea: number; // Total Allowable Error in %
  level1: {
    mean: number;
    sd: number;
  };
  level2: {
    mean: number;
    sd: number;
  };
  level3?: {
    mean: number;
    sd: number;
  };
}

export interface QCMetrics {
  mean: number;
  sd: number;
  cv: number;
  bias: number;
  sigma: number;
  uncertainty?: number;
}

export interface Instrument {
  id: string;
  name: string;
  model: string;
}
