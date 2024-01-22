import { RULER_LINES } from '../ruler';
import { fabric } from 'fabric';

type VerticalLineCoords = {
	x: number;
	y1: number;
	y2: number;
};

type HorizontalLineCoords = {
	y: number;
	x1: number;
	x2: number;
};

// type IgnoreObjTypes<T = keyof fabric.Object> = {
// 	key: T;
// 	value: any;
// }[];

type ACoordsAppendCenter = NonNullable<fabric.Object['aCoords']> & {
	c: fabric.Point;
};

const Keys = <T extends object>(obj: T): (keyof T)[] => {
	return Object.keys(obj) as (keyof T)[];
};

export class FabricGuide {
	private canvasEvents;

	private aligningLineMargin = 5;
	private aligningLineWidth = 1;
	private aligningLineColor = 'blue';

	private verticalLines: VerticalLineCoords[] = [];
	private horizontalLines: HorizontalLineCoords[] = [];
	private activeObj: fabric.Object | undefined;
	// private ignoreObjTypes: IgnoreObjTypes = [];
	// private pickObjTypes: IgnoreObjTypes = [];
	private dirty = false;

	constructor(private readonly canvas: fabric.Canvas) {
		const mouseUp = () => {
			if (this.horizontalLines.length || this.verticalLines.length) {
				this.clearGuideline();
				this.clearStretLine();
			}
		};

		this.canvasEvents = {
			'before:render': this.clearGuideline.bind(this),
			'after:render': this.drawGuideLines.bind(this),
			'object:moving': this.objectMoving.bind(this),
			'mouse:up': mouseUp,
		};
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		//@ts-ignore
		canvas.on(this.canvasEvents as any);
	}

	public objectMoving({ target }: any) {
		this.clearStretLine();

		if (Object.values(RULER_LINES).includes(target?.data?.type)) return;

		this.activeObj = target;

		this.traverseObjects(
			target,
			this.canvas.getObjects().filter((obj: fabric.Object) => obj !== target && !obj.data.ignoreSnapping),
		);
	}

	private clearStretLine() {
		this.verticalLines.length = this.horizontalLines.length = 0;
	}

	private getObjDraggingObjCoords(activeObject: fabric.Object): ACoordsAppendCenter {
		const coords = this.getCoords(activeObject);
		const centerPoint = this.calcCenterPointByACoords(coords).subtract(activeObject.getCenterPoint());
		const newCoords = Keys(coords).map(key => coords[key].subtract(centerPoint));
		return {
			tl: newCoords[0],
			tr: newCoords[1],
			br: newCoords[2],
			bl: newCoords[3],
			c: activeObject.getCenterPoint(),
		};
	}

	private getObjMaxWidthHeightByCoords(coords: ACoordsAppendCenter) {
		const { c, tl, tr } = coords;
		const objHeight = Math.max(Math.abs(c.y - tl.y), Math.abs(c.y - tr.y)) * 2;
		const objWidth = Math.max(Math.abs(c.x - tl.x), Math.abs(c.x - tr.x)) * 2;
		return { objHeight, objWidth };
	}

	private omitCoords(objCoords: ACoordsAppendCenter, type: 'vertical' | 'horizontal') {
		const newCoords = objCoords;
		const axis = type === 'vertical' ? 'x' : 'y';
		Keys(objCoords).forEach(key => {
			if (objCoords[key][axis] < newCoords.tl[axis]) {
				newCoords[key] = objCoords[key];
			}
			if (objCoords[key][axis] > newCoords.tl[axis]) {
				newCoords[key] = objCoords[key];
			}
		});
		return newCoords;
	}

	private isInRange(value1: number, value2: number) {
		return Math.abs(Math.round(value1) - Math.round(value2)) <= this.aligningLineMargin / this.canvas.getZoom();
	}

	private getCoords(obj: fabric.Object) {
		const [tl, tr, br, bl] = obj.getCoords(true);
		return { tl, tr, br, bl };
	}

	private calcCenterPointByACoords(coords: NonNullable<fabric.Object['aCoords']>): fabric.Point {
		return new fabric.Point((coords.tl.x + coords.br.x) / 2, (coords.tl.y + coords.br.y) / 2);
	}

