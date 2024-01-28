import { fabric } from 'fabric';
import { Gradient, ITextboxOptions } from 'fabric/fabric-impl';

export interface BoxProperties extends ITextboxOptions {
	boxBorderColor?: string;
	boxBorderStyle?: string;
	boxBorderWidth?: number;
	boxBackgroundFill?: string | Gradient;
}

declare module 'fabric' {
	namespace fabric {
		interface Textbox extends BoxProperties {
			boxBorderColor?: string;
			boxBorderStyle?: string;
			boxBorderWidth?: number;
			boxBackgroundFill: string | Gradient;
		}
	}
}

// Add custom properties to the Textbox class
fabric.Textbox.prototype.boxBorderColor = 'transparent';
fabric.Textbox.prototype.boxBorderStyle = 'solid';
fabric.Textbox.prototype.boxBorderWidth = 0;
fabric.Textbox.prototype.boxBackgroundFill = 'transparent';

/**
 * Override the toObject method to include our custom properties
 * boxBorderColor, boxBorderStyle, and boxBorderWidth
 */
fabric.Textbox.prototype.toObject = (function (toObject) {
	return function (this: fabric.Textbox, propertiesToInclude: string[] = []) {
		const extendedPropertiesToInclude = propertiesToInclude.concat([
			'boxBorderColor',
			'boxBorderStyle',
			'boxBorderWidth',
			'boxBackgroundFill',
		]);
		return toObject.apply(this, [extendedPropertiesToInclude]);
	};
})(fabric.Textbox.prototype.toObject);

/**
 * Override the _render method to draw the border
 */
fabric.Textbox.prototype._render = (function (_render) {
	return function (this: fabric.Textbox & BoxProperties, ctx: CanvasRenderingContext2D) {
		// Ensure custom properties are defined
		const boxBorderColor = this.boxBorderColor || '';
		const boxBorderWidth = this.boxBorderWidth || 0;
		const boxBorderStyle = this.boxBorderStyle || 'solid';
		// const boxBackgroundFill = this.boxBackgroundFill || '';

		if (boxBorderWidth > 0 && boxBorderColor) {
			// Save the current context state
			ctx.save();

			// Set border style
			ctx.strokeStyle = boxBorderColor;
			ctx.lineWidth = boxBorderWidth;
			if (boxBorderStyle === 'dashed') {
				ctx.setLineDash([5, 5]);
			} else if (boxBorderStyle === 'dotted') {
				ctx.setLineDash([1, 3]);
			} else {
				ctx.setLineDash([]); // solid
			}

			// Adjust the position based on the border width
			const halfBorderWidth = boxBorderWidth / 2;
			const x = -this.width! / 2 - halfBorderWidth;
			const y = -this.height! / 2 - halfBorderWidth;
			const width = this.width! + boxBorderWidth;
			const height = this.height! + boxBorderWidth;

			// Draw the border
			ctx.strokeRect(x, y, width, height);

			// Restore the context to its previous state
			ctx.restore();
		}

		// if (boxBackgroundFill instanceof fabric.Gradient) {
		// 	// Update the gradient to match the current size and position of the textbox
		// 	const scaleX = this.scaleX || 1;
		// 	const scaleY = this.scaleY || 1;
		// 	const width = this.width! * scaleX;
		// 	const height = this.height! * scaleY;

		// 	boxBackgroundFill.coords = {
		// 		x1: -width / 2,
		// 		y1: -height / 2,
		// 		x2: width / 2,
		// 		y2: -height / 2,
		// 	};

		// 	// Apply the gradient to the context
		// 	ctx.save();
		// 	ctx.translate(-this.width! / 2, -this.height! / 2);
		// 	ctx.fillStyle = boxBackgroundFill.toLive(ctx);
		// 	ctx.fillRect(0, 0, width, height);
		// 	ctx.restore();
		// }

		// Call the original _render method
		_render.call(this, ctx);
	};
})(fabric.Textbox.prototype._render);
