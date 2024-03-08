import { fabric } from 'fabric';
import { generateId } from '../..';
import { FillOptions, ObjectContainer, ObjectContainerOptions } from './ObjectContainer';

export interface ImageContainerOptions extends ObjectContainerOptions {
	src: string;
	objects: [fabric.Rect, fabric.Image];
}

/**
 * Image container extends ObjectContainer
 * - loadImage
 * - renderImage (private) - only used in loadImage
 * - objectFit (set)
 */

export const ImageContainer = fabric.util.createClass(ObjectContainer, {
	type: 'image-container',
	initialize(options: ImageContainerOptions) {
		this.callSuper('initialize', options);
		this.src = options.src;
	},
	async loadImage(src: string): Promise<fabric.ImageContainer> {
		return new Promise(resolve => {
			fabric.Image.fromURL(
				src,
				img => {
					const isWide = img.width! / img.height! > this.width / this.height;
					if (isWide) {
						img.scaleToWidth(this.width);
					} else {
						img.scaleToHeight(this.height);
					}
					img.set({
						originX: 'center',
						originY: 'center',
						data: { id: generateId() },
					});
					this.add(img);
					this.set({
						src,
					});
					this.setCoords();
					resolve(this);
				},
				{ crossOrigin: 'anonymous' },
			);
		});
	},
	async renderImage(image: fabric.Image): Promise<fabric.ImageContainer> {
		const src = image.getSrc() || '';
		return new Promise(resolve => {
			fabric.Image.fromURL(
				src,
				img => {
					img.set({
						originX: image.originX,
						originY: image.originY,
						left: image.left,
						top: image.top,
						angle: image.angle,
						scaleX: image.scaleX,
						scaleY: image.scaleY,
						data: image.data,
						width: image.width,
						height: image.height,
					});
					this.add(img);
					this.setCoords();
					resolve(this);
				},
				{ crossOrigin: 'anonymous' },
			);
		});
	},
	fitImageToContainer() {
		const object = this.getObject();
		const isWide = object.width! / object.height! > this.width / this.height;
		const scale = isWide ? this.width / object.width! : this.height / object.height!;
		object.scale(scale);
		this.setCoords();
	},
	toObject(propertiesToInclude: string[] = []) {
		return fabric.util.object.extend(this.callSuper('toObject', propertiesToInclude), {
			src: this.src,
			data: this.data,
			scaleX: this.scaleX,
			scaleY: this.scaleY,
		});
	},
});

ImageContainer.fromObject = (
	object: ImageContainerOptions,
	callback: (imageContainer: fabric.ImageContainer) => void,
) => {
	console.log('Loading ImageContainer from object', object);
	const imagebox = new ImageContainer({
		...object,
		src: object.src,
	}) as fabric.ImageContainer;

	const fill = object.objects[0].fill as FillOptions;
	imagebox._fillBackground(fill);

	if (object.src) {
		fabric.util.enlivenObjects(
			[object.objects[1]],
			([image]: fabric.Image[]) => {
				imagebox.renderImage(image).then(() => {
					callback(imagebox);
				});
			},
			'fabric',
		);
	} else {
		callback(imagebox);
	}
};

(fabric as any).ImageContainer = ImageContainer;
(fabric as any).ImageContainer.fromObject = ImageContainer.fromObject;

fabric.Object._fromObject('ImageContainer', ImageContainer.fromObject);
