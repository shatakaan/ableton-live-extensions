export type Subdivision = '8th' | '16th' | '32nd';
export type Acceleration = 'linear' | 'exponential' | 'step';
export type VelocityCurve = 'linear' | 'exponential';
export type TargetMode = 'selected' | 'new';

export interface RollConfig {
  midiNote: number;
  rollLength: 1 | 2 | 4;
  startSubdivision: Subdivision;
  endSubdivision: Subdivision;
  acceleration: Acceleration;
  velocityStart: number;
  velocityEnd: number;
  velocityCurve: VelocityCurve;
  pitchRise: number;
  humanize: boolean;
  humanizeAmount: number;
  targetMode: TargetMode;
}

export interface NoteOut {
  startTime: number;
  duration: number;
  pitch: number;
  velocity: number;
}

const SUB_BEATS: Record<Subdivision, number> = {
  '8th': 0.5,
  '16th': 0.25,
  '32nd': 0.125,
};

export function generateNotes(config: RollConfig): NoteOut[] {
  const BEATS_PER_BAR = 4;
  const totalBeats = config.rollLength * BEATS_PER_BAR;
  const startSize = SUB_BEATS[config.startSubdivision];
  const endSize = SUB_BEATS[config.endSubdivision];

  const positions: number[] = [];

  if (config.acceleration === 'step') {
    const halfway = totalBeats / 2;
    for (let pos = 0; pos < halfway - startSize / 2; pos += startSize) {
      positions.push(pos);
    }
    for (let pos = halfway; pos < totalBeats - endSize / 2; pos += endSize) {
      positions.push(pos);
    }
  } else {
    let t = 0;
    while (t < totalBeats - endSize / 2) {
      positions.push(t);
      const progress = t / totalBeats;
      const curved = config.acceleration === 'exponential' ? progress * progress : progress;
      t += startSize + (endSize - startSize) * curved;
    }
  }

  const total = positions.length;

  return positions.map((startTime, i) => {
    const nextStart = positions[i + 1] ?? totalBeats;
    const duration = nextStart - startTime;

    const progress = total > 1 ? i / (total - 1) : 1;
    const velCurved = config.velocityCurve === 'exponential' ? progress * progress : progress;
    let velocity = config.velocityStart + (config.velocityEnd - config.velocityStart) * velCurved;

    if (config.humanize) {
      const maxDev = config.humanizeAmount * 127;
      velocity += (Math.random() * 2 - 1) * maxDev;
    }
    velocity = Math.max(1, Math.min(127, Math.round(velocity)));

    const pitch = config.midiNote + Math.round(config.pitchRise * progress);

    return { startTime, duration, pitch, velocity };
  });
}
