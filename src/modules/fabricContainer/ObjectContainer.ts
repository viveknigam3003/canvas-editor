import { fabric } from 'fabric';
import { IGradientOptions, IPatternOptions } from 'fabric/fabric-impl';
import { ObjectPosition, Properties } from './types';
import { RoundedRect } from './RoundedRectangle';

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
 * - radius - { top, right, bottom, left }
 *
 * - border - ✅ { width, color, style: 'solid' | 'dashed ⚠️', position: 'center' | 'inside ⚠️' | 'outside ⚠️', dashWidth ⚠️, dashGap ⚠️, dashCap ⚠️ }
 *   - TODO: Implement border position
 *   - TODO: Implement dashed border
 * - fill - ✅ - string | IGradientOptions | IPatternOptions
 * - objectFit - 'fill' | 'fit' | 'custom' ✅
 * - objectPosition (set) ✅ - top-left, top-center, top-right, center-left, center, center-right, bottom-left, bottom-center, bottom-right
 */

export interface ObjectContainerOptions extends Omit<fabric.IGroupOptions, 'fill'> {
	properties: Properties;
	objects: fabric.Object[];
}

const defaultProperties: Properties = {
	objectPosition: 'center',
	border: {
		color: 'transparent',
		style: 'solid',
		top: 0,
		right: 0,
		bottom: 0,
		left: 0,
		position: 'center',
		dashWidth: 5,
		dashGap: 2,
		dashCap: 'butt',
	},
	fill: 'transparent',
	padding: {
		top: 0,
		right: 0,
		bottom: 0,
		left: 0,
	},
	radius: {
		tl: 0,
		tr: 0,
		bl: 0,
		br: 0,
	},
	objectFit: 'fit',
};

