export interface Artboard {
	id: string;
	name: string;
	width: number;
	height: number;
	state?: Record<string, any>;
}

export type colorSpaceType = 'srgb' | 'display-p3';

export type snappingObjectType = {
	top: number;
	left: number;
	getScaledHeight: () => number;
	getScaledWidth: () => number;
	set(props: { top?: number; left?: number }): void;
};

export type guidesRefType = {
	left: null | fabric.Line;
	top: null | fabric.Line;
	right: null | fabric.Line;
	bottom: null | fabric.Line;
	centerX: null | fabric.Line;
	centerY: null | fabric.Line;
};
