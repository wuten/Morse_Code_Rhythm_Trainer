export type MorseSymbol = '.' | '-';

export interface TreeNode {
  id: string;
  char: string;
  code: string;
  level: number; // 0 for START, 1 for E/T, 2 for I/A/N/M, etc.
  dotChildId?: string;
  dashChildId?: string;
  xPercent: number;
  yPercent: number;
  isPunctuationOrDigit?: boolean;
}

export type ErrorClassification = 
  | 'perfect'
  | 'dit_too_short'
  | 'dit_too_long'
  | 'dah_too_short'
  | 'dah_too_long'
  | 'intra_gap_too_long'
  | 'char_mismatch';

export interface PulseRecord {
  id: string;
  timestamp: number;
  durationMs: number;
  targetDurationMs: number;
  symbol: MorseSymbol;
  detectedSymbol: MorseSymbol;
  classification: ErrorClassification;
  deviationMs: number;
  deviationRatio: number; // e.g., 1.25 means +25% longer than target
  messageText: string;
  charContext: string;
}

export interface RhythmSessionStats {
  totalPulses: number;
  perfectPulses: number;
  ditCount: number;
  dahCount: number;
  avgDitDurationMs: number;
  avgDahDurationMs: number;
  dahDitRatio: number; // ideal is 3.0
  accuracyRate: number; // percentage 0 - 100
  ditAccuracyRate: number;
  dahAccuracyRate: number;
  errorCounts: {
    dit_too_short: number;
    dit_too_long: number;
    dah_too_short: number;
    dah_too_long: number;
    intra_gap_too_long: number;
    char_mismatch: number;
  };
}

export interface KeyBinding {
  code: string;        // e.g. 'Space', 'KeyJ', 'KeyK', 'Enter'
  key: string;         // e.g. ' ', 'j', 'k', 'Enter'
  displayLabel: string;// e.g. '空格键 (Space)', 'J 键', 'Enter 回车'
}

export interface FloatingKeySettings {
  enabled: boolean;    // whether floating key is enabled on mobile & tablet
  position: 'right' | 'center' | 'left'; // thumb ergonomics
  size: 'compact' | 'normal' | 'large';
}

export interface TrainerSettings {
  wpm: number;             // Words per minute (8 - 25, default 12)
  frequencyHz: number;     // 400 - 850 Hz, default 650
  volume: number;          // 0.0 - 1.0, default 0.8
  tolerancePercent: number;// tolerance before flagged as error: 15, 25, 35% (default 25)
  autoSpace: boolean;      // append space after word gap timeout
  soundEnabled: boolean;
  hapticEnabled: boolean;
  keyMode: 'straight' | 'auto_space'; // straight key timing
  theme: 'pcb_dark' | 'pcb_green' | 'pcb_blue';
  keyBinding: KeyBinding;
  floatingKey: FloatingKeySettings;
}

export type PracticeMode = 'free' | 'rhythm_drill' | 'letter_challenge';

export interface LetterChallenge {
  id: string;
  title: string;
  description: string;
  chars: string[];
}