	private traverseObjects(activeObject: fabric.Object, canvasObjects: fabric.Object[]) {
		const objCoordsByMovingDistance = this.getObjDraggingObjCoords(activeObject);
		const snapXPoints: Set<number> = new Set();
		const snapYPoints: Set<number> = new Set();
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		//@ts-ignore
		for (let i = canvasObjects.length; i--;) {
			const objCoords = {
				...this.getCoords(canvasObjects[i]),
				c: canvasObjects[i].getCenterPoint(),
			} as ACoordsAppendCenter;
			const { objHeight, objWidth } = this.getObjMaxWidthHeightByCoords(objCoords);

			Keys(objCoordsByMovingDistance).forEach(activeObjPoint => {
				const newCoords = canvasObjects[i].angle !== 0 ? this.omitCoords(objCoords, 'horizontal') : objCoords;

				function calcHorizontalLineCoords(
					objPoint: keyof ACoordsAppendCenter,
					activeObjCoords: ACoordsAppendCenter,
				) {
					let x1: number, x2: number;
					if (objPoint === 'c') {
						x1 = Math.min(objCoords.c.x - objWidth / 2, activeObjCoords[activeObjPoint].x);
						x2 = Math.max(objCoords.c.x + objWidth / 2, activeObjCoords[activeObjPoint].x);
					} else {
						x1 = Math.min(objCoords[objPoint].x, activeObjCoords[activeObjPoint].x);
						x2 = Math.max(objCoords[objPoint].x, activeObjCoords[activeObjPoint].x);
					}
					return { x1, x2 };
				}

				Keys(newCoords).forEach(objPoint => {
					if (this.isInRange(objCoordsByMovingDistance[activeObjPoint].y, objCoords[objPoint].y)) {
						const y = objCoords[objPoint].y;

						const offset = objCoordsByMovingDistance[activeObjPoint].y - y;
						snapYPoints.add(objCoordsByMovingDistance.c.y - offset);

						const aCoords = this.getCoords(activeObject);
						const { x1, x2 } = calcHorizontalLineCoords(objPoint, {
							...aCoords,
							c: this.calcCenterPointByACoords(aCoords),
						} as ACoordsAppendCenter);
						this.horizontalLines.push({ y, x1, x2 });
					}
				});
			});

			Keys(objCoordsByMovingDistance).forEach(activeObjPoint => {
				const newCoords = canvasObjects[i].angle !== 0 ? this.omitCoords(objCoords, 'vertical') : objCoords;

				function calcVerticalLineCoords(
					objPoint: keyof ACoordsAppendCenter,
					activeObjCoords: ACoordsAppendCenter,
				) {
					let y1: number, y2: number;
					if (objPoint === 'c') {
						y1 = Math.min(newCoords.c.y - objHeight / 2, activeObjCoords[activeObjPoint].y);
						y2 = Math.max(newCoords.c.y + objHeight / 2, activeObjCoords[activeObjPoint].y);
					} else {
						y1 = Math.min(objCoords[objPoint].y, activeObjCoords[activeObjPoint].y);
						y2 = Math.max(objCoords[objPoint].y, activeObjCoords[activeObjPoint].y);
					}
					return { y1, y2 };
				}

				Keys(newCoords).forEach(objPoint => {
					// console.log('newCoords');
					if (this.isInRange(objCoordsByMovingDistance[activeObjPoint].x, objCoords[objPoint].x)) {
						const x = objCoords[objPoint].x;

						const offset = objCoordsByMovingDistance[activeObjPoint].x - x;
						snapXPoints.add(objCoordsByMovingDistance.c.x - offset);

						const aCoords = this.getCoords(activeObject);
						const { y1, y2 } = calcVerticalLineCoords(objPoint, {
							...aCoords,
							c: this.calcCenterPointByACoords(aCoords),
						} as ACoordsAppendCenter);
						this.verticalLines.push({ x, y1, y2 });
					}
				});
			});
		}
		// console.log('this.snap');
		this.snap({
			activeObject,
			draggingObjCoords: objCoordsByMovingDistance,
			snapXPoints,
			snapYPoints,
		});
	}

