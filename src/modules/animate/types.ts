export interface AnimationProps {
	canvas: fabric.Canvas;
	currentSelectedElements: fabric.Object[];
	saveArtboardChanges: () => void;
}

export interface Keyframe {
	id: string;
	property: string;
	value: string | number;
	timeMark: number;
	easing: string;
}
