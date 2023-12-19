// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck
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
	// Adjust this value to set the snapping distance
	let left = false;
	let right = false;
	let top = false;
	let bottom = false;
	let centerX = false;
	let centerY = false;
	objects.forEach(function (obj) {
		if (obj === target) return;

		// Snap to the top edge
		if (Math.abs(target.top - obj.top - obj.getScaledHeight()) < snapDistance) {
			target.set({ top: obj.top + obj.getScaledHeight() });
			top = true;
		}
		if (Math.abs(target.top - obj.top) < snapDistance) {
			target.set({ top: obj.top });
			top = true;
		}
		if (Math.abs(target.top - obj.top - obj.getScaledHeight() / 2) < snapDistance) {
			top = true;
			target.set({ top: obj.top + obj.getScaledHeight() / 2 });
		}
		// if (Math.abs(target.top - obj.top - obj.getScaledHeight() / 2) < snapDistance) {
		// 	target.set({ top: obj.top + obj.getScaledHeight() / 2 });
		// 	top = true;
		// }

		// Snap to the bottom edge
		if (Math.abs(target.top + target.getScaledHeight() - obj.top) < snapDistance) {
			target.set({ top: obj.top - target.getScaledHeight() });
			bottom = true;
		}

		if (Math.abs(target.top + target.getScaledHeight() - obj.top - obj.getScaledHeight()) < snapDistance) {
			target.set({ top: obj.top + obj.getScaledHeight() - target.getScaledHeight() });
			bottom = true;
		}

		if (Math.abs(target.top + target.getScaledHeight() - obj.top - obj.getScaledHeight() / 2) < snapDistance) {
			bottom = true;
			target.set({ top: obj.top + obj.getScaledHeight() / 2 - target.getScaledHeight() });
		}

		// if (
		// 	Math.abs(target.top + target.getScaledHeight() - obj.top - obj.getScaledHeight() / 2) < snapDistance
		// ) {
		// 	target.set({ top: obj.top - target.getScaledHeight() / 2 });
		// 	bottom = true;
		// }

		// Snap to the left edge
		if (Math.abs(target.left - obj.left - obj.getScaledWidth()) < snapDistance) {
			left = true;
			target.set({ left: obj.left + obj.getScaledWidth() });
		}
		if (Math.abs(target.left - obj.left) < snapDistance) {
			left = true;
			target.set({ left: obj.left });
		}
		if (Math.abs(target.left - obj.left - obj.getScaledWidth() / 2) < snapDistance) {
			left = true;
			target.set({ left: obj.left + obj.getScaledWidth() / 2 });
		}
		// Snap to the right edge
		if (Math.abs(target.left + target.getScaledWidth() - obj.left) < snapDistance) {
			target.set({ left: obj.left - target.getScaledWidth() });
			right = true;
		}

		if (Math.abs(target.left + target.getScaledWidth() - obj.left - obj.getScaledWidth()) < snapDistance) {
			target.set({ left: obj.left + obj.getScaledWidth() - target.getScaledWidth() });
			right = true;
		}

		if (Math.abs(target.left + target.getScaledWidth() - obj.left - obj.getScaledWidth() / 2) < snapDistance) {
			right = true;
			target.set({ left: obj.left + obj.getScaledWidth() / 2 - target.getScaledWidth() });
		}
		// write snap for target center with object left center and right side
		// Snap to the center horizontally
		if (Math.abs(target.left + target.getScaledWidth() / 2 - obj.left - obj.getScaledWidth() / 2) < snapDistance) {
			target.set({ left: obj.left + obj.getScaledWidth() / 2 - target.getScaledWidth() / 2 });
			centerX = true;
		}
		// snap target center with object left
		if (Math.abs(target.left + target.getScaledWidth() / 2 - obj.left) < snapDistance) {
			target.set({ left: obj.left - target.getScaledWidth() / 2 });
			centerX = true;
		}
		//snap target center with object right
		if (Math.abs(target.left + target.getScaledWidth() / 2 - obj.left - obj.getScaledWidth()) < snapDistance) {
			target.set({ left: obj.left + obj.getScaledWidth() - target.getScaledWidth() / 2 });
			centerX = true;
		}

		// Snap to the center vertically
		if (Math.abs(target.top + target.getScaledHeight() / 2 - obj.top - obj.getScaledHeight() / 2) < snapDistance) {
			target.set({ top: obj.top + obj.getScaledHeight() / 2 - target.getScaledHeight() / 2 });
			centerY = true;
		}
		// snap target center with object top
		if (Math.abs(target.top + target.getScaledHeight() / 2 - obj.top) < snapDistance) {
			target.set({ top: obj.top - target.getScaledHeight() / 2 });
			centerY = true;
		}

		// snap target center with object bottom
		if (Math.abs(target.top + target.getScaledHeight() / 2 - obj.top - obj.getScaledHeight()) < snapDistance) {
			target.set({ top: obj.top + obj.getScaledHeight() - target.getScaledHeight() / 2 });
			centerY = true;
		}

		if (left) {
			guidesRef.current.left.set({ opacity: 1, left: target.left });
		} else {
			guidesRef.current.left.set({ opacity: 0, left: target.left });
		}

		if (right) {
			guidesRef.current.right.set({ opacity: 1, left: target.left + target.getScaledWidth() });
		} else {
			guidesRef.current.right.set({ opacity: 0 });
		}

		if (top) {
			guidesRef.current.top.set({ opacity: 1, top: target.top });
		} else {
			guidesRef.current.top.set({ opacity: 0 });
		}

		if (bottom) {
			guidesRef.current.bottom.set({ opacity: 1, top: target.top + target.getScaledHeight() });
		} else {
			guidesRef.current.bottom.set({ opacity: 0 });
		}
		if (centerX) {
			guidesRef.current.centerX.set({ opacity: 1, left: target.left + target.getScaledWidth() / 2 });
		} else {
			guidesRef.current.centerX.set({ opacity: 0 });
		}
		if (centerY) {
			guidesRef.current.centerY.set({ opacity: 1, top: target.top + target.getScaledHeight() / 2 });
		} else {
			guidesRef.current.centerY.set({ opacity: 0 });
		}
		canvasRef.current?.renderAll();
	});
}

