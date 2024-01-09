import { fabric } from 'fabric';
const originalDrawControls = fabric.Object.prototype.drawControls;

fabric.Object.prototype.drawControls = function (ctx: CanvasRenderingContext2D) {
	const themeColor = '#0499FF';
	// Set custom styles for controls
	this.transparentCorners = false;
	this.borderColor = themeColor;
	this.cornerColor = '#fff';
	this.cornerStrokeColor = themeColor;
	this.cornerSize = 8;

	// Call the original drawControls method to draw the controls
	originalDrawControls.call(this, ctx);

	// Return this for chaining
	return this;
};
