import { ErrorClassification, MorseSymbol, PulseRecord, RhythmSessionStats, TrainerSettings } from '../types';

export function calculateTimingStandards(wpm: number) {
  const ditMs = Math.round(1200 / wpm);
  const dahMs = ditMs * 3;
  const splitBoundaryMs = ditMs * 2.0; // midpoint threshold between Dit and Dah
  const intraGapMs = ditMs;            // normal gap between dits/dahs within a character
  const charGapMs = ditMs * 3.0;       // silence to recognize completed character
  const wordGapMs = ditMs * 7.0;       // silence to recognize space between words

  return {
    ditMs,
    dahMs,
    splitBoundaryMs,
    intraGapMs,
    charGapMs,
    wordGapMs,
  };
}

export function evaluatePulse(
  durationMs: number,
  settings: TrainerSettings,
  charContext: string = ''
): PulseRecord {
  const { ditMs, dahMs, splitBoundaryMs } = calculateTimingStandards(settings.wpm);
  const tol = settings.tolerancePercent / 100;

  let detectedSymbol: MorseSymbol = '.';
  let targetDurationMs = ditMs;
  let classification: ErrorClassification = 'perfect';
  let messageText = '节奏标准';

  if (durationMs < splitBoundaryMs) {
    // Classified as Dit (.)
    detectedSymbol = '.';
    targetDurationMs = ditMs;

    const lowerBound = ditMs * (1 - tol);
    const upperBound = ditMs * (1 + tol);

    if (durationMs < lowerBound * 0.75) {
      classification = 'dit_too_short';
      messageText = `点按太短 (-${Math.round(ditMs - durationMs)}ms)`;
    } else if (durationMs > upperBound) {
      classification = 'dit_too_long';
      messageText = `点按长了 (+${Math.round(durationMs - ditMs)}ms)`;
    } else {
      classification = 'perfect';
      messageText = '标准点 (滴)';
    }
  } else {
    // Classified as Dah (-)
    detectedSymbol = '-';
    targetDurationMs = dahMs;

    const lowerBound = dahMs * (1 - tol);
    const upperBound = dahMs * (1 + tol);

    if (durationMs < lowerBound) {
      classification = 'dah_too_short';
      messageText = `划按短了 (-${Math.round(dahMs - durationMs)}ms)`;
    } else if (durationMs > upperBound) {
      classification = 'dah_too_long';
      messageText = `划按长了 (+${Math.round(durationMs - dahMs)}ms)`;
    } else {
      classification = 'perfect';
      messageText = '标准划 (答)';
    }
  }

  const deviationMs = Math.round(durationMs - targetDurationMs);
  const deviationRatio = (durationMs - targetDurationMs) / targetDurationMs;

  return {
    id: `pulse_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    timestamp: Date.now(),
    durationMs: Math.round(durationMs),
    targetDurationMs,
    symbol: detectedSymbol,
    detectedSymbol,
    classification,
    deviationMs,
    deviationRatio,
    messageText,
    charContext,
  };
}

export function computeSessionStats(pulses: PulseRecord[]): RhythmSessionStats {
  if (pulses.length === 0) {
    return {
      totalPulses: 0,
      perfectPulses: 0,
      ditCount: 0,
      dahCount: 0,
      avgDitDurationMs: 0,
      avgDahDurationMs: 0,
      dahDitRatio: 3.0,
      accuracyRate: 100,
      ditAccuracyRate: 100,
      dahAccuracyRate: 100,
      errorCounts: {
        dit_too_short: 0,
        dit_too_long: 0,
        dah_too_short: 0,
        dah_too_long: 0,
        intra_gap_too_long: 0,
        char_mismatch: 0,
      },
    };
  }

  const dits = pulses.filter((p) => p.symbol === '.');
  const dahs = pulses.filter((p) => p.symbol === '-');
  const perfectPulses = pulses.filter((p) => p.classification === 'perfect');

  const avgDitDurationMs = dits.length > 0
    ? Math.round(dits.reduce((acc, p) => acc + p.durationMs, 0) / dits.length)
    : 0;

  const avgDahDurationMs = dahs.length > 0
    ? Math.round(dahs.reduce((acc, p) => acc + p.durationMs, 0) / dahs.length)
    : 0;

  const dahDitRatio = avgDitDurationMs > 0 && avgDahDurationMs > 0
    ? Number((avgDahDurationMs / avgDitDurationMs).toFixed(2))
    : 3.0;

  const errorCounts = {
    dit_too_short: 0,
    dit_too_long: 0,
    dah_too_short: 0,
    dah_too_long: 0,
    intra_gap_too_long: 0,
    char_mismatch: 0,
  };

  pulses.forEach((p) => {
    if (p.classification !== 'perfect' && p.classification in errorCounts) {
      errorCounts[p.classification as keyof typeof errorCounts]++;
    }
  });

  const ditPerfectCount = dits.filter((p) => p.classification === 'perfect').length;
  const dahPerfectCount = dahs.filter((p) => p.classification === 'perfect').length;

  return {
    totalPulses: pulses.length,
    perfectPulses: perfectPulses.length,
    ditCount: dits.length,
    dahCount: dahs.length,
    avgDitDurationMs,
    avgDahDurationMs,
    dahDitRatio,
    accuracyRate: Math.round((perfectPulses.length / pulses.length) * 100),
    ditAccuracyRate: dits.length > 0 ? Math.round((ditPerfectCount / dits.length) * 100) : 100,
    dahAccuracyRate: dahs.length > 0 ? Math.round((dahPerfectCount / dahs.length) * 100) : 100,
    errorCounts,
  };
}