export const ObjectContainer = fabric.util.createClass(fabric.Group, {
	type: 'object-container',
	initialize(options: ObjectContainerOptions) {
		const backgroundRect = new RoundedRect({
			fill: 'transparent',
			width: options.width,
			height: options.height,
			cornerRadius: {
				tl: options.properties?.radius?.tl || 0,
				tr: options.properties?.radius?.tr || 0,
				bl: options.properties?.radius?.bl || 0,
				br: options.properties?.radius?.br || 0,
			},
		}) as fabric.RoundedRect;

		this.callSuper('initialize', [backgroundRect], options);

		this.clipPath = new RoundedRect({
			left: -this.width / 2,
			top: -this.height / 2,
			width: this.width,
			height: this.height,
			cornerRadius: {
				tl: options.properties?.radius?.tl || 0,
				tr: options.properties?.radius?.tr || 0,
				bl: options.properties?.radius?.bl || 0,
				br: options.properties?.radius?.br || 0,
			},
		}) as fabric.RoundedRect;
		this.setProperties(options.properties || defaultProperties);
	},

	setProperties(properties: ObjectContainerOptions['properties']) {
		// Check whatever properties are set or not

		const props = Object.assign({}, defaultProperties, properties);

		if (props.fill) {
			this._fillBackground(props.fill);
		}

		if (props.objectPosition && this.getObject()) {
			this.setObjectPosition(props.objectPosition);
		}

		if (props.objectFit && this.getObject()) {
			this.setObjectFit(props.objectFit);
		}

		if (props.padding) {
			this.setPadding(props.padding);
		}

		if (props.radius) {
			this.setRadius(props.radius);
		}

		if (props.border) {
			this.setBorder(props.border);
		}

		this.properties = props;
		this.setCoords();
	},

	getBackgroundObject(): fabric.Rect {
		const background = this.getObjects()[0] as fabric.Rect;
		if (!background) {
			null;
		}
		return this.getObjects()[0] as fabric.Rect;
	},

	getObject(): fabric.Object {
		const object = this.getObjects()[1];
		if (!object) {
			null;
		}
		return this.getObjects()[1];
	},

	_setContainerProperty(property: keyof ObjectContainerOptions['properties'], value: any) {
		this.set({ properties: { ...this.properties, [property]: value } });
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
			top: -this.height / 2,
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

	setBorder(border: Properties['border']) {
		if (border) {
			this.set({
				properties: {
					...this.properties,
					border,
				},
			});
		}
	},

	setPadding(padding: Properties['padding']) {
		const calculatedPadding = Object.assign({}, defaultProperties.padding, padding);
		this.set({
			properties: {
				...this.properties,
				padding: calculatedPadding,
			},
		});
	},

	setRadius(radius: Properties['radius']) {
		const calculatedRadius = Object.assign({}, defaultProperties.radius, radius);
		this.set({
			properties: {
				...this.properties,
				radius: calculatedRadius,
			},
		});
	},

	_drawBorderSide(ctx: CanvasRenderingContext2D, side: 'top' | 'right' | 'bottom' | 'left') {
		if (!this.properties.border) {
			return;
		}

		const borderWidth = this.properties.border[side];
		if (borderWidth <= 0) {
			return; // Skip if border width is zero or negative
		}

		ctx.strokeStyle = this.properties.border.color;
		ctx.lineWidth = borderWidth;

		const scaledWidth = this.width * this.scaleX;
		const scaledHeight = this.height * this.scaleY;

		// Draw the border
		let startX, startY, endX, endY;
		switch (side) {
			case 'top':
				startX = this.left;
				startY = this.top;
				endX = this.left + scaledWidth;
				endY = this.top;
				break;
			case 'right':
				startX = this.left + scaledWidth;
				startY = this.top;
				endX = this.left + scaledWidth;
				endY = this.top + scaledHeight;
				break;
			case 'bottom':
				startX = this.left;
				startY = this.top + scaledHeight;
				endX = this.left + scaledWidth;
				endY = this.top + scaledHeight;
				break;
			case 'left':
				startX = this.left;
				startY = this.top;
				endX = this.left;
				endY = this.top + scaledHeight;
				break;
		}

		// These adjustments are just considering that border is placed in 'center'.
		// TODO: Handle cases for 'inside' and 'outside' border separately
		if (side === 'top') {
			if (this.properties.border.right > 0) {
				endX += this.properties.border.right / 2;
			}
			if (this.properties.border.left > 0) {
				startX -= this.properties.border.left / 2;
			}
		}

		if (side === 'right') {
			if (this.properties.border.top > 0) {
				startY -= this.properties.border.top / 2;
			}
			if (this.properties.border.bottom > 0) {
				endY += this.properties.border.bottom / 2;
			}
		}

		if (side === 'bottom') {
			if (this.properties.border.right > 0) {
				endX += this.properties.border.right / 2;
			}
			if (this.properties.border.left > 0) {
				startX -= this.properties.border.left / 2;
			}
		}

		if (side === 'left') {
			if (this.properties.border.top > 0) {
				startY -= this.properties.border.top / 2;
			}
			if (this.properties.border.bottom > 0) {
				endY += this.properties.border.bottom / 2;
			}
		}

		ctx.beginPath();
		ctx.moveTo(startX, startY);
		ctx.lineTo(endX, endY);
		ctx.stroke();
	},

	toObject(propertiesToInclude: string[] = []) {
		return fabric.util.object.extend(this.callSuper('toObject', propertiesToInclude), {
			properties: this.properties,
		});
	},

	render(ctx: CanvasRenderingContext2D) {
		this.callSuper('render', ctx);

		// Save the current context
		ctx.save();

		// Draw each border considering its style
		if (this.properties.border.top) {
			this._drawBorderSide(ctx, 'top');
		}
		if (this.properties.border.right) {
			this._drawBorderSide(ctx, 'right');
		}
		if (this.properties.border.bottom) {
			this._drawBorderSide(ctx, 'bottom');
		}
		if (this.properties.border.left) {
			this._drawBorderSide(ctx, 'left');
		}

		// Restore the context to its original state
		ctx.restore();
	},
});

ObjectContainer.fromObject = (object: ObjectContainerOptions, callback: (obj: fabric.ObjectContainer) => void) => {
	const objectContainer = new ObjectContainer(object) as fabric.ObjectContainer;
	objectContainer.setProperties(object.properties);
	callback(objectContainer);
};

(fabric as any).ObjectContainer = ObjectContainer;
(fabric as any).ObjectContainer.fromObject = ObjectContainer.fromObject;

fabric.Object._fromObject('ObjectContainer', ObjectContainer.fromObject);
