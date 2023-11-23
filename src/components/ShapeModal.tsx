import { Modal } from '@mantine/core';
import { Artboard } from '../types';
import { useModalStyles } from '../hooks';
import { fabric } from 'fabric';
import { Grid, Tabs } from '@mantine/core';
import Line from '../assets/Line.svg?react';
import Square from '../assets/Square.svg?react';
import Circle from '../assets/Circle.svg?react';
import Triangle from '../assets/Triangle.svg?react';
import { IconPhoto, IconLinkPlus } from '@tabler/icons-react';

type ShapeModalProps = {
	open: boolean;
	closeImageModal: () => void;
	selectedArtboard?: Artboard | null;
	canvasRef: React.MutableRefObject<fabric.Canvas | null>;
	artboardRef?: React.MutableRefObject<fabric.Rect | null>;
};

function actionHandler(eventData, transform, x, y) {
	const polygon = transform.target,
		currentControl = polygon.controls[polygon.__corner],
		mouseLocalPosition = polygon.toLocalPoint(new fabric.Point(x, y), 'center', 'center'),
		polygonBaseSize = getObjectSizeWithStroke(polygon),
		size = polygon._getTransformedDimensions(0, 0),
		finalPointPosition = {
			x: (mouseLocalPosition.x * polygonBaseSize.x) / size.x + polygon.pathOffset.x,
			y: (mouseLocalPosition.y * polygonBaseSize.y) / size.y + polygon.pathOffset.y,
		};
	polygon.points[currentControl.pointIndex] = finalPointPosition;
	return true;
}

// define a function that can keep the polygon in the same position when we change its
// width/height/top/left.
function anchorWrapper(anchorIndex, fn) {
	return function (eventData, transform, x, y) {
		const fabricObject = transform.target,
			absolutePoint = fabric.util.transformPoint(
				{
					x: fabricObject.points[anchorIndex].x - fabricObject.pathOffset.x,
					y: fabricObject.points[anchorIndex].y - fabricObject.pathOffset.y,
				},
				fabricObject.calcTransformMatrix(),
			),
			actionPerformed = fn(eventData, transform, x, y),
			// newDim = fabricObject._setPositionDimensions({}),
			polygonBaseSize = getObjectSizeWithStroke(fabricObject),
			newX = (fabricObject.points[anchorIndex].x - fabricObject.pathOffset.x) / polygonBaseSize.x,
			newY = (fabricObject.points[anchorIndex].y - fabricObject.pathOffset.y) / polygonBaseSize.y;
		fabricObject.setPositionByOrigin(absolutePoint, newX + 0.5, newY + 0.5);
		return actionPerformed;
	};
}
function polygonPositionHandler(dim, finalMatrix, fabricObject) {
	const x = fabricObject.points[this.pointIndex].x - fabricObject.pathOffset.x,
		y = fabricObject.points[this.pointIndex].y - fabricObject.pathOffset.y;
	return fabric.util.transformPoint(
		{ x: x, y: y },
		fabric.util.multiplyTransformMatrices(
			fabricObject.canvas.viewportTransform,
			fabricObject.calcTransformMatrix(),
		),
	);
}

function getObjectSizeWithStroke(object) {
	const stroke = new fabric.Point(
		object.strokeUniform ? 1 / object.scaleX : 1,
		object.strokeUniform ? 1 / object.scaleY : 1,
	).multiply(object.strokeWidth);
	return new fabric.Point(object.width + stroke.x, object.height + stroke.y);
}

const addLine = (canvas: fabric.Canvas) => {
	canvas.add(
		new fabric.Line([50, 50, 200, 50], {
			stroke: 'black',
			strokeWidth: 2,
		}),
	);
	canvas.requestRenderAll();
};

const addPolygon = (canvas: fabric.Canvas, sides: number = 4) => {
	let points: { x: number; y: number }[] = [];
	switch (sides) {
		case 3:
			points = [
				{ x: 0, y: 0 },
				{ x: 0, y: 40 },
				{ x: 40, y: 40 },
			];
			break;
		case 4:
			points = [
				{ x: 0, y: 0 },
				{ x: 0, y: 40 },
				{ x: 40, y: 40 },
				{ x: 40, y: 0 },
			];
			break;
		case 5:
			points = [
				{ x: 0, y: 0 },
				{ x: 0, y: 40 },
				{ x: 40, y: 40 },
				{ x: 40, y: 0 },
				{ x: 20, y: 20 },
			];
			break;
	}
	const polygon = new fabric.Polygon(points, {
		left: 100,
		top: 50,
		fill: '#D81B60',
		strokeWidth: 4,
		stroke: 'green',
		scaleX: 4,
		scaleY: 4,
		objectCaching: false,
		transparentCorners: false,
		cornerColor: 'blue',
	});
	canvas.on('mouse:dblclick', function (e) {
		console.log('canvas:dblclick', e);
		const poly = e.target;
		canvas.setActiveObject(poly);
		poly.edit = !poly.edit;
		if (poly.edit) {
			const lastControl = poly.points.length - 1;
			poly.cornerStyle = 'circle';
			poly.cornerColor = 'rgba(0,0,255,0.5)';

			poly.controls = poly.points.reduce(function (acc, point, index) {
				acc['p' + index] = new fabric.Control({
					positionHandler: polygonPositionHandler,
					actionHandler: anchorWrapper(index > 0 ? index - 1 : lastControl, actionHandler),
					actionName: 'modifyPolygon',
					pointIndex: index,
				});
				return acc;
			}, {});
		} else {
			poly.cornerColor = 'blue';
			poly.cornerStyle = 'rect';
			poly.controls = fabric.Object.prototype.controls;
		}
		poly.hasBorders = true;
		canvas.requestRenderAll();
		// Perform the desired action, such as opening a dialog box or changing the text of the element.
	});
	canvas.add(polygon);
	canvas.requestRenderAll();
};
const addCircle = (canvas: fabric.Canvas) => {
	const circle = new fabric.Circle({
		radius: 20,
		fill: 'green',
		left: 100,
		top: 100,
	});
	canvas.add(circle);
	canvas.requestRenderAll();
};

