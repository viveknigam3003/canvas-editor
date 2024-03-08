import 'fabric';
import { ObjectPosition } from './ObjectContainer';

declare module 'fabric' {
	namespace fabric {
		interface ObjectContainer extends fabric.Group {
			type: string;
			getBackgroundObject(): fabric.Rect;
			getObject(): fabric.Object;
			fillBackground(fill: fabric.Rect['fill']): void;
			setObjectPosition(position: ObjectPosition): void;
		}
		interface ImageContainer extends ObjectContainer {
			type: string;
			loadImage(src: string): Promise<fabric.ImageContainer>;
			renderImage(image: fabric.Image): Promise<fabric.ImageContainer>;
		}
	}
}
