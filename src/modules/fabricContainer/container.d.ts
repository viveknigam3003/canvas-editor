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
		}
		interface ImageContainer extends ObjectContainer {
			src: string;
			properties: ImageContainerProperties;
			loadImage(): Promise<fabric.ImageContainer>;
			renderImage(image: fabric.Image): Promise<fabric.ImageContainer>;
			setObjectFit(fit: ObjectFit): void;
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
