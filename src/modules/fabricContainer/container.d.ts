import 'fabric';

declare module 'fabric' {
	namespace fabric {
		interface ObjectContainer extends fabric.Group {
			type: string;
			getBackgrounElement(): fabric.Rect;
			getElement(): fabric.Object;
		}
		interface ImageContainer extends fabric.ObjectContainer {
			type: string;
			loadImage(src: string): Promise<fabric.ImageContainer>;
			renderImage(image: fabric.Image): Promise<fabric.ImageContainer>;
		}
	}
}
