import { getArtboardObject } from '../artboard/helpers';

export const getExtremePoints = (object: fabric.Object) => {
	const { aCoords, oCoords } = object;
	console.log(aCoords, oCoords);
	if (!aCoords) throw new Error('Invalid object while finding extreme points');
	const { tl, tr, bl, br } = aCoords;

	const left = Math.min(tl.x, tr.x, bl.x, br.x);
	const top = Math.min(tl.y, tr.y, bl.y, br.y);
	const right = Math.max(tl.x, tr.x, bl.x, br.x);
	const bottom = Math.max(tl.y, tr.y, bl.y, br.y);
	return {
		left,
		top,
		right,
		bottom,
	};
};

export const alignElementToRect = (
	currentSelectedElements: fabric.Object[],
	activeArtboardId: string,
	position: string,
	canvas: fabric.Canvas,
) => {
	const targetRect = getArtboardObject(canvas, activeArtboardId);

	switch (position) {
		case 'left':
			currentSelectedElements.forEach(element => {
				if (!targetRect.left || !element.left) throw new Error('Invalid target rect in left align');
				element.set({
					left: targetRect.left + (element.left - getExtremePoints(element).left),
				});
			});
			break;
		case 'center':
			currentSelectedElements.forEach(element => {
				if (!targetRect.left || !element.left || !targetRect.width)
					throw new Error('Invalid target rect in center align');
				const artboardCenter = targetRect.left + (targetRect.width + targetRect.left - targetRect.left) / 2;
				const elementCenter =
					getExtremePoints(element).left +
					(getExtremePoints(element).right - getExtremePoints(element).left) / 2;
				element.set({
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					//@ts-ignore
					left: element.left + (artboardCenter - elementCenter),
				});
			});

			break;
		case 'right':
			currentSelectedElements.forEach(element => {
				element.set({
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					//@ts-ignore
					left: element.left + (targetRect.left + targetRect.width) - getExtremePoints(element).right,
				});
			});
			break;
		case 'top':
			currentSelectedElements.forEach(element => {
				if (!targetRect.top || !element.top || !targetRect.width)
					throw new Error('Invalid target rect in top align');
				element.set({
					top: targetRect.top + (element.top - getExtremePoints(element).top),
				});
			});
			break;
		case 'middle':
			currentSelectedElements.forEach(element => {
				if (!targetRect.top || !element.top || !targetRect.height)
					throw new Error('Invalid target rect in middle align');
				const artboardCenter = targetRect.top + (targetRect.height + targetRect.top - targetRect.top) / 2;
				const elementCenter =
					getExtremePoints(element).top +
					(getExtremePoints(element).bottom - getExtremePoints(element).top) / 2;
				element.set({
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					//@ts-ignore
					top: element.top + (artboardCenter - elementCenter),
				});
			});
			break;
		case 'bottom':
			currentSelectedElements.forEach(element => {
				element.set({
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					//@ts-ignore
					top: element.top + (targetRect.top + targetRect.height) - getExtremePoints(element).bottom,
				});
			});
			break;
		default:
			console.error('Invalid position:', position);
	}

	canvas.requestRenderAll();
};