const ShapeModal = ({ open, closeImageModal, selectedArtboard, canvasRef }: ShapeModalProps) => {
	const { classes: modalClasses } = useModalStyles();
	return (
		<Modal
			opened={open}
			onClose={() => {
				closeImageModal();
			}}
			title={`Add image to ${selectedArtboard?.name}`}
			classNames={{
				content: modalClasses.content,
				title: modalClasses.title,
			}}
		>
			<Tabs defaultValue="url">
				<Tabs.List>
					<Tabs.Tab value="Fabric" icon={<IconPhoto size="0.8rem" />}>
						Fabric
					</Tabs.Tab>
					<Tabs.Tab value="Svg" icon={<IconLinkPlus size="0.8rem" />}>
						Svg
					</Tabs.Tab>
				</Tabs.List>

				<Tabs.Panel value="Fabric" pt="xs">
					<Grid gutter={16}>
						<Grid.Col
							span={4}
							onClick={() => {
								//line
								addLine(canvasRef.current as fabric.Canvas);
								closeImageModal();
							}}
						>
							<Line />
						</Grid.Col>
						<Grid.Col
							span={4}
							onClick={() => {
								//square
								addPolygon(canvasRef.current as fabric.Canvas);
								closeImageModal();
							}}
						>
							<Square />
						</Grid.Col>
						<Grid.Col
							span={4}
							onClick={() => {
								//circle
								addCircle(canvasRef.current as fabric.Canvas);
								closeImageModal();
							}}
						>
							<Circle />
						</Grid.Col>
						<Grid.Col
							span={4}
							onClick={() => {
								//triangle
								addPolygon(canvasRef.current as fabric.Canvas, 3);
								closeImageModal();
							}}
						>
							<Triangle />
						</Grid.Col>
						<Grid.Col
							span={4}
							onClick={() => {
								//pentagon
								addPolygon(canvasRef.current as fabric.Canvas, 5);
								closeImageModal();
							}}
						>
							<svg height="60" width="60" viewBox="0 0 50 50">
								<path
									d="M 24, 0 L 29.6129, 17.2746 L 47.7764, 17.2746 L 33.0818, 27.9508 L 38.6946, 45.2254 L 24, 34.5491 L 9.30537, 45.2254 L 14.9182, 27.9508 L 0.223587, 17.2746 L 18.3871, 17.2746 Z"
									fill="#C4C4C4"
								></path>
							</svg>
						</Grid.Col>
						<Grid.Col
							span={4}
							onClick={() => {
								//star
								closeImageModal();
							}}
						>
							1
						</Grid.Col>
					</Grid>
				</Tabs.Panel>

				<Tabs.Panel value="Svg" pt="xs">
					<Grid gutter={16}>
						<Grid.Col
							span={4}
							onClick={() => {
								//line
								closeImageModal();
							}}
						>
							<Line />
						</Grid.Col>
						<Grid.Col
							span={4}
							onClick={() => {
								//square
								closeImageModal();
							}}
						>
							<Square />
						</Grid.Col>
						<Grid.Col
							span={4}
							onClick={() => {
								//circle
								closeImageModal();
							}}
						>
							<Circle />
						</Grid.Col>
						<Grid.Col
							span={4}
							onClick={() => {
								//triangle
								closeImageModal();
							}}
						>
							<Triangle />
						</Grid.Col>
						<Grid.Col
							span={4}
							onClick={() => {
								//pentagon
								closeImageModal();
							}}
						>
							<svg height="60" width="60" viewBox="0 0 50 50">
								<path
									d="M 24, 0 L 29.6129, 17.2746 L 47.7764, 17.2746 L 33.0818, 27.9508 L 38.6946, 45.2254 L 24, 34.5491 L 9.30537, 45.2254 L 14.9182, 27.9508 L 0.223587, 17.2746 L 18.3871, 17.2746 Z"
									fill="#C4C4C4"
								></path>
							</svg>
						</Grid.Col>
						<Grid.Col
							span={4}
							onClick={() => {
								//star
								closeImageModal();
							}}
						>
							1
						</Grid.Col>
					</Grid>
				</Tabs.Panel>
			</Tabs>
		</Modal>
	);
};

export default ShapeModal;
