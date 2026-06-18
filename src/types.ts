export type MaterialKey = 'plata' | 'cobre' | 'oro' | 'aluminio' | 'hierro';

export interface MaterialInfo {
  nombre: string;
  simbolo: string;
  resistividad: number;
  densidad: number;
  pesoMolecular: number;
  colorPrimario: string;
  colorGrad1: string;
  colorGrad2: string;
  conductividad: 'Excelente ⭐' | 'Excelente' | 'Muy buena' | 'Buena' | 'Moderada';
  emoji: string;
  dato: string;
  uso: string;
  curiosidad: string;
}

export type CircuitType = 'a' | 'b';

export interface ResistorStats {
  req: number;
  iTotal: number;
  iR1: number;
  iR2: number;
  iR3: number;
  iR4: number;
  iR5: number;
  iR6: number;
  rGroupParallel?: number; // r23 or r3145
  vGroupParallel?: number; // v23 or v3145
  rGroupSeries?: number;   // r145
  verificacion: boolean;
}
