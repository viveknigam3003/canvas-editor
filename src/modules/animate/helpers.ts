import { Keyframe } from './types';
import { evaluateEasingFunction } from './easing';

export const getNearestFps = (fps: number) => {
	const fpsList = [8, 12, 15, 24, 25, 30, 48, 50, 60];
	const nearestFps = fpsList.reduce((prev, curr) => (Math.abs(curr - fps) < Math.abs(prev - fps) ? curr : prev));
	return nearestFps;
};

/**
 * Function to interpolate the value of a property at a given time using an easing function
 *
 * @example
 * const keyframes = [
 * 	{ id: '1', property: 'opacity', value: 0, timeMark: 0, easing: 'linear' },
 * 	{ id: '2', property: 'opacity', value: 1, timeMark: 1000, easing: 'linear' },
 * 	{ id: '3', property: 'opacity', value: 0, timeMark: 2000, easing: 'linear' },
 * ];
 *
 * interpolatePropertyValue(keyframes, 500, 'opacity'); // 0.5
 * interpolatePropertyValue(keyframes, 1500, 'opacity'); // 0.5
 * interpolatePropertyValue(keyframes, 2500, 'opacity'); // 0
 *
 * @category Utils
 * @param keyframes Keyframes array
 * @param time Time in milliseconds
 * @param property Property to interpolate
 * @returns Value of the property at the given time
 */
export function interpolatePropertyValue(keyframes: Keyframe[], time: number, property: string): number | string {
	// Sort the keyframes based on timeMark
	const sortedKeyframes = keyframes.filter(kf => kf.property === property).sort((a, b) => a.timeMark - b.timeMark);

	// Edge cases
	if (time <= sortedKeyframes[0].timeMark) {
		return sortedKeyframes[0].value;
	}
	if (time >= sortedKeyframes[sortedKeyframes.length - 1].timeMark) {
		return sortedKeyframes[sortedKeyframes.length - 1].value;
	}

	// Find the surrounding keyframes
	let prevKeyframe: Keyframe | null = null;
	let nextKeyframe: Keyframe | null = null;
	for (const kf of sortedKeyframes) {
		if (kf.timeMark <= time) {
			prevKeyframe = kf;
		} else {
			nextKeyframe = kf;
			break;
		}
	}

	if (prevKeyframe && nextKeyframe) {
		// Linear interpolation
		const timeDiff = nextKeyframe.timeMark - prevKeyframe.timeMark;
		const valueDiff =
			typeof prevKeyframe.value === 'number' && typeof nextKeyframe.value === 'number'
				? nextKeyframe.value - prevKeyframe.value
				: 0;
		const factor = evaluateEasingFunction((time - prevKeyframe.timeMark) / timeDiff, prevKeyframe.easing);
		return typeof prevKeyframe.value === 'number' ? prevKeyframe.value + valueDiff * factor : prevKeyframe.value;
	}

	return 'Error'; // Handle error or unexpected cases
}
