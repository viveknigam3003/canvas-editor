import { fabric } from 'fabric';
import { IGradientOptions, IPatternOptions } from 'fabric/fabric-impl';
import { RoundedRect } from './RoundedRectangle';
import { ObjectPosition, Properties } from './types';

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
 * - radius - { top, right, bottom, left } ✅
 *
 * - border - ✅ { width, color, style: 'solid' | 'dashed ⚠️', position: 'center' | 'inside ⚠️' | 'outside ⚠️', dashWidth ⚠️, dashGap ⚠️, dashCap ⚠️ }
 *   - TODO Later: Implement border position
 *   - TODO Later: Implement dashed border
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
};

export const ObjectContainer = fabric.util.createClass(fabric.Group, {
	type: 'object-container',
	initialize(options: ObjectContainerOptions) {
		const backgroundRect = new RoundedRect({
			fill: 'transparent',
			width: options.width,
			height: options.height,
			originX: 'center',
			originY: 'center',
			cornerRadius: {
				tl: options.properties?.radius?.tl || 0,
				tr: options.properties?.radius?.tr || 0,
				bl: options.properties?.radius?.bl || 0,
				br: options.properties?.radius?.br || 0,
			},
			selectable: false,
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

	getBackgroundObject(): fabric.RoundedRect {
		const background = this.getObjects()[0] as fabric.RoundedRect;
		if (!background) {
			null;
		}
		return this.getObjects()[0] as fabric.RoundedRect;
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
		const background = (this as fabric.ObjectContainer).getBackgroundObject();
		background.set({ cornerRadius: calculatedRadius });
		this.clipPath.set({ cornerRadius: calculatedRadius });
	},

	_drawBorder(ctx: CanvasRenderingContext2D, side: 'top' | 'right' | 'bottom' | 'left') {
		if (!this.properties.border) {
			return;
		}

		const borderWidth = this.properties.border;

		ctx.strokeStyle = this.properties.border.color;
		ctx.lineWidth = this.properties.border[side];

		const scaledWidth = this.width * this.scaleX;
		const scaledHeight = this.height * this.scaleY;
		const scaledCornerRadius = {
			tl: this.properties.radius.tl * this.scaleX,
			tr: this.properties.radius.tr * this.scaleX,
			br: this.properties.radius.br * this.scaleX,
			bl: this.properties.radius.bl * this.scaleX,
		};

		// Also adding a corner radius to the border
		const cornerRadius = Object.assign({}, defaultProperties.radius, scaledCornerRadius);

		const K = 1 - 0.5522847498; // Bezier approximation

		// const [originX, originY] = getObjectOrigin(this);
		const rotateAroundObjectOrigin = (x: number, y: number): [number, number] => [x, y];

		const rotateBezierPointsAroundOrigin = (
			cp1x: number,
			cp1y: number,
			cp2x: number,
			cp2y: number,
			endX: number,
			endY: number,
		): [number, number, number, number, number, number] => {
			const [cp1xRotated, cp1yRotated] = rotateAroundObjectOrigin(cp1x, cp1y);
			const [cp2xRotated, cp2yRotated] = rotateAroundObjectOrigin(cp2x, cp2y);
			const [endXRotated, endYRotated] = rotateAroundObjectOrigin(endX, endY);
			return [cp1xRotated, cp1yRotated, cp2xRotated, cp2yRotated, endXRotated, endYRotated];
		};

		// Draw a continuous border if borderWidth is set, with bezier curves at corners if radius is set
		ctx.beginPath();
		if (side === 'top') {
			// Top border
			if (borderWidth.top > 0) {
				ctx.lineWidth = borderWidth.top;
				// Case 1: Top Left border is rounded
				if (cornerRadius.tl > 0) {
					// Leave the corner
					ctx.moveTo(...rotateAroundObjectOrigin(this.left + cornerRadius.tl, this.top));
				} else {
					// Is left border present?
					if (borderWidth.left > 0) {
						ctx.moveTo(...rotateAroundObjectOrigin(this.left - borderWidth.left / 2, this.top));
					} else {
						ctx.moveTo(...rotateAroundObjectOrigin(this.left, this.top));
					}
				}

				// Case 2: Top right border is rounded
				if (cornerRadius.tr > 0) {
					ctx.lineTo(...rotateAroundObjectOrigin(this.left + scaledWidth - cornerRadius.tr, this.top));
					// Draw the curve corner
					ctx.bezierCurveTo(
						...rotateBezierPointsAroundOrigin(
							this.left + scaledWidth - K * cornerRadius.tr,
							this.top,
							this.left + scaledWidth,
							this.top + K * cornerRadius.tr,
							this.left + scaledWidth,
							this.top + cornerRadius.tr,
						),
					);
				} else {
					// Is right border present?
					if (borderWidth.right > 0) {
						ctx.lineTo(
							...rotateAroundObjectOrigin(this.left + scaledWidth + borderWidth.right / 2, this.top),
						);
					} else {
						ctx.lineTo(...rotateAroundObjectOrigin(this.left + scaledWidth, this.top));
					}
				}
			} else {
				// If top border is not set, then move to the start of the right border
				ctx.moveTo(...rotateAroundObjectOrigin(this.left + scaledWidth, this.top));
			}
		}

		// Right border
		if (side === 'right') {
			if (borderWidth.right > 0) {
				ctx.lineWidth = borderWidth.right;
				// Case 1: Top right border is rounded
				if (cornerRadius.tr > 0) {
					ctx.moveTo(...rotateAroundObjectOrigin(this.left + scaledWidth, this.top + cornerRadius.tr));
				} else {
					// Is top border present?
					if (borderWidth.top > 0) {
						ctx.moveTo(
							...rotateAroundObjectOrigin(this.left + scaledWidth, this.top - borderWidth.top / 2),
						);
					} else {
						ctx.moveTo(...rotateAroundObjectOrigin(this.left + scaledWidth, this.top));
					}
				}

				// Case 2: Bottom right border is rounded
				if (cornerRadius.br > 0) {
					ctx.lineTo(
						...rotateAroundObjectOrigin(this.left + scaledWidth, this.top + scaledHeight - cornerRadius.br),
					);
					// Draw the curve corner
					ctx.bezierCurveTo(
						...rotateBezierPointsAroundOrigin(
							this.left + scaledWidth,
							this.top + scaledHeight - K * cornerRadius.br,
							this.left + scaledWidth - K * cornerRadius.br,
							this.top + scaledHeight,
							this.left + scaledWidth - cornerRadius.br,
							this.top + scaledHeight,
						),
					);
				} else {
					// Is bottom border present?
					if (borderWidth.bottom > 0) {
						ctx.lineTo(
							...rotateAroundObjectOrigin(
								this.left + scaledWidth,
								this.top + scaledHeight + borderWidth.bottom / 2,
							),
						);
					} else {
						ctx.lineTo(...rotateAroundObjectOrigin(this.left + scaledWidth, this.top + scaledHeight));
					}
				}
			} else {
				// If right border is not set, then move to the start of the bottom border
				ctx.moveTo(...rotateAroundObjectOrigin(this.left + scaledWidth, this.top + scaledHeight));
			}
		}

		if (side === 'bottom') {
			// Bottom border
			if (borderWidth.bottom > 0) {
				// Case 1: Bottom right border is rounded
				if (cornerRadius.br > 0) {
					ctx.moveTo(
						...rotateAroundObjectOrigin(this.left + scaledWidth - cornerRadius.br, this.top + scaledHeight),
					);
				} else {
					// Is right border present?
					if (borderWidth.right > 0) {
						ctx.moveTo(
							...rotateAroundObjectOrigin(
								this.left + scaledWidth + borderWidth.right / 2,
								this.top + scaledHeight,
							),
						);
					} else {
						ctx.moveTo(...rotateAroundObjectOrigin(this.left + scaledWidth, this.top + scaledHeight));
					}
				}

				// Case 2: Bottom left border is rounded
				if (cornerRadius.bl > 0) {
					ctx.lineTo(...rotateAroundObjectOrigin(this.left + cornerRadius.bl, this.top + scaledHeight));
					// Draw the curve corner
					ctx.bezierCurveTo(
						...rotateBezierPointsAroundOrigin(
							this.left + K * cornerRadius.bl,
							this.top + scaledHeight,
							this.left,
							this.top + scaledHeight - K * cornerRadius.bl,
							this.left,
							this.top + scaledHeight - cornerRadius.bl,
						),
					);
				} else {
					// Is left border present?
					if (borderWidth.left > 0) {
						ctx.lineTo(
							...rotateAroundObjectOrigin(this.left - borderWidth.left / 2, this.top + scaledHeight),
						);
					} else {
						ctx.lineTo(...rotateAroundObjectOrigin(this.left, this.top + scaledHeight));
					}
				}
			} else {
				// If bottom border is not set, then move to the start of the left border
				ctx.moveTo(...rotateAroundObjectOrigin(this.left, this.top + scaledHeight));
			}
		}

		if (side === 'left') {
			// Left border
			if (borderWidth.left > 0) {
				ctx.lineWidth = borderWidth.left;
				// Case 1: Bottom left border is rounded
				if (cornerRadius.bl > 0) {
					ctx.moveTo(...rotateAroundObjectOrigin(this.left, this.top + scaledHeight - cornerRadius.bl));
				} else {
					// Is bottom border present?
					if (borderWidth.bottom > 0) {
						ctx.moveTo(
							...rotateAroundObjectOrigin(this.left, this.top + scaledHeight + borderWidth.bottom / 2),
						);
					} else {
						ctx.moveTo(...rotateAroundObjectOrigin(this.left, this.top + scaledHeight));
					}
				}

				// Case 2: Top left border is rounded
				if (cornerRadius.tl > 0) {
					ctx.lineTo(...rotateAroundObjectOrigin(this.left, this.top + cornerRadius.tl));
					// Draw the curve corner
					ctx.bezierCurveTo(
						...rotateBezierPointsAroundOrigin(
							this.left,
							this.top + K * cornerRadius.tl,
							this.left + K * cornerRadius.tl,
							this.top,
							this.left + cornerRadius.tl,
							this.top,
						),
					);
				} else {
					// Is top border present?
					if (borderWidth.top > 0) {
						ctx.lineTo(...rotateAroundObjectOrigin(this.left, this.top - borderWidth.top / 2));
					} else {
						ctx.lineTo(...rotateAroundObjectOrigin(this.left, this.top));
					}
				}
			} else {
				// If left border is not set, then move to the start of the top border
				ctx.moveTo(...rotateAroundObjectOrigin(this.left, this.top));
			}
		}
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

		// Hiding border due to buggy rendering on multiple active objects
		const isPartOfSelection =
			this.canvas.getActiveObjects().findIndex((obj: fabric.Object) => obj.data.id === this.data.id) !== -1 &&
			this.canvas.getActiveObjects().length > 1;
		if (!isPartOfSelection) {
			this._drawBorder(ctx, 'top');
			this._drawBorder(ctx, 'right');
			this._drawBorder(ctx, 'bottom');
			this._drawBorder(ctx, 'left');
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
