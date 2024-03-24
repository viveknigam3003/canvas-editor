import 'fabric';
import { ObjectPosition } from './ObjectContainer';
import { ObjectFit, Properties } from './types';
import { ImageContainerProperties } from './ImageContainer';

declare module 'fabric' {
	namespace fabric {
		export interface Canvas {
			contextTop: CanvasRenderingContext2D;
			lowerCanvasEl: HTMLElement;
		}
		function ControlMouseEventHandler(
			eventData: MouseEvent,
			transformData: Transform,
			x: number,
			y: number,
		): boolean;

		function ControlStringHandler(
			eventData: MouseEvent,
			control: fabric.Control,
			fabricObject: fabric.Object,
		): string;

		export const controlsUtils: {
			rotationWithSnapping: ControlMouseEventHandler;
			scalingEqually: ControlMouseEventHandler;
			scalingYOrSkewingX: ControlMouseEventHandler;
			scalingXOrSkewingY: ControlMouseEventHandler;
			scaleCursorStyleHandler: ControlStringHandler;
			scaleSkewCursorStyleHandler: ControlStringHandler;
			scaleOrSkewActionName: ControlStringHandler;
			rotationStyleHandler: ControlStringHandler;
			wrapWithFixedAnchor: (fn: any) => any;
			wrapWithFireEvent: (eventName: string, fn: any) => any;
			changeWidth: any;
			getLocalPoint(
				transform: Transform,
				originX: string,
				originY: string,
				x: number,
				y: number,
			): { x: number; y: number };
		};
		interface ObjectContainer extends fabric.Group {
			properties: Properties;
			getBackgroundObject(): fabric.RoundedRect;
			getObject(): fabric.Object;
			setObjectPosition(position: ObjectPosition): void;
			setProperties(properties: Properties): void;
		}
		interface ImageContainer extends ObjectContainer {
			src: string;
			properties: ImageContainerProperties;
			loadImage(): Promise<fabric.ImageContainer>;
			renderImage(image: fabric.Image): Promise<fabric.ImageContainer>;
			setObjectFit(fit: ObjectFit): void;
		}
		interface TextContainer extends ObjectContainer {
			text: string;
			setObjectFit(fit: ObjectFit): void;
			getTextElement(): fabric.Text;
			setText(text: string): void;
		}
		interface RoundedRect extends fabric.Rect {
			cornerRadius: {
				tl: number;
				tr: number;
				br: number;
				bl: number;
			};
		}
	}
}
