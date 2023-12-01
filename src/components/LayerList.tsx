import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/rootReducer';

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
import { convertFabricObjectsToLayers, convertLayersToFabricObjects } from '../utils';

const reorderArray = (array: NodeModel[], sourceIndex: number, targetIndex: number) => {
	const newArray = [...array];
	const element = newArray.splice(sourceIndex, 1)[0];
	newArray.splice(targetIndex, 0, element);
	return newArray;
};

// Component for all layers
export default function LayerList() {
	// Import layers data from redux
	const { classes } = useStyles();
	const layers = useSelector((state: RootState) => state.app.activeArtboardLayers);
	const { ref, getPipeHeight, toggle } = useTreeOpenHandler();
	const [treeData, setTreeData] = React.useState<NodeModel[]>([]);

	useEffect(() => {
		console.log('Layers changed');
		if (layers.length === 0) return;
		const newTreeData = convertFabricObjectsToLayers(layers) as NodeModel[];
		if (treeData !== newTreeData) setTreeData(newTreeData);
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
		console.log('Just tree Data 1', newTree);

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
				console.log('Just tree Data 2', output);
				return output;
			});
		}
		console.log('Just tree Data 3', treeData);
		convertLayersToFabricObjects(newTree);
	};
	console.log(treeData, 'treeData');
	return (
		<div>
			Layers ({layers.length - 1})
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
