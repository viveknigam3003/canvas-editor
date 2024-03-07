import React from 'react';
import { getDescendants, NodeModel } from '@minoru/react-dnd-treeview';
import NodeIcon from './NodeIcon';
import { createStyles } from '@mantine/core';

const TREE_X_OFFSET = 22;

const useStyles = createStyles(() => ({
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
		fontSize: '14px',
		paddingInlineStart: '8px',
		overflow: 'hidden',
		textOverflow: 'ellipsis',
	},
	pipeY: {
		position: 'absolute',
		borderLeft: '2px solid #e7e7e7',
		left: '-7px',
		top: '5px',
		display: 'none',
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
	dropTarget: {
		outline: '3px solid #e8f0fe',
		borderRadius: '4px',
	},
}));

const Node: React.FC<{
	node: NodeModel;
	depth: number;
	isOpen: boolean;
	isDropTarget: boolean;
	treeData: NodeModel[];
	onClick: (id: NodeModel['id']) => void;
	getPipeHeight: (id: string | number, treeData: NodeModel[]) => number;
}> = ({ node, depth, isOpen, isDropTarget, onClick, treeData, getPipeHeight }) => {
	const indent = depth * TREE_X_OFFSET;
	const { classes } = useStyles();
	const handleToggle = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (node.droppable) {
			onClick(node.id);
			return;
		}

		onClick((node.data as fabric.Object).data.id);
	};

	const getNodeType = (node: NodeModel) => {
		if (node.droppable) {
			if ((node.data as fabric.Object)?.data?.type === 'clipGroup') {
				return 'clipGroup';
			}
			if (isOpen) {
				return 'folder-open';
			}
			return 'folder';
		}
		if ((node.data as fabric.Object)?.type === 'imagebox') {
			return 'image';
		}
		if ((node.data as fabric.Object)?.data?.type === 'video') {
			return 'video';
		}
		return node.text;
	};

	const getNodeText = (node: NodeModel) => {
		switch (node.text) {
			case 'imagebox':
				return 'Image';
			case 'image':
				if ((node.data as fabric.Object)?.data?.type === 'video') {
					return 'Video';
				}
				return 'Image';
			case 'textbox':
				if ((node.data as fabric.Object)?.data?.displayText) {
					return (node.data as fabric.Object)?.data?.displayText;
				}

				return 'Text';
			case 'group':
				if ((node.data as fabric.Object)?.data?.type === 'clipGroup') {
					return 'Mask group';
				}

				return 'Group';
			case 'path':
				return 'Shape';
			default:
				return node.text;
		}
	};

	return (
		<div
			className={`${classes.nodeWrapper} tree-node ${node.droppable && isDropTarget ? classes.dropTarget : ''}`}
			style={{ marginInlineStart: indent }}
			onClick={handleToggle}
		>
			<NodeIcon type={getNodeType(node)} />
			<div className={classes.pipeX} style={{ width: depth > 0 ? TREE_X_OFFSET - 9 : 0 }} />
			{getDescendants(treeData, node.parent)[0].id === node.id && (
				<div
					className={classes.pipeY}
					style={{
						height: Math.max(0, getPipeHeight(node.parent, treeData) - 8),
					}}
				/>
			)}
			<div className={classes.labelGridItem}>{getNodeText(node)}</div>
			<div className={`${classes.expandIconWrapper}}`}>
				{node.droppable && (
					<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path
							d="M10.5866 5.99969L7.99997 8.58632L5.41332 5.99969C5.15332 5.73969 4.73332 5.73969 4.47332 5.99969C4.21332 6.25969 4.21332 6.67965 4.47332 6.93965L7.5333 9.99965C7.59497 10.0615 7.66823 10.1105 7.7489 10.144C7.82957 10.1775 7.91603 10.1947 8.0033 10.1947C8.09063 10.1947 8.1771 10.1775 8.25777 10.144C8.33837 10.1105 8.41163 10.0615 8.4733 9.99965L11.5333 6.93965C11.7933 6.67965 11.7933 6.25969 11.5333 5.99969C11.2733 5.74635 10.8466 5.73969 10.5866 5.99969Z"
							fill="black"
						/>
					</svg>
				)}
			</div>
		</div>
	);
};

export default Node;
