import { fabric } from 'fabric';
import { IGradientOptions, IPatternOptions } from 'fabric/fabric-impl';

/**
 * Object container
 * - background rect ✅
 * - clip path to bound view ✅
 * - get background ✅
 * - get element - strongly element ✅
 * - from object ✅
 * - to object ✅
 *
 * // addtional - containerProps
 * - padding - { top, right, bottom, left }
 * - border - { width, color, style: 'dashed' | 'solid' }
 * - backgroundFill ✅ - Rect fill
 * - objectPosition (set) ✅ - top-left, top-center, top-right, center-left, center, center-right, bottom-left, bottom-center, bottom-right
 */
export type FillOptions = IGradientOptions | IPatternOptions | string;
export type ObjectPosition =
	| 'top-left'
	| 'top-center'
	| 'top-right'
	| 'center-left'
	| 'center'
	| 'center-right'
	| 'bottom-left'
	| 'bottom-center'
	| 'bottom-right';

export interface ObjectContainerOptions extends fabric.IGroupOptions {
	containerProperties: {
		objectPosition: ObjectPosition;
	};
}

export const ObjectContainer = fabric.util.createClass(fabric.Group, {
	type: 'container',
	initialize(options: ObjectContainerOptions) {
		const backgroundRect = new fabric.Rect({
			fill: 'transparent',
			width: options.width,
			height: options.height,
		});
		const { fill, ...rest } = options;
		this.callSuper('initialize', [backgroundRect], rest);
		this.clipPath = new fabric.Rect({
			left: -this.width / 2,
			top: -this.height / 2,
			width: this.width,
			height: this.height,
		});

		const objectPosition = this._calculateObjectPosition();
		if (objectPosition) {
			this._setContainerProperty('objectPosition', objectPosition);
		}
		if (fill) {
			this._fillBackground(fill);
		}
	},

	getBackgroundObject(): fabric.Rect {
		return this.getObjects()[0] as fabric.Rect;
	},

	getObject(): fabric.Object {
		return this.getObjects()[1];
	},

	_setContainerProperty(property: keyof ObjectContainerOptions['containerProperties'], value: any) {
		this.set({ containerProperties: { ...this.containerProperties, [property]: value } });
	},

	_fillBackground(fill: IGradientOptions | IPatternOptions | string) {
		if (typeof fill === 'undefined') {
			return;
		}

		if (typeof fill === 'string') {
			this.getBackgroundObject().set({ fill });
			this.setCoords();
			return;
		}

		if (typeof fill === 'object') {
			if ((fill as IGradientOptions).type === 'linear' || (fill as IGradientOptions).type === 'radial') {
				const gradient = new fabric.Gradient(fill);
				this.getBackgroundObject().set({ fill: gradient });
				this.setCoords();
				return;
			} else if ((fill as IPatternOptions).source) {
				const pattern = new fabric.Pattern(fill as IPatternOptions);
				this.getBackgroundObject().set({ fill: pattern });
				this.setCoords();
				return;
			}
		}
	},

	_calculateObjectPosition(): ObjectPosition {
		const object = this.getObject();
		if (!object) {
			return 'center';
		}

		if (object.originX === 'left' && object.originY === 'top') {
			return 'top-left';
		} else if (object.originX === 'center' && object.originY === 'top') {
			return 'top-center';
		} else if (object.originX === 'right' && object.originY === 'top') {
			return 'top-right';
		} else if (object.originX === 'left' && object.originY === 'center') {
			return 'center-left';
		} else if (object.originX === 'center' && object.originY === 'center') {
			return 'center';
		} else if (object.originX === 'right' && object.originY === 'center') {
			return 'center-right';
		} else if (object.originX === 'left' && object.originY === 'bottom') {
			return 'bottom-left';
		} else if (object.originX === 'center' && object.originY === 'bottom') {
			return 'bottom-center';
		} else if (object.originX === 'right' && object.originY === 'bottom') {
			return 'bottom-right';
		} else {
			throw new Error('Invalid position');
		}
	},

	_setObjectPositionToTopLeft() {
		const object = this.getObject();
		object.set({
			originX: 'left',
			originY: 'top',
			left: -this.width / 2,
			top: -this.height / 2,
		});
		this.setCoords();
		this._setContainerProperty('objectPosition', 'top-left');
	},

	_setObjectPositionToTopCenter() {
		const object = this.getObject();
		object.set({
			left: 0,
			top: -this.height! / 2,
			originX: 'center',
			originY: 'top',
		});
		this.setCoords();
		this._setContainerProperty('objectPosition', 'top-center');
	},

	_setObjectPositionToTopRight() {
		const object = this.getObject();
		object.set({
			left: this.width! / 2,
			top: -this.height! / 2,
			originX: 'right',
			originY: 'top',
		});
		this.setCoords();
		this._setContainerProperty('objectPosition', 'top-right');
	},

	_setObjectPositionToCenterLeft() {
		const object = this.getObject();
		object.set({
			left: -this.width! / 2,
			top: 0,
			originX: 'left',
			originY: 'center',
		});
		this.setCoords();
		this._setContainerProperty('objectPosition', 'center-left');
	},

	_setObjectPositionToCenter() {
		const object = this.getObject();
		object.set({
			left: 0,
			top: 0,
			originX: 'center',
			originY: 'center',
		});
		this.setCoords();
		this._setContainerProperty('objectPosition', 'center');
	},

	_setObjectPositionToCenterRight() {
		const object = this.getObject();
		object.set({
			left: this.width! / 2,
			top: 0,
			originX: 'right',
			originY: 'center',
		});
		this.setCoords();
		this._setContainerProperty('objectPosition', 'center-right');
	},

	_setObjectPositionToBottomLeft() {
		const object = this.getObject();
		object.set({
			left: -this.width! / 2,
			top: this.height! / 2,
			originX: 'left',
			originY: 'bottom',
		});
		this.setCoords();
		this._setContainerProperty('objectPosition', 'bottom-left');
	},

	_setObjectPositionToBottomCenter() {
		const object = this.getObject();
		object.set({
			left: 0,
			top: this.height! / 2,
			originX: 'center',
			originY: 'bottom',
		});
		this.setCoords();
		this._setContainerProperty('objectPosition', 'bottom-center');
	},

	_setObjectPositionToBottomRight() {
		const object = this.getObject();
		object.set({
			left: this.width! / 2,
			top: this.height! / 2,
			originX: 'right',
			originY: 'bottom',
		});
		this.setCoords();
		this._setContainerProperty('objectPosition', 'bottom-right');
	},

	setObjectPosition(position: ObjectPosition) {
		if (position === 'top-left') {
			this._setObjectPositionToTopLeft();
		} else if (position === 'top-center') {
			this._setObjectPositionToTopCenter();
		} else if (position === 'top-right') {
			this._setObjectPositionToTopRight();
		} else if (position === 'center-left') {
			this._setObjectPositionToCenterLeft();
		} else if (position === 'center') {
			this._setObjectPositionToCenter();
		} else if (position === 'center-right') {
			this._setObjectPositionToCenterRight();
		} else if (position === 'bottom-left') {
			this._setObjectPositionToBottomLeft();
		} else if (position === 'bottom-center') {
			this._setObjectPositionToBottomCenter();
		} else if (position === 'bottom-right') {
			this._setObjectPositionToBottomRight();
		} else {
			throw new Error('Invalid position');
		}
	},

	toObject(propertiesToInclude: string[] = []) {
		return fabric.util.object.extend(this.callSuper('toObject', propertiesToInclude), {
			containerProperties: this.containerProperties,
		});
	},
});

ObjectContainer.fromObject = (options: ObjectContainerOptions, callback: (obj: fabric.ObjectContainer) => void) => {
	console.log('Loading ObjectContainer from object', options);
	const object = new ObjectContainer(options) as fabric.ObjectContainer;
	callback(object);
};

(fabric as any).ObjectContainer = ObjectContainer;
(fabric as any).ObjectContainer.fromObject = ObjectContainer.fromObject;

fabric.Object._fromObject('ObjectContainer', ObjectContainer.fromObject);
