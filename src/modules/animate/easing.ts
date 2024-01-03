export function easeInOutCubic(x: number): number {
	return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

export function easeOutSine(x: number): number {
	return Math.sin((x * Math.PI) / 2);
}

export function easeOutBounce(x: number): number {
	const n1 = 7.5625;
	const d1 = 2.75;
	if (x < 1 / d1) {
		return n1 * x * x;
	} else if (x < 2 / d1) {
		return n1 * (x -= 1.5 / d1) * x + 0.75;
	} else if (x < 2.5 / d1) {
		return n1 * (x -= 2.25 / d1) * x + 0.9375;
	} else {
		return n1 * (x -= 2.625 / d1) * x + 0.984375;
	}
}

export function easeInOutCirc(x: number): number {
	return x < 0.5 ? (1 - Math.sqrt(1 - Math.pow(2 * x, 2))) / 2 : (Math.sqrt(1 - Math.pow(-2 * x + 2, 2)) + 1) / 2;
}

export const evaluateEasingFunction = (x: number, easingFunction: string): number => {
	switch (easingFunction) {
		case 'easeInOutCubic':
			return easeInOutCubic(x);
		case 'easeInOutCirc':
			return easeInOutCirc(x);
		case 'easeOutSine':
			return easeOutSine(x);
		case 'easeOutBounce':
			return easeOutBounce(x);
		default:
			return x;
	}
};
