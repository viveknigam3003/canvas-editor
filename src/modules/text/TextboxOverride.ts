import { fabric } from 'fabric';
import { Gradient, ITextboxOptions } from 'fabric/fabric-impl';

export interface BoxProperties extends ITextboxOptions {
	boxBorderColor?: string;
	boxBorderStyle?: string;
	boxBorderWidth?: number;
	boxBackgroundFill?: string | Gradient;
	textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
}

declare module 'fabric' {
	namespace fabric {
		interface Textbox extends BoxProperties {
			boxBorderColor?: string;
			boxBorderStyle?: string;
			boxBorderWidth?: number;
			boxBackgroundFill: string | Gradient;
			textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
		}
	}
}

// Add custom properties to the Textbox class
fabric.Textbox.prototype.boxBorderColor = 'transparent';
fabric.Textbox.prototype.boxBorderStyle = 'solid';
fabric.Textbox.prototype.boxBorderWidth = 0;
fabric.Textbox.prototype.boxBackgroundFill = 'transparent';
fabric.Textbox.prototype.textTransform = 'none';

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
		// const boxBorderColor = this.boxBorderColor || '';
		// const boxBorderWidth = this.boxBorderWidth || 0;
		// const boxBorderStyle = this.boxBorderStyle || 'solid';
		// const scale = this.scaleX || 1;

		// if (boxBorderWidth > 0 && boxBorderColor) {
		// 	// Save the current context state
		// 	ctx.save();

		// 	// Set border style
		// 	ctx.strokeStyle = boxBorderColor;
		// 	ctx.lineWidth = boxBorderWidth;
		// 	if (boxBorderStyle === 'dashed') {
		// 		ctx.setLineDash([boxBorderWidth + 5, 5]);
		// 	} else if (boxBorderStyle === 'dotted') {
		// 		ctx.setLineDash([1, 3]);
		// 	} else {
		// 		ctx.setLineDash([]); // solid
		// 	}

		// 	// Adjust the position based on the border width
		// 	const halfBorderWidth = boxBorderWidth / 2;
		// 	const x = -this.width! / 2 - halfBorderWidth;
		// 	const y = -this.height! / 2 - halfBorderWidth;
		// 	const width = this.width! + boxBorderWidth;
		// 	const height = this.height! + boxBorderWidth;

		// 	// Draw the border
		// 	ctx.strokeRect(x, y, width, height);

		// 	// Restore the context to its previous state
		// 	ctx.restore();
		// }

		if (this.textTransform !== 'none') {
			if (this.text !== undefined && this.textTransform !== undefined) {
				this.text = getTransformedText(this.text, this.textTransform);
			}
		}

		// Call the original _render method
		_render.call(this, ctx);
	};
})(fabric.Textbox.prototype._render);
