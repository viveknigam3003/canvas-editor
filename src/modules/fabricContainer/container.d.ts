import 'fabric';
import { FillOptions, ObjectPosition } from './ObjectContainer';

declare module 'fabric' {
	namespace fabric {
		interface ObjectContainer extends fabric.Group {
			type: string;
			containerProperties: {
				objectPosition: ObjectPosition;
			};
			getBackgroundObject(): fabric.Rect;
			getObject(): fabric.Object;
			setObjectPosition(position: ObjectPosition): void;
			_fillBackground(fill: FillOptions): void;
			_setContainerProperty(property: string, value: any): void;
		}
		interface ImageContainer extends ObjectContainer {
			type: string;
			loadImage(src: string): Promise<fabric.ImageContainer>;
			renderImage(image: fabric.Image): Promise<fabric.ImageContainer>;
			fitImageToContainer(): void;
		}
	}
}
