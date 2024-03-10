import { fabric } from 'fabric';
import { generateId } from '../..';
import { ObjectContainer, ObjectContainerOptions } from './ObjectContainer';
import { ObjectFit } from './types';

export interface ImageContainerOptions extends ObjectContainerOptions {
	src: string;
	fitScale?: number;
	fillScale?: number;
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
		this.fitScale = 1;
		this.fillScale = 1;
	},
	async loadImage(): Promise<fabric.ImageContainer> {
		return new Promise(resolve => {
			fabric.Image.fromURL(
				this.src,
				img => {
					const isWide = img.width! / img.height! > this.width / this.height;

					// Constant values for the image
					this.fitScale = isWide ? this.width / img.width! : this.height / img.height!;
					this.fillScale = isWide ? this.height / img.height! : this.width / img.width!;

					console.log('Fit Scale', this.fitScale, 'Fill Scale', this.fillScale);

					img.set({
						originX: 'center',
						originY: 'center',
						data: { id: generateId() },
					});
					this.add(img);
					this.setObjectFit('fit');
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
	_fitImageToContainer() {
		const object = this.getObject();
		if (object && this.fitScale) {
			object.scale(this.fitScale);
			this.setCoords();
			this._setContainerProperty('objectFit', 'fit');
		}
	},
	_fillImageInContainer() {
		const object = this.getObject();
		if (object && this.fillScale) {
			object.scale(this.fillScale);
			this.setCoords();
			this._setContainerProperty('objectFit', 'fill');
		}
	},
	setObjectFit(fit: ObjectFit) {
		if (fit === 'fill') {
			this._fillImageInContainer();
		} else if (fit === 'fit') {
			this._fitImageToContainer();
		} else {
			this._setContainerProperty('objectFit', 'custom');
		}
	},
	toObject(propertiesToInclude: string[] = []) {
		return fabric.util.object.extend(this.callSuper('toObject', propertiesToInclude), {
			src: this.src,
			fitScale: this.fitScale,
			fillScale: this.fillScale,
		});
	},
});

ImageContainer.fromObject = (
	object: ImageContainerOptions,
	callback: (imageContainer: fabric.ImageContainer) => void,
) => {
	const imagebox = new ImageContainer({
		...object,
		src: object.src,
	}) as fabric.ImageContainer;
	imagebox.fillScale = object.fillScale;
	imagebox.fitScale = object.fitScale;

	imagebox.setProperties(object.properties);
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
