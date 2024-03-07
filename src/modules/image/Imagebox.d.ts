import { Group as FabricGroup, Image as FabricImage } from 'fabric/fabric-impl';

declare module 'fabric' {
	namespace fabric {
		interface Imagebox extends FabricGroup {
			src?: string;
			loadImage(src: string): Promise<Imagebox>;
			renderImage(image: FabricImage): Promise<Imagebox>;
		}
	}
}