export function createSnappingLines(
	canvasRef: React.MutableRefObject<fabric.Canvas | null>,
	artboardRef: React.MutableRefObject<fabric.Rect | null>,
) {
	const guidesRef = {
		// left: new fabric.Line([0, 0, 0, 0], {}),
		left: new fabric.Line([0, artboardRef?.current?.width, 0, 0], {
			opacity: 0,
			top: artboardRef?.current?.top,
			evented: false,
			selectable: false,
			hasControls: false,
			hasBorders: false,
			stroke: 'green',
			strokeWidth: 2,
			isSnappingLine: true,
		}),
		top: new fabric.Line([0, 0, artboardRef?.current?.height, 0], {
			evented: false,
			opacity: 0,
			left: artboardRef?.current?.left,
			selectable: false,
			hasControls: false,
			hasBorders: false,
			stroke: 'red',
			strokeWidth: 2,
			isSnappingLine: true,
		}),
		right: new fabric.Line([0, artboardRef?.current?.width, 0, 0], {
			opacity: 0,
			top: artboardRef?.current?.top,
			evented: false,
			hasControls: false,
			hasBorders: false,
			selectable: false,
			stroke: 'red',
			strokeWidth: 2,
			isSnappingLine: true,
		}),
		bottom: new fabric.Line([0, 0, artboardRef?.current?.width, 0], {
			evented: false,
			left: artboardRef?.current?.left,
			selectable: false,
			hasControls: false,
			hasBorders: false,
			opacity: 0,
			stroke: 'red',
			strokeWidth: 2,
			isSnappingLine: true,
		}),
		centerX: new fabric.Line([0, artboardRef?.current?.height, 0, 0], {
			evented: false,
			selectable: false,
			top: artboardRef?.current?.top,
			hasControls: false,
			hasBorders: false,
			opacity: 0,
			stroke: 'orange',
			strokeWidth: 2,
			isSnappingLine: true,
		}),
		centerY: new fabric.Line([0, 0, artboardRef?.current?.height, 0], {
			evented: false,
			selectable: false,
			hasControls: false,
			hasBorders: false,
			left: artboardRef?.current?.left,
			opacity: 0,
			stroke: 'purple',
			strokeWidth: 2,
			isSnappingLine: true,
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
