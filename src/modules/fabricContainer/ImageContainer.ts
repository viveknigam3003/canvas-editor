import { fabric } from 'fabric';
import { generateId } from '../..';
import { ObjectContainer, ObjectContainerOptions } from './ObjectContainer';
import { ObjectFit } from './types';

export type ImageContainerProperties = ObjectContainerOptions['properties'] & {
	objectFit: ObjectFit;
	isCropping: boolean;
};

export interface ImageContainerOptions extends ObjectContainerOptions {
	src: string;
	objects: [fabric.Rect, fabric.Image];
	properties: ImageContainerProperties;
}

export const ImageContainer = fabric.util.createClass(ObjectContainer, {
	type: 'image-container',
	initialize(this: fabric.ImageContainer, options: ImageContainerOptions) {
		this.callSuper('initialize', options);
		this.src = options.src;
		this._initialX = 0;
		this._initialY = 0;
		this.isCropping = false;
		this.properties = {
			...this.properties,
			objectFit: options.properties?.objectFit || 'fit',
		};

		// Bind methods once to maintain reference for adding/removing event listeners
		this._onMouseDown = this._onMouseDown.bind(this);
		this._onMouseMove = this._onMouseMove.bind(this);
		this._onMouseUp = this._onMouseUp.bind(this);

		this.on('mousedblclick', this._enterCropMode.bind(this));
		this.on('selected', this.onSelected.bind(this));
		this.onDeselect = this._leaveCropMode.bind(this);
	},
	onSelected(this: fabric.ImageContainer) {
		this.canvas?.on('mouse:down', this._onMouseDown);
	},
	_leaveCropMode(this: fabric.ImageContainer) {
		console.log('Leaving crop mode', this.isCropping);

		console.log('Leaving crop mode', this.isCropping);

		this.isCropping = false;
		this.lockMovementX = false;
		this.lockMovementY = false;

		// Correctly remove event listeners using bound function references
		const canvas = this.canvas;
		// @ts-ignore
		canvas?.off('mouse:down', this._onMouseDown);
		// @ts-ignore
		canvas?.off('mouse:move', this._onMouseMove);
		// @ts-ignore
		canvas?.off('mouse:up', this._onMouseUp);

		return false;
	},
	_enterCropMode(this: fabric.ImageContainer) {
		console.log('Entering crop mode');
		if (this.properties.objectFit !== 'crop') return;

		this.isCropping = true;
		this.lockMovementX = true;
		this.lockMovementY = true;
	},
	_onMouseDown: function (this: fabric.ImageContainer, e: fabric.IEvent<MouseEvent>) {
		if (!this.isCropping) return;
		console.log('Mouse down, custom drag starts');

		this._initialX = e.e.clientX;
		this._initialY = e.e.clientY;

		const canvas = this.canvas;
		canvas?.on('mouse:move', this._onMouseMove);
		canvas?.on('mouse:up', this._onMouseUp);
	},
	_onMouseMove: function (this: fabric.ImageContainer, e: fabric.IEvent<MouseEvent>) {
		if (!this.isCropping) return;

		const deltaX = e.e.clientX - this._initialX;
		const deltaY = e.e.clientY - this._initialY;

		const obj = this.item(1);
		if (obj) {
			obj.set({
				left: obj.left! + deltaX,
				top: obj.top! + deltaY,
			});

			this._initialX = e.e.clientX;
			this._initialY = e.e.clientY;

			this.dirty = true;
			this.canvas?.renderAll();
		}
	},
	_onMouseUp: function (this: fabric.ImageContainer, e: fabric.IEvent<MouseEvent>) {
		console.log('Mouse up, custom drag ends');
		const canvas = this.canvas;

		// Correctly remove event listeners
		// @ts-ignore
		canvas?.off('mouse:move', this._onMouseMove);
		// @ts-ignore
		canvas?.off('mouse:up', this._onMouseUp);
	},
	async loadImage(): Promise<fabric.ImageContainer> {
		return new Promise(resolve => {
			fabric.Image.fromURL(
				this.src,
				img => {
					img.set({
						originX: 'center',
						originY: 'center',
						data: { id: generateId(), ignoreSnapping: true },
					});
					this.add(img);
					this.setObjectFit(this.properties.objectFit || 'fit');
					this.setCoords();
					resolve(this);
				},
				{ crossOrigin: 'anonymous', hasControls: false },
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
	_fitImageToContainer(this: fabric.ImageContainer) {
		const object = this.getObject();
		if (object) {
			const fitScale = this.calculateFitScale();
			object.scale(fitScale);
			this.setCoords();
			this.setObjectPosition(this.properties.objectPosition || 'center');
			this._setContainerProperty('objectFit', 'fit');
		}
	},
	_fillImageInContainer(this: fabric.ImageContainer) {
		const object = this.getObject();
		if (object) {
			const fillScale = this.calculateFillScale();
			object.scale(fillScale);
			this.setCoords();
			this.setObjectPosition(this.properties.objectPosition || 'center');
			this._setContainerProperty('objectFit', 'fill');
		}
	},
	calculateFitScale() {
		const object = this.getObject();
		if (object) {
			const isWide = object.width! / object.height! > this.width / this.height;
			return isWide ? this.width / object.width! : this.height / object.height!;
		}
		return 1;
	},
	calculateFillScale() {
		const object = this.getObject();
		if (object) {
			const isWide = object.width! / object.height! > this.width / this.height;
			return isWide ? this.height / object.height! : this.width / object.width!;
		}
		return 1;
	},

	setObjectFit(fit: ObjectFit) {
		if (fit === 'fill') {
			this._fillImageInContainer();
		} else if (fit === 'fit') {
			this._fitImageToContainer();
		} else if (fit === 'crop') {
			this._setContainerProperty('objectFit', 'crop');
		}
	},
	toObject(propertiesToInclude: string[] = []) {
		return fabric.util.object.extend(this.callSuper('toObject', propertiesToInclude), {
			src: this.src,
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

	imagebox.setProperties(object.properties);
	if (object.src) {
		const imageObject = object.objects[1];

		if (imageObject.type !== 'image') {
			throw new Error('ImageContainer.fromObject: object[1] is not an image');
		}

		fabric.util.enlivenObjects(
			[imageObject],
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

const originalMRControl = (fabric as any).ImageContainer.prototype.controls.mr;
(fabric as any).ImageContainer.prototype.controls.mr = new fabric.Control({
	...originalMRControl,
	actionHandler(_eventData, transformData, x, y) {
		const { target } = transformData;

		if (!target) {
			return false;
		}

		const { width } = target;
		if (!width) {
			return false;
		}

		// @ts-ignore
		fabric.controlsUtils.wrapWithFixedAnchor(fabric.controlsUtils.changeWidth)(_eventData, transformData, x, y);
		const objectFit = (target as fabric.ImageContainer).properties.objectFit;
		(target as fabric.ImageContainer).setObjectFit(objectFit);
		if (objectFit !== 'crop') {
			const objectPosition = (target as fabric.ImageContainer).properties.objectPosition;
			(target as fabric.ImageContainer).setObjectPosition(objectPosition);
		}

		const backgroundObject = (target as fabric.ImageContainer).getBackgroundObject();
		backgroundObject.set({
			width: target.width,
			left: -target.width! / 2,
		});
		target.clipPath?.set({
			width: target.width,
			left: -target.width! / 2,
		});

		return true;
	},
});

export const changeHeight: any = (_eventData: any, transform: any, x: number, y: number) => {
	// @ts-ignore
	const localPoint = fabric.controlsUtils.getLocalPoint(transform, transform.originX, transform.originY, x, y);
	const { target } = transform;
	if ((transform.originY === 'top' && localPoint.y > 0) || (transform.originY === 'bottom' && localPoint.y < 0)) {
		const strokeWidth = target.strokeWidth ? target.strokeWidth : 0;
		if (!target.scaleY) return false;
		const strokePadding = strokeWidth / (target.strokeUniform ? target.scaleY : 1);
		const oldHeight = target.height;
		const newHeight = Math.ceil(Math.abs((localPoint.y * 1) / target.scaleY) - strokePadding);
		target.set('height', Math.max(newHeight, 0));
		return oldHeight !== target.height;
	}
	return false;
};

const originalMBControl = (fabric as any).ImageContainer.prototype.controls.mb;
(fabric as any).ImageContainer.prototype.controls.mb = new fabric.Control({
	...originalMBControl,
	actionHandler(_eventData, transformData, x, y) {
		// Only increase height of object, not scaleY
		const { target } = transformData;

		if (!target) {
			return false;
		}

		const { height } = target;
		if (!height) {
			return false;
		}

		// @ts-ignore
		fabric.controlsUtils.wrapWithFixedAnchor(changeHeight)(_eventData, transformData, x, y);
		const objectFit = (target as fabric.ImageContainer).properties.objectFit;
		(target as fabric.ImageContainer).setObjectFit(objectFit);
		if (objectFit !== 'crop') {
			const objectPosition = (target as fabric.ImageContainer).properties.objectPosition;
			(target as fabric.ImageContainer).setObjectPosition(objectPosition);
		}
		(target as fabric.ImageContainer).getBackgroundObject().set({
			height: target.height,
			top: -target.height! / 2,
		});

		target.clipPath?.set({
			height: target.height,
			top: -target.height! / 2,
		});

		target.setCoords();
		return true;
	},
});

const originalMLControl = (fabric as any).ImageContainer.prototype.controls.ml;
(fabric as any).ImageContainer.prototype.controls.ml = new fabric.Control({
	...originalMLControl,
	actionHandler(_eventData, transformData, x, y) {
		// Only increase width of object, not scaleX
		const { target } = transformData;
		if (!target) {
			return false;
		}

		const { width } = target;
		if (!width) {
			return false;
		}

		// @ts-ignore
		fabric.controlsUtils.wrapWithFixedAnchor(fabric.controlsUtils.changeWidth)(_eventData, transformData, x, y);
		const objectFit = (target as fabric.ImageContainer).properties.objectFit;
		(target as fabric.ImageContainer).setObjectFit(objectFit);
		if (objectFit !== 'crop') {
			const objectPosition = (target as fabric.ImageContainer).properties.objectPosition;
			(target as fabric.ImageContainer).setObjectPosition(objectPosition);
		}

		(target as fabric.ImageContainer).getBackgroundObject().set({
			width: target.width,
			left: -target.width! / 2,
		});
		target.clipPath?.set({
			width: target.width,
			left: -target.width! / 2,
		});

		target.setCoords();
		return true;
	},
});

const originalMTControl = (fabric as any).ImageContainer.prototype.controls.mt;
(fabric as any).ImageContainer.prototype.controls.mt = new fabric.Control({
	...originalMTControl,
	actionHandler(_eventData, transformData, x, y) {
		const { target } = transformData;

		if (!target) {
			return false;
		}

		const { height } = target;
		if (!height) {
			return false;
		}

		// @ts-ignore
		fabric.controlsUtils.wrapWithFixedAnchor(changeHeight)(_eventData, transformData, x, y);
		const objectFit = (target as fabric.ImageContainer).properties.objectFit;
		(target as fabric.ImageContainer).setObjectFit(objectFit);

		if (objectFit !== 'crop') {
			const objectPosition = (target as fabric.ImageContainer).properties.objectPosition;
			(target as fabric.ImageContainer).setObjectPosition(objectPosition);
		}

		(target as fabric.ImageContainer).getBackgroundObject().set({
			height: target.height,
			top: -target.height! / 2,
		});

		target.clipPath?.set({
			height: target.height,
			top: -target.height! / 2,
		});

		target.setCoords();
		return true;
	},
});
