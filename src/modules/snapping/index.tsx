//TODO: optimize snapping
import { fabric } from 'fabric';
import React from 'react';
import { guidesRefType, snappingObjectType } from '../../types';
import { getCanvasVisibleTopLeft } from '../utils/canvasUtils';
import { getExtremePoints } from '../position/helpers';

export function snapToObject(
	target: snappingObjectType,
	objects: snappingObjectType[],
	guidesRef: React.MutableRefObject<guidesRefType>,
	canvasRef: React.MutableRefObject<fabric.Canvas | null>,
	snapDistance: number,
) {
	let left = false;
	let right = false;
	let top = false;
	let bottom = false;
	let centerX = false;
	let centerY = false;
	objects.forEach(function (obj) {
		if (obj === target) return;
		target.setCoords();
		obj.setCoords();
		const targetPoints = getExtremePoints(target);
		const objPoints = getExtremePoints(obj);

		//  *target left with object right
		if (Math.abs(targetPoints.left - objPoints.right) < snapDistance) {
			left = true;
			const leftt =
				target.angle > 180
					? objPoints.right - Math.abs(targetPoints.left - target.left)
					: objPoints.right + Math.abs(targetPoints.left - target.left);
			target.set({ left: leftt });
		}

		// target left wiht object left
		if (Math.abs(targetPoints.left - objPoints.left) < snapDistance) {
			left = true;
			const leftt =
				target.angle > 180
					? objPoints.left - Math.abs(targetPoints.left - target.left)
					: objPoints.left + Math.abs(targetPoints.left - target.left);
			target.set({ left: leftt });
		}
		// target right with object right
		if (Math.abs(targetPoints.right - objPoints.right) < snapDistance) {
			right = true;
			const leftt = objPoints.right - Math.abs(targetPoints.right - target.left);
			target.set({ left: leftt });
		}
		// target right with object left
		if (Math.abs(targetPoints.right - objPoints.left) < snapDistance) {
			right = true;
			const leftt = objPoints.left - Math.abs(targetPoints.right - target.left);
			target.set({ left: leftt });
		}

		// target left with object center
		const objcenter = (obj as fabric.Object).getCenterPoint();
		if (Math.abs(targetPoints.left - objcenter.x) < snapDistance) {
			left = true;
			const leftt =
				target.angle > 180
					? objcenter.x - Math.abs(targetPoints.left - target.left)
					: objcenter.x + Math.abs(targetPoints.left - target.left);
			target.set({ left: leftt });
		}
		// target right with object center
		if (Math.abs(targetPoints.right - objcenter.x) < snapDistance) {
			right = true;
			const leftt = objcenter.x - Math.abs(targetPoints.right - target.left);
			target.set({ left: leftt });
		}

		// target center with object left
		if (Math.abs(target.getCenterPoint().x - objPoints.left) < snapDistance) {
			centerX = true;
			const leftt = objPoints.left - Math.abs(target.getCenterPoint().x - target.left);
			target.set({ left: leftt });
		}

		// target center with object right
		if (Math.abs(target.getCenterPoint().x - objPoints.right) < snapDistance) {
			centerX = true;
			const leftt = objPoints.right - Math.abs(target.getCenterPoint().x - target.left);
			target.set({ left: leftt });
		}
		// target center with object center
		if (Math.abs(target.getCenterPoint().x - objcenter.x) < snapDistance) {
			centerX = true;
			const leftt = objcenter.x - Math.abs(target.getCenterPoint().x - target.left);
			target.set({ left: leftt });
		}
		// target top with object top
		if (Math.abs(targetPoints.top - objPoints.top) < snapDistance) {
			top = true;
			const topt =
				target.angle > 180
					? objPoints.top + Math.abs(targetPoints.top - target.top)
					: objPoints.top - Math.abs(targetPoints.top - target.top);
			target.set({ top: topt });
		}
		// target top with object bottom
		if (Math.abs(targetPoints.top - objPoints.bottom) < snapDistance) {
			top = true;
			const topt =
				target.angle > 180
					? objPoints.bottom + Math.abs(targetPoints.top - target.top)
					: objPoints.bottom - Math.abs(targetPoints.top - target.top);
			target.set({ top: topt });
		}
		// target top with object center
		if (Math.abs(targetPoints.top - objcenter.y) < snapDistance) {
			top = true;
			const topt =
				target.angle > 180
					? objcenter.y + Math.abs(targetPoints.top - target.top)
					: objcenter.y - Math.abs(targetPoints.top - target.top);
			target.set({ top: topt });
		}
		// target bottom with object top
		if (Math.abs(targetPoints.bottom - objPoints.top) < snapDistance) {
			bottom = true;
			const topt = objPoints.top - Math.abs(targetPoints.bottom - target.top);
			target.set({ top: topt });
		}
		// target bottom with object bottom
		if (Math.abs(targetPoints.bottom - objPoints.bottom) < snapDistance) {
			bottom = true;
			const topt = objPoints.bottom - Math.abs(targetPoints.bottom - target.top);
			target.set({ top: topt });
		}
		// target bottom with object center
		if (Math.abs(targetPoints.bottom - objcenter.y) < snapDistance) {
			bottom = true;
			const topt = objcenter.y - Math.abs(targetPoints.bottom - target.top);
			target.set({ top: topt });
		}

		// target center with object top
		if (Math.abs(target.getCenterPoint().y - objPoints.top) < snapDistance) {
			centerY = true;
			const topt =
				target.angle > 180
					? objPoints.top + Math.abs(target.getCenterPoint().y - target.top)
					: objPoints.top - Math.abs(target.getCenterPoint().y - target.top);

			target.set({ top: topt });
		}
		// target center with object bottom
		if (Math.abs(target.getCenterPoint().y - objPoints.bottom) < snapDistance) {
			centerY = true;
			const topt =
				target.angle > 180
					? objPoints.bottom + Math.abs(target.getCenterPoint().y - target.top)
					: objPoints.bottom - Math.abs(target.getCenterPoint().y - target.top);
			target.set({ top: topt });
		}
		// target center with object center
		if (Math.abs(target.getCenterPoint().y - objcenter.y) < snapDistance) {
			centerY = true;
			const topt =
				target.angle > 180
					? objcenter.y + Math.abs(target.getCenterPoint().y - target.top)
					: objcenter.y - Math.abs(target.getCenterPoint().y - target.top);
			target.set({ top: topt });
		}

		if (left) {
			const targetPoints = getExtremePoints(target);
			guidesRef?.current?.left?.set({ opacity: 1, left: targetPoints.left });
		} else {
			guidesRef?.current?.left?.set({ opacity: 0, left: target.left });
		}

		if (right) {
			const targetPoints = getExtremePoints(target);
			// guidesRef?.current?.left?.set({ opacity: 1, left: targetPoints.left });
			guidesRef?.current?.right?.set({ opacity: 1, left: targetPoints.right });
		} else {
			guidesRef?.current?.right?.set({ opacity: 0 });
		}

		if (top) {
			const targetPoints = getExtremePoints(target);
			guidesRef?.current?.top?.set({ opacity: 1, top: targetPoints.top });
		} else {
			guidesRef?.current?.top?.set({ opacity: 0 });
		}

		if (bottom) {
			const targetPoints = getExtremePoints(target);
			guidesRef?.current?.bottom?.set({ opacity: 1, top: targetPoints.bottom });
		} else {
			guidesRef?.current?.bottom?.set({ opacity: 0 });
		}
		if (centerX) {
			guidesRef?.current?.centerX?.set({ opacity: 1, left: target.getCenterPoint().x });
		} else {
			guidesRef?.current?.centerX?.set({ opacity: 0 });
		}
		if (centerY) {
			guidesRef?.current?.centerY?.set({ opacity: 1, top: target.getCenterPoint().y });
		} else {
			guidesRef?.current?.centerY?.set({ opacity: 0 });
		}
		// guidesRef?.current?.left?.setCoords();
		// guidesRef?.current?.right?.setCoords();
		// guidesRef?.current?.top?.setCoords();
		// guidesRef?.current?.bottom?.setCoords();
		// guidesRef?.current?.centerX?.setCoords();
		// guidesRef?.current?.centerY?.setCoords();
		canvasRef.current?.renderAll();
	});
}

