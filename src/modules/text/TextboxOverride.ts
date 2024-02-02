import { fabric } from 'fabric';
import { ITextboxOptions } from 'fabric/fabric-impl';

export interface BoxBorder {
	color: string;
	width: number;
	style: 'solid' | 'dashed' | 'custom';
	customProperties?: {
		dashArray?: number[];
		lineCap?: 'butt' | 'round' | 'square';
		lineJoin?: 'bevel' | 'round' | 'miter';
		miterLimit?: number;
	};
}

export interface BoxGradient {
	type: 'linear' | 'radial';
	colorStops: {
		offset: number;
		color: string;
	}[];
	angle?: number;
}

interface BoxProperties {
	fill?: string | BoxGradient;
	border?: BoxBorder | null;
	radius: number | number[] | { tl: number; tr: number; br: number; bl: number };
	padding?: number;
}

export interface SmartTextBox extends ITextboxOptions {
	box?: BoxProperties;
	textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
}

declare module 'fabric' {
	namespace fabric {
		interface Textbox extends SmartTextBox {
			box: BoxProperties;
			textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
		}
	}
}

// Add custom properties to the Textbox class
fabric.Textbox.prototype.box = {
	fill: 'transparent',
	border: null,
	radius: 0,
	padding: 0,
};
fabric.Textbox.prototype.textTransform = 'none';

/**
 * Override the toObject method to include our custom properties
 * boxBorderColor, boxBorderStyle, and boxBorderWidth
 */
fabric.Textbox.prototype.toObject = (function (toObject) {
	return function (this: fabric.Textbox, propertiesToInclude: string[] = []) {
		const extendedPropertiesToInclude = propertiesToInclude.concat(['box', 'textTransform']);
		return toObject.apply(this, [extendedPropertiesToInclude]);
	};
})(fabric.Textbox.prototype.toObject);

const getTransformedText = (text: string, textTransform: 'none' | 'uppercase' | 'lowercase' | 'capitalize') => {
	switch (textTransform) {
		case 'uppercase':
			return text.toUpperCase();
		case 'lowercase':
			return text.toLowerCase();
		case 'capitalize':
			return text.replace(/\b\w/g, l => l.toUpperCase());
		default:
			return text;
	}
};

/**
 * Override the _render method to draw the border
 */
fabric.Textbox.prototype._render = (function (_render) {
	return function (this: fabric.Textbox & BoxProperties, ctx: CanvasRenderingContext2D) {
		// Ensure custom properties are defined
		const box = this.box || {
			fill: 'transparent',
			border: null,
			padding: 0,
		};

		this.backgroundColor = 'transparent';
		const rect = new fabric.Rect({
			width: this.width,
			height: this.height,
			originX: 'center',
			originY: 'center',
			left: this.left,
			top: this.top,
			opacity: this.opacity,
			angle: this.angle,
			scaleX: this.scaleX,
			scaleY: this.scaleY,
		});

		if (box.fill) {
			if (typeof box.fill === 'string') {
				rect.set('fill', box.fill);
			}

			if (typeof box.fill === 'object') {
				const angle = box.fill.angle || 0;
				const x2 = Math.cos((angle * Math.PI) / 180) * this.width!;
				const y2 = Math.sin((angle * Math.PI) / 180) * this.height!;

				const gradient = new fabric.Gradient({
					type: box.fill.type,
					coords: {
						x1: 0,
						y1: 0,
						x2,
						y2,
					},
					colorStops: box.fill.colorStops,
				});
				rect.set('fill', gradient);
			}
		}

		if (box.border) {
			if (box.border.style === 'custom' && box.border.customProperties) {
				const { dashArray, lineCap, lineJoin, miterLimit } = box.border.customProperties;
				if (dashArray) {
					rect.set('strokeDashArray', dashArray);
				}
				if (lineCap) {
					rect.set('strokeLineCap', lineCap);
				}
				if (lineJoin) {
					rect.set('strokeLineJoin', lineJoin);
				}
				if (miterLimit) {
					rect.set('strokeMiterLimit', miterLimit);
				}
			} else if (box.border.style === 'dashed') {
				rect.set('strokeDashArray', [box.border.width + 5, 5]);
				rect.set('strokeLineCap', 'butt');
				rect.set('strokeLineJoin', 'miter');
			} else if (box.border.style === 'solid') {
				rect.set('strokeDashArray', []);
			}

			rect.set('stroke', box.border.color);
			rect.set('strokeWidth', box.border.width);
		}

		if (box.radius) {
			rect.set('rx', (box.radius as number) / this.scaleX!);
			rect.set('ry', (box.radius as number) / this.scaleY!);
		}

		rect.drawObject(ctx);

		if (this.textTransform !== 'none') {
			if (this.text !== undefined && this.textTransform !== undefined) {
				this.text = getTransformedText(this.text, this.textTransform);
			}
		}

		// Call the original _render method
		_render.call(this, ctx);
	};
})(fabric.Textbox.prototype._render);

const originalFromObject = fabric.Textbox.fromObject;

fabric.Textbox.fromObject = function (object: any, callback: (result: fabric.Textbox) => any) {
	// Handle custom properties here
	// Ensure custom properties are structured correctly
	const customProps = {
		...object,
		box: object.box || {
			fill: 'transparent',
			border: null,
			padding: 0,
		},
		textTransform: object.textTransform || 'none',
	};

	// Call the original fromObject method with the structured properties
	return originalFromObject.call(fabric.Textbox, customProps, (result: fabric.Textbox) => {
		// If there are any post-instantiation operations, perform them here
		// Then, pass the result to the callback
		callback(result);
	});
};
