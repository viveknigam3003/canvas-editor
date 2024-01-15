import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/rootReducer';

import { createStyles, Box } from '@mantine/core';
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
import { convertFabricObjectsToLayers } from './helpers';
import { fabric } from 'fabric';
import SectionTitle from '../../components/SectionTitle';
import { filterLayerPanelExcludes } from '../utils/fabricObjectUtils';

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

	useEffect(() => {
		if (layers.length === 0) return;
		const newTreeData = convertFabricObjectsToLayers(filterLayerPanelExcludes(layers)) as NodeModel[];
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
		convertLayersToFabricObjects(newTree);
		// updateFabricCanvas(canvas, newCanvasObject);
	};
	interface layer {
		id: number | string;
		parent: number | string;
		text: string;
		droppable?: boolean | undefined;
		data?: any | undefined;
	}

	function convertLayersToFabricObjects(layers: layer[]) {
		const fabricObjects: { [key: number]: any } = {};
		const rootObjectIds: { [key: number]: boolean } = {}; // Changed from number[] to { [key: number]: boolean }

		// First pass: create fabricObjects for all layers
		layers.forEach(layer => {
			fabricObjects[layer.id as number] = layer.data ? { ...layer.data, objects: [] } : { objects: [] };
			if (layer.parent === 0) {
				rootObjectIds[layer.id as number] = true;
			}
		});

		console.log(rootObjectIds, fabricObjects);

		// Second pass: build the nested structure and adjust left/top values
		layers.forEach(layer => {
			if (layer.parent !== 0) {
				const parent = fabricObjects[layer.parent as number];
				const parentId = parent.data.id as number;

				const layerId = layer.data.data.id;
				console.log(layerId);

				console.log(parentId);
				const textbox = canvas?.getObjects().find(obj => obj.data.id === layerId);
				const group = canvas?.getObjects('group').find(obj => obj.data.id === parentId);

				if (textbox && group) {
					// Check if the textbox is already part of a group
					if (textbox.group != null) {
						console.log('Textbox is already part of a group');
						return;
					}

					// Add the textbox to the group
					(group as fabric.Group).addWithUpdate(textbox);

					// Remove the textbox from the canvas
					canvas?.remove(textbox);

					// Rerender the canvas
					canvas?.renderAll();
				}
			}
		});
		console.log(fabricObjects);
	}

	return (
		<Box className={classes.listContainer}>
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
						canDrop={() => true}
						dropTargetOffset={5}
						placeholderRender={(node, { depth }) => <Placeholder node={node} depth={depth} />}
						render={(node, { depth, isOpen, isDropTarget }) => (
							<Node
								getPipeHeight={getPipeHeight}
								node={node}
								depth={depth}
								isOpen={isOpen}
								onClick={id => {
									if (node.droppable) {
										toggle(id);
										return;
									}
									const item = canvas?.getObjects().find((obj: any) => obj?.data?.id === id);
									if (item) {
										canvas?.setActiveObject(item);
										canvas?.getActiveObject()?.drawControls(canvas?.getContext());
										canvas?.requestRenderAll();
									}
								}}
								isDropTarget={isDropTarget}
								treeData={treeData}
							/>
						)}
					/>
				</div>
			</DndProvider>
		</Box>
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
		display: 'none',
	},
	wrapper: {
		fontFamily: 'sans-serif',
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
	listContainer: {
		padding: '0.5rem 1rem',
		borderTop: `1px solid ${theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]}`,
	},
}));
