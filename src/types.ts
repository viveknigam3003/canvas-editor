export interface Artboard {
	id: string;
	name: string;
	width: number;
	height: number;
	state?: Record<string, any>;
}

export type colorSpaceType = 'srgb' | 'display-p3';
