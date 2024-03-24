import 'fabric';
import { ObjectPosition } from './ObjectContainer';
import { ObjectFit, Properties } from './types';
import { ImageContainerProperties } from './ImageContainer';

declare module 'fabric' {
	namespace fabric {
		interface ObjectContainer extends fabric.Group {
			properties: Properties;
			getBackgroundObject(): fabric.RoundedRect;
			getObject(): fabric.Object;
			setObjectPosition(position: ObjectPosition): void;
			setProperties(properties: Properties): void;
			_setContainerProperty(property: string, value: any): void;
		}
		interface ImageContainer extends ObjectContainer {
			src: string;
			properties: ImageContainerProperties;
			_initialX: number;
			_initialY: number;
			isCropping: boolean;
			callSuper(methodName: string, ...args: any[]): any;
			_enterCropMode(): void;
			_leaveCropMode(): boolean;
			_onMouseDown(event: fabric.IEvent<MouseEvent>): void;
			_onMouseMove(event: fabric.IEvent<MouseEvent>): void;
			_onMouseUp(event: fabric.IEvent<MouseEvent>): void;
			onSelected(): void;
			loadImage(): Promise<fabric.ImageContainer>;
			renderImage(image: fabric.Image): Promise<fabric.ImageContainer>;
			setObjectFit(fit: ObjectFit): void;
			calculateFillScale(): number;
			calculateFitScale(): number;
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
