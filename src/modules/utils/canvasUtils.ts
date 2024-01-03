import { FixedArray } from '../../types';

export const getCanvasVisibleTopLeft = (canvasRef: React.MutableRefObject<fabric.Canvas | null>) => {
	const canvas = canvasRef.current as fabric.Canvas;
	const vpt = canvas.viewportTransform as FixedArray<number, 6>;
	const scrollTop = window.scrollY || document.documentElement.scrollTop;
	const scrollLeft = window.scrollX || document.documentElement.scrollLeft;
	const visibleTop = -vpt[5] / vpt[0] + scrollTop / vpt[0];
	const visibleLeft = -vpt[4] / vpt[0] + scrollLeft / vpt[0];
	return { top: visibleTop, left: visibleLeft };
};
