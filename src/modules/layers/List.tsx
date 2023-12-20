import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/rootReducer';

import { createStyles } from '@mantine/core';
import {
	DndProvider,
	DropOptions,
	getBackendOptions,
	getDescendants,
	MultiBackend,
	Tree,
	NodeModel,
} from '@minoru/react-dnd-treeview';
import Node from './Folders/Node';
import Placeholder from './Folders/Placeholder';
import useTreeOpenHandler from './Folders/useTreeOpenHandler';
import { convertFabricObjectsToLayers, convertLayersToFabricObjects } from './helpers';
import { fabric } from 'fabric';
import SectionTitle from '../../components/SectionTitle';
import { filterSnappingLines } from '../snapping';

const reorderArray = (array: NodeModel[], sourceIndex: number, targetIndex: number) => {
	const newArray = [...array];
	const element = newArray.splice(sourceIndex, 1)[0];
	newArray.splice(targetIndex, 0, element);
	return newArray;
};

type LayerListProp = {
	canvas: fabric.Canvas | null;
};
// Component for all layers
export default function LayerList({ canvas }: LayerListProp) {
	// Import layers data from redux
	const { classes } = useStyles();
	const layers = useSelector((state: RootState) => state.app.activeArtboardLayers);
	const { ref, getPipeHeight, toggle } = useTreeOpenHandler();
	const [treeData, setTreeData] = React.useState<NodeModel[]>([]);

	const updateFabricCanvas = (canvas: any, newObjects: any[]) => {
		console.log('Updating canvas', newObjects, canvas);
		// let rect;
		// // Remove all objects that are not rectangles
		// canvas.getObjects().forEach((object: any) => {
		// 	if (object?.data?.type !== 'artboard') canvas.remove(object);
		// });

		// // Add new objects to the canvas
		// newObjects.forEach(object => {
		// 	let fabricObject;
		// 	switch (object.type) {
		// 		case 'rect':
		// 			fabricObject = new fabric.Rect(object);
		// 			break;
		// 		case 'textbox':
		// 			fabricObject = new fabric.Textbox(object.text, object);
		// 			break;
		// 		case 'group':
		// 			// eslint-disable-next-line no-case-declarations
		// 			const groupObjects = object.objects
		// 				.map((obj: any) => {
		// 					switch (obj.type) {
		// 						case 'rect':
		// 							return new fabric.Rect({
		// 								...obj,
		// 								left: obj.left - object.left,
		// 								top: obj.top - object.top,
		// 							});
		// 						case 'textbox':
		// 							return new fabric.Textbox(obj.text, {
		// 								...obj,
		// 								left: obj.left - object.left,
		// 								top: obj.top - object.top,
		// 							});
		// 						case 'image':
		// 							fabric.Image.fromURL(object.url, img => {
		// 								img.set(object);
		// 								canvas.add(img);
		// 							});
		// 							return;
		// 						default:
		// 							console.error(`Unsupported object type: ${obj.type}`);
		// 							return null;
		// 					}
		// 				})
		// 				.filter((obj: any) => obj !== null);
		// 			fabricObject = new fabric.Group(groupObjects, object);
		// 			break;
		// 		case 'image':
		// 			fabric.Image.fromURL(object.url, img => {
		// 				img.set(object);
		// 				canvas.add(img);
		// 			});
		// 			return;
		// 		// Add more cases as needed...
		// 		default:
		// 			console.error(`Unsupported object type: ${object.type}`);
		// 			return;
		// 	}

		// 	// Add the object to the canvas
		// 	canvas.add(fabricObject);
		// });

		// // Send the rectangle to the back
		// if (rect) {
		// 	canvas.sendToBack(rect);
		// }

		// // Render the canvas
		// canvas.requestRenderAll();
	};

	useEffect(() => {
		if (layers.length === 0) return;
		const newTreeData = convertFabricObjectsToLayers(filterSnappingLines(layers)) as NodeModel[];
		setTreeData(prev => {
			if (JSON.stringify(prev) === JSON.stringify(newTreeData)) return prev;
			return newTreeData;
		});
	}, [layers]);

	const handleDrop = (newTree: NodeModel[], e: DropOptions) => {
		const { dragSourceId, dropTargetId, destinationIndex } = e;
		if (typeof dragSourceId === 'undefined' || typeof dropTargetId === 'undefined') return;
		const start = treeData.find(v => v.id === dragSourceId);
		const end = treeData.find(v => v.id === dropTargetId);

		if (start?.parent === dropTargetId && start && typeof destinationIndex === 'number') {
			setTreeData(treeData => {
				const output = reorderArray(treeData, treeData.indexOf(start), destinationIndex);
				return output;
			});
		}

		if (start?.parent !== dropTargetId && start && typeof destinationIndex === 'number') {
			if (
				getDescendants(treeData, dragSourceId).find(el => el.id === dropTargetId) ||
				dropTargetId === dragSourceId ||
				(end && !end?.droppable)
			)
				return;
			setTreeData(treeData => {
				const output = reorderArray(treeData, treeData.indexOf(start), destinationIndex);
				const movedElement = output.find(el => el.id === dragSourceId);
				if (movedElement) movedElement.parent = dropTargetId;
				return output;
			});
		}
		const newCanvasObject = convertLayersToFabricObjects(newTree);
		updateFabricCanvas(canvas, newCanvasObject);
	};

	return (
		<div>
			<SectionTitle>Layers ({treeData.length})</SectionTitle>
			<DndProvider backend={MultiBackend} options={getBackendOptions()}>
				<div className={classes.wrapper}>
					<Tree
						ref={ref}
						classes={{
							root: classes.treeRoot,
							placeholder: classes.placeholder,
							dropTarget: classes.hasDropTarget,
						}}
						tree={treeData}
						sort={false}
						rootId={0}
						insertDroppableFirst={false}
						enableAnimateExpand={true}
						onDrop={handleDrop}
						canDrop={() => false}
						dropTargetOffset={5}
						placeholderRender={(node, { depth }) => <Placeholder node={node} depth={depth} />}
						render={(node, { depth, isOpen, isDropTarget }) => (
							<Node
								getPipeHeight={getPipeHeight}
								node={node}
								depth={depth}
								isOpen={isOpen}
								onClick={() => {
									if (node.droppable) {
										toggle(node?.id);
									}
								}}
								isDropTarget={isDropTarget}
								treeData={treeData}
							/>
						)}
					/>
				</div>
			</DndProvider>
		</div>
	);
}

