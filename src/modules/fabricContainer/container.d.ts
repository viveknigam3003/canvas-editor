import 'fabric';
import { ObjectPosition } from './ObjectContainer';
import { ObjectFit, Properties } from './types';

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
			fitScale?: number;
			fillScale?: number;
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
