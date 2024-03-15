import { Canvas, FabricObject } from 'fabric';

export interface AnimationProps {
	canvas: Canvas;
	currentSelectedElements: FabricObject[];
	saveArtboardChanges: () => void;
}

export interface Keyframe {
	id: string;
	property: string;
	value: string | number;
	timeMark: number;
	easing: string;
}
