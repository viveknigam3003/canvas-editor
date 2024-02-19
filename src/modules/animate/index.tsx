/**
 * @module animate
 */
export { default as Animation } from './components/Animation';
export { easeInOutCubic, easeOutSine, easeOutBounce, easeInOutCirc, evaluateEasingFunction } from './easing';
export { getNearestFps, interpolatePropertyValue } from './helpers';
export * from './types';
