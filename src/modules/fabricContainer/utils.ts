import { fabric } from 'fabric';

export const getObjectOrigin = (object: fabric.Object): [number, number] => {
	if (!object.left || !object.top || !object.width || !object.height) {
		return [0, 0];
	}

	if (object.originX === 'left' && object.originY === 'top') {
		return [object.left, object.top];
	} else if (object.originX === 'center' && object.originY === 'top') {
		return [object.left + object.width / 2, object.top];
	} else if (object.originX === 'right' && object.originY === 'top') {
		return [object.left + object.width, object.top];
	} else if (object.originX === 'left' && object.originY === 'center') {
		return [object.left, object.top + object.height / 2];
	} else if (object.originX === 'center' && object.originY === 'center') {
		return [object.left + object.width / 2, object.top + object.height / 2];
	} else if (object.originX === 'right' && object.originY === 'center') {
		return [object.left + object.width, object.top + object.height / 2];
	} else if (object.originX === 'left' && object.originY === 'bottom') {
		return [object.left, object.top + object.height];
	} else if (object.originX === 'center' && object.originY === 'bottom') {
		return [object.left + object.width / 2, object.top + object.height];
	} else if (object.originX === 'right' && object.originY === 'bottom') {
		return [object.left + object.width, object.top + object.height];
	} else {
		throw new Error('Invalid position');
	}
};

export const rotatePoint =
	(anchorX = 0, anchorY = 0, angle: number) =>
	(pointX: number, pointY: number): [number, number] => {
		// Converting angle in degrees to radians
		const angleInRadians = fabric.util.degreesToRadians(angle);
		const cosVal = Math.cos(angleInRadians);
		const sinVal = Math.sin(angleInRadians);

		// Translating the co-ordinate system to make anchor point as origin
		const Px = pointX - anchorX;
		const Py = pointY - anchorY;

		// Rotating the point
		const PxRotated = Px * cosVal - Py * sinVal;
		const PyRotated = Px * sinVal + Py * cosVal;

		// Translating the co-ordinate system back to the original
		return [PxRotated + anchorX, PyRotated + anchorY];
	};
