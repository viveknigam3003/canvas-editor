import { fabric } from 'fabric';
import { ObjectContainer, ObjectContainerOptions } from './ObjectContainer';

export interface TextContainerOptions extends ObjectContainerOptions {
	text: string;
	objects: [fabric.Rect, fabric.Textbox];
}

/**
 * Text container extends ObjectContainer
 */
export const TextContainer = fabric.util.createClass(ObjectContainer, {
	type: 'text-container',
	initialize(options: TextContainerOptions) {
		this.callSuper('initialize', options);
		console.log('options', options);
		this.add(
			new fabric.Textbox(options?.text || '', {
				height: options.height,
				width: options.width,
				objectCaching: false,
				originX: 'center',
				originY: 'center',
				splitByGrapheme: true,
			}),
		);
	},
	getTextElement() {
		return this.getObjects().find((o: fabric.Object) => o.type === 'textbox') as fabric.Textbox;
	},
	setText(text: string) {
		this.getTextElement().set({ text });
	},
	setObjectPosition(position: string) {
		this.callSuper('setObjectPosition', position);
		switch (position) {
			case 'top-right':
			case 'center-right':
			case 'bottom-right':
				this.getTextElement().set({ textAlign: 'right' });
				break;
			case 'top-center':
			case 'center':
			case 'bottom-center':
				this.getTextElement().set({ textAlign: 'center' });
				break;
			case 'center-left':
			case 'top-left':
			case 'bottom-left':
			default:
				this.getTextElement().set({ textAlign: 'left' });
				break;
		}
	},
	toObject(propertiesToInclude: string[] = []) {
		return fabric.util.object.extend(this.callSuper('toObject', propertiesToInclude), {
			text: this.getTextElement().text,
			width: this.width,
			height: this.height,
		});
	},
});

TextContainer.fromObject = (object: TextContainerOptions, callback: (TextContainer: fabric.TextContainer) => void) => {
	const textbox = new TextContainer(object.text, {
		...object,
	}) as any;
	textbox.setProperties(object.properties);
	callback(textbox);
};

(fabric as any).TextContainer = TextContainer;
(fabric as any).TextContainer.fromObject = TextContainer.fromObject;

fabric.Object._fromObject('TextContainer', TextContainer.fromObject);

const changeWidth = fabric.controlsUtils.wrapWithFireEvent(
	'scaling',
	fabric.controlsUtils.wrapWithFixedAnchor(fabric.controlsUtils.changeWidth),
);
const updateWithSideEffect = (fn: any) => (eventData: any, transform: any, x: number, y: number) => {
	fn(eventData, transform, x, y);
	const { target } = transform;
	target.getTextElement().set({ width: target.width, dirty: true });
	target.getBackgroundObject().set({
		width: target.width,
		height: target.height,
		dirty: true,
		scaleX: target.scaleX,
		scaleY: target.scaleY,
	});
	target.getTextElement().setCoords();
	target.clipPath?.set({
		scaleX: target.scaleX,
		scaleY: target.scaleY,
		width: target.width,
		height: target.height,
		left: -target.width / 2,
		top: -target.height / 2,
		dirty: true,
	});
	target.setObjectPosition(target.properties.objectPosition);
	target.set('dirty', true);
	target.clipPath?.setCoords();
	target.setCoords();
	console.log(target, 'target');
	return true;
};

export const changeObjectHeight: any = (_eventData: any, transform: any, x: number, y: number) => {
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

const changeHeight = fabric.controlsUtils.wrapWithFireEvent(
	'scaling',
	fabric.controlsUtils.wrapWithFixedAnchor(changeObjectHeight),
);

const changeWidthWithWrap = updateWithSideEffect(changeWidth);
const changeHeightWithWrap = updateWithSideEffect(changeHeight);

const changeHeightWidth = (...args: Parameters<typeof changeHeightWithWrap>) => {
	changeHeightWithWrap(...args);
	changeWidthWithWrap(...args);
	return true;
};

(fabric as any).TextContainer.prototype.controls.mt = new fabric.Control({
	x: 0,
	y: -0.5,
	actionHandler: changeHeightWithWrap,
	cursorStyleHandler: fabric.controlsUtils.scaleSkewCursorStyleHandler,
});

(fabric as any).TextContainer.prototype.controls.mb = new fabric.Control({
	x: 0,
	y: 0.5,
	actionHandler: changeHeightWithWrap,
	cursorStyleHandler: fabric.controlsUtils.scaleSkewCursorStyleHandler,
});

(fabric as any).TextContainer.prototype.controls.mr = new fabric.Control({
	x: 0.5,
	y: 0,
	actionHandler: changeWidthWithWrap,
	cursorStyleHandler: fabric.controlsUtils.scaleSkewCursorStyleHandler,
});

(fabric as any).TextContainer.prototype.controls.ml = new fabric.Control({
	x: -0.5,
	y: 0,
	actionHandler: changeWidthWithWrap,
	cursorStyleHandler: fabric.controlsUtils.scaleSkewCursorStyleHandler,
});

(fabric as any).TextContainer.prototype.controls.tl = new fabric.Control({
	x: -0.5,
	y: -0.5,
	actionHandler: changeHeightWidth,
	cursorStyleHandler: fabric.controlsUtils.scaleSkewCursorStyleHandler,
});

(fabric as any).TextContainer.prototype.controls.tr = new fabric.Control({
	x: 0.5,
	y: -0.5,
	actionHandler: changeHeightWidth,
	cursorStyleHandler: fabric.controlsUtils.scaleSkewCursorStyleHandler,
});

(fabric as any).TextContainer.prototype.controls.bl = new fabric.Control({
	x: -0.5,
	y: 0.5,
	actionHandler: changeHeightWidth,
	cursorStyleHandler: fabric.controlsUtils.scaleSkewCursorStyleHandler,
});

(fabric as any).TextContainer.prototype.controls.br = new fabric.Control({
	x: 0.5,
	y: 0.5,
	actionHandler: changeHeightWidth,
	cursorStyleHandler: fabric.controlsUtils.scaleSkewCursorStyleHandler,
});
