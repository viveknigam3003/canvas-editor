import 'fabric';
import { ObjectPosition } from './ObjectContainer';
import { Properties } from './types';

declare module 'fabric' {
	namespace fabric {
		interface ObjectContainer extends fabric.Group {
			properties: Properties;
			getBackgroundObject(): fabric.Rect;
			getObject(): fabric.Object;
			setObjectPosition(position: ObjectPosition): void;
			setProperties(properties: Properties): void;
		}
		interface ImageContainer extends ObjectContainer {
			src: string;
			loadImage(): Promise<fabric.ImageContainer>;
			renderImage(image: fabric.Image): Promise<fabric.ImageContainer>;
			fitImageToContainer(): void;
		}
	}
}