export function createSnappingLines(canvasRef: React.MutableRefObject<fabric.Canvas | null>) {
	const canvasWidth = (canvasRef.current?.width as number) / (canvasRef.current?.getZoom() as number);
	const canvasHeight = (canvasRef.current?.height as number) / (canvasRef.current?.getZoom() as number);
	const { top, left } = getCanvasVisibleTopLeft(canvasRef);
	const defaultSnapLineProps = {
		opacity: 0,
		evented: false,
		selectable: false,
		stroke: 'blue',
		data: {
			isSaveExclude: true,
			type: 'snapLine',
		},
	};
	const guidesRef = {
		left: new fabric.Line([0, 0, 0, canvasHeight], {
			...defaultSnapLineProps,
			top,
			stroke: 'red',
		}),
		top: new fabric.Line([0, 0, canvasWidth, 0], {
			...defaultSnapLineProps,
			left,
			stroke: 'green',
		}),
		right: new fabric.Line([0, 0, 0, canvasHeight], { ...defaultSnapLineProps, top, stroke: 'black' }),
		bottom: new fabric.Line([0, 0, canvasWidth, 0], { ...defaultSnapLineProps, left, stroke: 'purple' }),
		centerX: new fabric.Line([0, 0, 0, canvasHeight], { ...defaultSnapLineProps, top, stroke: 'orange' }),
		centerY: new fabric.Line([0, 0, canvasWidth, 0], { ...defaultSnapLineProps, left, stroke: 'pink' }),
	};
	canvasRef.current
		?.getObjects()
		.filter(obj => obj?.data?.type == 'snapLine')
		.forEach(obj => canvasRef.current?.remove(obj));
	canvasRef.current?.add(
		guidesRef.left,
		guidesRef.top,
		guidesRef.right,
		guidesRef.bottom,
		guidesRef.centerX,
		guidesRef.centerY,
	);
	return guidesRef;
}
