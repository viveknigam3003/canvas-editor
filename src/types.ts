import { FabricObject, Line } from 'fabric';

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
} & FabricObject;

export type guidesRefType = {
	left: null | Line;
	top: null | Line;
	right: null | Line;
	bottom: null | Line;
	centerX: null | Line;
	centerY: null | Line;
};

// utility types
type Grow<T, A extends Array<T>> = ((x: T, ...xs: A) => void) extends (...a: infer X) => void ? X : never;

type GrowToSize<T, A extends Array<T>, N extends number> = {
	0: A;
	1: GrowToSize<T, Grow<T, A>, N>;
}[A['length'] extends N ? 0 : 1];

export type FixedArray<T, N extends number> = GrowToSize<T, [], N>;
