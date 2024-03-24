import { fabric } from 'fabric';
import { Radius } from './types';

interface RoundedRectOptions extends fabric.IRectOptions {
	cornerRadius: Radius;
}

export const RoundedRect = fabric.util.createClass(fabric.Rect, {
	type: 'rounded-rect',

	initialize: function (options: RoundedRectOptions) {
		this.callSuper('initialize', options);
		this.strokeWidth = 0;
		this.cornerRadius = Object.assign({ tl: 0, tr: 0, br: 0, bl: 0 }, options.cornerRadius);
		this.cacheProperties = this.cacheProperties.concat('cornerRadius');
	},

	_drawRoundedRectPath(ctx: CanvasRenderingContext2D) {
		const w = this.width,
			h = this.height,
			x = -this.width / 2,
			y = -this.height / 2,
			k = 1 - 0.5522847498; // Bezier approximation

		ctx.beginPath();

		// top left corner
		ctx.moveTo(x + this.cornerRadius.tl, y);
		// to top right
		ctx.lineTo(x + w - this.cornerRadius.tr, y);
		ctx.bezierCurveTo(
			x + w - k * this.cornerRadius.tr,
			y,
			x + w,
			y + k * this.cornerRadius.tr,
			x + w,
			y + this.cornerRadius.tr,
		);
		// to bottom right
		ctx.lineTo(x + w, y + h - this.cornerRadius.br);
		ctx.bezierCurveTo(
			x + w,
			y + h - k * this.cornerRadius.br,
			x + w - k * this.cornerRadius.br,
			y + h,
			x + w - this.cornerRadius.br,
			y + h,
		);
		// to bottom left
		ctx.lineTo(x + this.cornerRadius.bl, y + h);
		ctx.bezierCurveTo(
			x + k * this.cornerRadius.bl,
			y + h,
			x,
			y + h - k * this.cornerRadius.bl,
			x,
			y + h - this.cornerRadius.bl,
		);
		// closing the path back to top left
		ctx.lineTo(x, y + this.cornerRadius.tl);
		ctx.bezierCurveTo(
			x,
			y + k * this.cornerRadius.tl,
			x + k * this.cornerRadius.tl,
			y,
			x + this.cornerRadius.tl,
			y,
		);

		ctx.closePath();

		this._renderFill(ctx);
		this._renderStroke(ctx);
	},

	_render: function (ctx: CanvasRenderingContext2D) {
		ctx.save();
		this._drawRoundedRectPath(ctx);
		ctx.restore();
	},

	toObject(propertiesToInclude: string[] = []) {
		return fabric.util.object.extend(this.callSuper('toObject', propertiesToInclude), {
			cornerRadius: this.cornerRadius,
		});
	},
});

RoundedRect.fromObject = (object: RoundedRectOptions, callback: (rect: fabric.Rect) => void) => {
	callback(new RoundedRect(object));
};

(fabric as any).RoundedRect = RoundedRect;
(fabric as any).RoundedRect.fromObject = RoundedRect.fromObject;

fabric.Object._fromObject('RoundedRect', RoundedRect.fromObject);
