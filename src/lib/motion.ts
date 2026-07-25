import type { Transition } from "motion/react";

/** Shared motion language: brief feedback, calm overlays, and no decorative loops. */
export const motionDurations = {
  instant: 0,
  fast: 0.16,
  standard: 0.24,
  deliberate: 0.34,
} as const;

export const motionEasings = {
  standard: [0.22, 1, 0.36, 1],
  exit: [0.4, 0, 1, 1],
  emphasized: [0.16, 1, 0.3, 1],
} as const;

export const motionDistances = {
  small: 8,
  medium: 14,
} as const;

export const standardTransition: Transition = {
  duration: motionDurations.standard,
  ease: motionEasings.standard,
};

export const overlayTransition: Transition = {
  duration: motionDurations.deliberate,
  ease: motionEasings.emphasized,
};
