import { IGradientOptions, IPatternOptions } from 'fabric/fabric-impl';

export type FillOptions = IGradientOptions | IPatternOptions | string;

export type ObjectPosition =
	| 'top-left'
	| 'top-center'
	| 'top-right'
	| 'center-left'
	| 'center'
	| 'center-right'
	| 'bottom-left'
	| 'bottom-center'
	| 'bottom-right';

export type BorderPosition = 'center' | 'inside' | 'outside';

export type Border = {
	color: string;
	style: 'dashed' | 'solid';
	top: number;
	right: number;
	bottom: number;
	left: number;
	position?: BorderPosition;
	dashWidth?: number;
	dashGap?: number;
	dashCap?: string;
};

export type ObjectFit = 'fill' | 'fit' | 'custom';

export type Padding = {
	top: number;
	right: number;
	bottom: number;
	left: number;
};

export type Radius = {
	top: number;
	right: number;
	bottom: number;
	left: number;
};

export type Properties = {
	objectPosition: ObjectPosition;
	border: Border;
	fill: FillOptions;
	padding: Padding;
	radius: Radius;
	objectFit: ObjectFit;
	inner: Inner;
};

export type Inner = {
	top: number;
	left: number;
	width: number;
	height: number;
};