const useStyles = createStyles(theme => ({
	layer: {
		marginBottom: theme.spacing.xs,
		userSelect: 'none',
		display: 'flex',
		alignItems: 'center',
		cursor: 'pointer',
		'&:hover': {
			backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[1],
		},
	},
	nodeWrapper: {
		alignItems: 'center',
		display: 'grid',
		gridTemplateColumns: 'auto 1fr auto',
		height: '32px',
		paddingInlineEnd: '8px',
		paddingInlineStart: '8px',
		borderRadius: '4px',
		cursor: 'pointer',
		whiteSpace: 'nowrap',
		position: 'relative',
		zIndex: 3,
		'&:hover': {
			backgroundColor: 'rgba(0, 0, 0, 0.04)',
		},
	},
	expandIconWrapper: {
		alignItems: 'center',
		fontSize: 0,
		cursor: 'pointer',
		display: 'flex',
		height: '24px',
		justifyContent: 'center',
		width: '24px',
		transform: 'rotate(0deg)',
		'&.isOpen': {
			transform: 'rotate(180deg)',
			'& svg path': {
				fill: '#4f5272',
			},
		},
	},
	labelGridItem: {
		paddingInlineStart: '8px',
		overflow: 'hidden',
		textOverflow: 'ellipsis',
	},
	pipeY: {
		position: 'absolute',
		borderLeft: '2px solid #e7e7e7',
		left: '-7px',
		top: '-7px',
	},
	pipeX: {
		position: 'absolute',
		left: '-7px',
		top: '15px',
		height: '2px',
		backgroundColor: '#e7e7e7',
		zIndex: -1,
	},
	wrapper: {
		fontFamily: 'sans-serif',
		padding: '20px',
	},
	treeRoot: {
		listStyleType: 'none',
		paddingInlineStart: '0px',
		padding: '10px',
		position: 'relative',
		'& ul': {
			listStyleType: 'none',
			paddingInlineStart: '0px',
			position: 'relative',
			paddingBottom: '5px',
		},
		'& > li:after': {
			display: 'none',
		},
	},
	draggingSource: {
		opacity: 0.3,
	},
	placeholder: {
		position: 'relative',
	},
	pipeYHidden: {
		display: 'none',
	},
	hasDropTarget: {
		outline: '3px solid #e8f0fe',
		borderRadius: '4px',
	},
}));
