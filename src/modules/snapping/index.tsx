//TODO: optimize snapping
import { fabric } from 'fabric';
import React from 'react';

export function snapToObject(
	target: fabric.Object,
	objects: fabric.Object[],
	guidesRef: React.MutableRefObject<{
		top: fabric.Line;
		bottom: fabric.Line;
		left: fabric.Line;
		right: fabric.Line;
		centerX: fabric.Line;
		centerY: fabric.Line;
	}>,
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
		const targetTop = target.top as number;
		const targetLeft = target.left as number;
		const objTop = obj.top as number;
		const objLeft = obj.left as number;
		if (Math.abs(targetTop - objTop - obj.getScaledHeight()) < snapDistance) {
			target.set({ top: objTop + obj.getScaledHeight() });
			top = true;
		}
		if (Math.abs(targetTop - objTop) < snapDistance) {
			target.set({ top: objTop });
			top = true;
		}
		if (Math.abs(targetTop - objTop - obj.getScaledHeight() / 2) < snapDistance) {
			top = true;
			target.set({ top: objTop + obj.getScaledHeight() / 2 });
		}
		if (Math.abs(targetTop + target.getScaledHeight() - objTop) < snapDistance) {
			target.set({ top: objTop - target.getScaledHeight() });
			bottom = true;
		}
		if (Math.abs(targetTop + target.getScaledHeight() - objTop - obj.getScaledHeight()) < snapDistance) {
			target.set({ top: objTop + obj.getScaledHeight() - target.getScaledHeight() });
			bottom = true;
		}
		if (Math.abs(targetTop + target.getScaledHeight() - objTop - obj.getScaledHeight() / 2) < snapDistance) {
			bottom = true;
			target.set({ top: objTop + obj.getScaledHeight() / 2 - target.getScaledHeight() });
		}
		if (Math.abs(targetLeft - objLeft - obj.getScaledWidth()) < snapDistance) {
			left = true;
			target.set({ left: objLeft + obj.getScaledWidth() });
		}
		if (Math.abs(targetLeft - objLeft) < snapDistance) {
			left = true;
			target.set({ left: objLeft });
		}
		if (Math.abs(targetLeft - objLeft - obj.getScaledWidth() / 2) < snapDistance) {
			left = true;
			target.set({ left: objLeft + obj.getScaledWidth() / 2 });
		}
		if (Math.abs(targetLeft + target.getScaledWidth() - objLeft) < snapDistance) {
			target.set({ left: objLeft - target.getScaledWidth() });
			right = true;
		}
		if (Math.abs(targetLeft + target.getScaledWidth() - objLeft - obj.getScaledWidth()) < snapDistance) {
			target.set({ left: objLeft + obj.getScaledWidth() - target.getScaledWidth() });
			right = true;
		}
		if (Math.abs(targetLeft + target.getScaledWidth() - objLeft - obj.getScaledWidth() / 2) < snapDistance) {
			right = true;
			target.set({ left: objLeft + obj.getScaledWidth() / 2 - target.getScaledWidth() });
		}
		if (Math.abs(targetLeft + target.getScaledWidth() / 2 - objLeft - obj.getScaledWidth() / 2) < snapDistance) {
			target.set({ left: objLeft + obj.getScaledWidth() / 2 - target.getScaledWidth() / 2 });
			centerX = true;
		}
		if (Math.abs(targetLeft + target.getScaledWidth() / 2 - objLeft) < snapDistance) {
			target.set({ left: objLeft - target.getScaledWidth() / 2 });
			centerX = true;
		}
		if (Math.abs(targetLeft + target.getScaledWidth() / 2 - objLeft - obj.getScaledWidth()) < snapDistance) {
			target.set({ left: objLeft + obj.getScaledWidth() - target.getScaledWidth() / 2 });
			centerX = true;
		}
		if (Math.abs(targetTop + target.getScaledHeight() / 2 - objTop - obj.getScaledHeight() / 2) < snapDistance) {
			target.set({ top: objTop + obj.getScaledHeight() / 2 - target.getScaledHeight() / 2 });
			centerY = true;
		}
		if (Math.abs(targetTop + target.getScaledHeight() / 2 - objTop) < snapDistance) {
			target.set({ top: objTop - target.getScaledHeight() / 2 });
			centerY = true;
		}
		if (Math.abs(targetTop + target.getScaledHeight() / 2 - objTop - obj.getScaledHeight()) < snapDistance) {
			target.set({ top: objTop + obj.getScaledHeight() - target.getScaledHeight() / 2 });
			centerY = true;
		}
		if (left) {
			guidesRef.current.left.set({ opacity: 1, left: targetLeft });
		} else {
			guidesRef.current.left.set({ opacity: 0, left: targetLeft });
		}
		if (right) {
			guidesRef.current.right.set({ opacity: 1, left: targetLeft + target.getScaledWidth() });
		} else {
			guidesRef.current.right.set({ opacity: 0 });
		}
		if (top) {
			guidesRef.current.top.set({ opacity: 1, top: targetTop });
		} else {
			guidesRef.current.top.set({ opacity: 0 });
		}
		if (bottom) {
			guidesRef.current.bottom.set({ opacity: 1, top: targetTop + target.getScaledHeight() });
		} else {
			guidesRef.current.bottom.set({ opacity: 0 });
		}
		if (centerX) {
			guidesRef.current.centerX.set({ opacity: 1, left: targetLeft + target.getScaledWidth() / 2 });
		} else {
			guidesRef.current.centerX.set({ opacity: 0 });
		}
		if (centerY) {
			guidesRef.current.centerY.set({ opacity: 1, top: targetTop + target.getScaledHeight() / 2 });
		} else {
			guidesRef.current.centerY.set({ opacity: 0 });
		}
		canvasRef.current?.requestRenderAll();
	});
}

export function createSnappingLines(
	canvasRef: React.MutableRefObject<fabric.Canvas | null>,
	artboardRef: React.MutableRefObject<fabric.Rect | null>,
) {
	const artboardWidth = artboardRef.current?.width as number;
	const artboardHeight = artboardRef.current?.height as number;
	const defaultSnapLineProps = {
		opacity: 0,
		evented: false,
		selectable: false,
		stroke: 'blue',
		isSnappingLine: true,
		hasControls: false,
		hasBorders: false,
		strokeWidth: 2,
	};
	const guidesRef = {
		left: new fabric.Line([0, artboardWidth, 0, 0], {
			top: artboardRef?.current?.top,
			...defaultSnapLineProps,
		}),
		top: new fabric.Line([0, 0, artboardHeight, 0], {
			left: artboardRef?.current?.left,
			...defaultSnapLineProps,
		}),
		right: new fabric.Line([0, artboardWidth, 0, 0], {
			top: artboardRef?.current?.top,
			...defaultSnapLineProps,
		}),
		bottom: new fabric.Line([0, 0, artboardWidth, 0], {
			left: artboardRef?.current?.left,
			...defaultSnapLineProps,
		}),
		centerX: new fabric.Line([0, artboardHeight, 0, 0], {
			top: artboardRef?.current?.top,
			...defaultSnapLineProps,
		}),
		centerY: new fabric.Line([0, 0, artboardHeight, 0], {
			left: artboardRef?.current?.left,
			...defaultSnapLineProps,
		}),
	};
	canvasRef.current
		?.getObjects()
		.filter(obj => obj.isSnappingLine)
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
