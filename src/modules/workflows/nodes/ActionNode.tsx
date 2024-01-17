import { Stack, Text, createStyles } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import React from 'react';
import { IActionNode, IWorkflow } from '../types';

interface ActionNodeProps {
	workflow: UseFormReturnType<IWorkflow | null, (values: IWorkflow | null) => IWorkflow | null>;
	id: string;
}

const ActionNode: React.FC<ActionNodeProps> = ({ id, workflow }) => {
	const { classes } = useStyles();
	const currentNode = (workflow?.values?.nodes as unknown as IActionNode[]).find(node => node.id === id) as
		| IActionNode
		| undefined;
	// const currentNodeIndex = workflow?.values?.nodes.findIndex(node => node.id === id) as number;

	if (currentNode?.type !== 'action') {
		return null;
	}

	return (
		<Stack className={classes.root}>
			<Text className={classes.overline}>Action</Text>
		</Stack>
	);
};

export default ActionNode;

const useStyles = createStyles(theme => ({
	root: {
		padding: theme.spacing.md,
		border: `1px solid ${theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[2]}`,
		borderRadius: theme.radius.md,
		boxShadow: theme.shadows.sm,
		marginTop: theme.spacing.md,
		marginBottom: theme.spacing.md,
	},
	overline: {
		textTransform: 'uppercase',
		fontWeight: 500,
		color: theme.colors.gray[5],
		fontSize: 12,
	},
	conditionText: {
		fontSize: 12,
		color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.colors.gray[7],
	},
}));
