import { fabric } from 'fabric';

/**
 * Object container
 * - background rect
 * - clip path to bound view
 * - get background
 * - get element - strongly element
 * - from object
 * - to object
 *
 * // addtional - containerProps
 * - padding
 * - border
 * - borderRadius
 * - backgroundFill
 * - objectPosition (set)
 */

export interface ObjectContainerOptions extends fabric.IGroupOptions {}

export const ObjectContainer = fabric.util.createClass(fabric.Group, {
	type: 'container',
	initialize(options: ObjectContainerOptions) {
		const backgroundRect = new fabric.Rect({
			fill: options.fill || 'transparent',
			width: options.width,
			height: options.height,
		});
		this.callSuper('initialize', [backgroundRect], options);
		this.clipPath = new fabric.Rect({
			left: -this.width / 2,
			top: -this.height / 2,
			width: this.width,
			height: this.height,
		});
	},
	getBackgrounElement(): fabric.Rect {
		return this.getObjects()[0] as fabric.Rect;
	},
	getElement(): fabric.Object {
		return this.getObjects()[1];
	},
	toObject(propertiesToInclude: string[] = []) {
		return this.callSuper('toObject', propertiesToInclude);
	},
});

ObjectContainer.fromObject = (options: fabric.IGroupOptions, callback: (obj: fabric.ObjectContainer) => any) => {
	const object = new ObjectContainer(options);
	callback(object);
};

(fabric as any).ObjectContainer = ObjectContainer;
(fabric as any).ObjectContainer.fromObject = ObjectContainer.fromObject;

fabric.Object._fromObject('ObjectContainer', ObjectContainer.fromObject);
