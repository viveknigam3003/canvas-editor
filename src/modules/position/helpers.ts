import { getArtboardObject } from '../artboard/helpers';

export const getExtremePoints = (object: fabric.Object) => {
	const { aCoords } = object;
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
	const targetLeft = targetRect.left!;
	const targetTop = targetRect.top!;
	const targetWidth = targetRect.width!;
	const targetHeight = targetRect.height!;
	switch (position) {
		case 'left':
			currentSelectedElements.forEach(element => {
				const elementLeft = element.left!;
				const { left: elementExtremeLeft } = getExtremePoints(element);
				element.set({
					left: targetLeft + (elementLeft - elementExtremeLeft),
				});
			});
			break;
		case 'center':
			currentSelectedElements.forEach(element => {
				const elementLeft = element.left!;
				const artboardCenter = targetLeft + (targetWidth + targetLeft - targetLeft) / 2;
				const { left: elementExtremeLeft, right: elementExtremeRight } = getExtremePoints(element);
				const elementCenter = elementExtremeLeft + (elementExtremeRight - elementExtremeLeft) / 2;
				element.set({
					left: elementLeft + (artboardCenter - elementCenter),
				});
			});

			break;
		case 'right':
			currentSelectedElements.forEach(element => {
				const elementLeft = element.left!;
				const { right: elementExtremeRight } = getExtremePoints(element);

				element.set({
					left: elementLeft + (targetLeft + targetWidth) - elementExtremeRight,
				});
			});
			break;
		case 'top':
			currentSelectedElements.forEach(element => {
				const elementTop = element.top!;
				const { top: elementExtremeTop } = getExtremePoints(element);
				element.set({
					top: targetTop + (elementTop - elementExtremeTop),
				});
			});
			break;
		case 'middle':
			currentSelectedElements.forEach(element => {
				const elementTop = element.top!;
				const artboardCenter = targetTop + (targetHeight + targetTop - targetTop) / 2;
				const { top: elementExtremeTop, bottom: elementExtremeBottom } = getExtremePoints(element);
				const elementCenter = elementExtremeTop + (elementExtremeBottom - elementExtremeTop) / 2;
				element.set({
					top: elementTop + (artboardCenter - elementCenter),
				});
			});
			break;
		case 'bottom':
			currentSelectedElements.forEach(element => {
				const elementTop = element.top!;
				const { bottom: elementExtremeBottom } = getExtremePoints(element);
				element.set({
					top: elementTop + (targetTop + targetHeight) - elementExtremeBottom,
				});
			});
			break;
		default:
			console.error('Invalid position:', position);
	}

	canvas.requestRenderAll();
};