	private snap({
		activeObject,
		draggingObjCoords,
		snapXPoints,
		snapYPoints,
	}: {
		activeObject: fabric.Object;

		draggingObjCoords: ACoordsAppendCenter;

		snapXPoints: Set<number>;

		snapYPoints: Set<number>;
	}) {
		if (snapXPoints.size === 0 && snapYPoints.size === 0) return;

		const sortPoints = (list: Set<number>, originPoint: number): number => {
			if (list.size === 0) {
				return originPoint;
			}

			const sortedList = [...list].sort((a, b) => Math.abs(originPoint - a) - Math.abs(originPoint - b));

			return sortedList[0];
		};

		const point = new fabric.Point(
			sortPoints(snapXPoints, draggingObjCoords.c.x),
			sortPoints(snapYPoints, draggingObjCoords.c.y),
		);
		// auto snap nearest object, record all the snap points, and then find the nearest one
		// activeObject.setXY(

		// 	'center',
		// 	'center',
		// );
		activeObject.setPositionByOrigin(point, 'center', 'center');
	}

	private drawSign(x: number, y: number) {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		//@ts-ignore
		const ctx = this.canvas.getTopContext();
		// console.log('first', x, y);
		ctx.strokeStyle = this.aligningLineColor;
		ctx.beginPath();

		const size = 3;
		ctx.moveTo(x - size, y - size);
		ctx.lineTo(x + size, y + size);
		ctx.moveTo(x + size, y - size);
		ctx.lineTo(x - size, y + size);
		ctx.stroke();
	}

	private drawLine(x1: number, y1: number, x2: number, y2: number) {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		//@ts-ignore
		const ctx = this.canvas.getTopContext();
		const point1 = fabric.util.transformPoint(new fabric.Point(x1, y1), this.canvas.viewportTransform as number[]);
		const point2 = fabric.util.transformPoint(new fabric.Point(x2, y2), this.canvas.viewportTransform as number[]);

		// use origin canvas api to draw guideline
		ctx.save();
		ctx.lineWidth = this.aligningLineWidth;
		ctx.strokeStyle = this.aligningLineColor;
		ctx.beginPath();

		ctx.moveTo(point1.x, point1.y);
		ctx.lineTo(point2.x, point2.y);

		ctx.stroke();

		this.drawSign(point1.x, point1.y);
		this.drawSign(point2.x, point2.y);

		ctx.restore();

		this.dirty = true;
	}

	private drawVerticalLine(coords: VerticalLineCoords, movingCoords: ACoordsAppendCenter) {
		if (!Object.values(movingCoords).some(coord => Math.abs(coord.x - coords.x) < 0.0001)) return;
		this.drawLine(coords.x, Math.min(coords.y1, coords.y2), coords.x, Math.max(coords.y1, coords.y2));
	}

	private drawHorizontalLine(coords: HorizontalLineCoords, movingCoords: ACoordsAppendCenter) {
		if (!Object.values(movingCoords).some(coord => Math.abs(coord.y - coords.y) < 0.0001)) return;
		this.drawLine(Math.min(coords.x1, coords.x2), coords.y, Math.max(coords.x1, coords.x2), coords.y);
	}

	private drawGuideLines(e: any) {
		if (!e.ctx || (!this.verticalLines.length && !this.horizontalLines.length) || !this.activeObj) {
			return;
		}

		const movingCoords = this.getObjDraggingObjCoords(this.activeObj);

		for (let i = this.verticalLines.length; i--;) {
			this.drawVerticalLine(this.verticalLines[i], movingCoords);
		}
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		//@ts-ignore
		for (let i = this.horizontalLines.length; i--;) {
			this.drawHorizontalLine(this.horizontalLines[i], movingCoords);
		}
	}

	private clearGuideline() {
		if (!this.dirty) return;
		this.dirty = false;
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		//@ts-ignore
		this.canvas.clearContext(this.canvas.getTopContext());
	}
}
