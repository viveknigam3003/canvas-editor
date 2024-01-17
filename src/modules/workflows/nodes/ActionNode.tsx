import { Group, Select, createStyles } from '@mantine/core';
import React from 'react';

import { NodeAction, Workflow } from '../types';
import { UseFormReturnType } from '@mantine/form';
import { getSelectDataFromActionType } from '../helpers';

interface ActionNodeProps {
	workflow: UseFormReturnType<Workflow | null, (values: Workflow | null) => Workflow | null>;
	nodeIndex: number;
	action: NodeAction;
	actionIndex: number;
}

const ActionNode: React.FC<ActionNodeProps> = ({ actionIndex, action, workflow, nodeIndex }) => {
	const { classes } = useStyles();

	return (
		<Group className={classes.root} key={action.id}>
			<Select
				variant="unstyled"
				style={{
					borderBottom: '1px solid #ccc',
				}}
				data={[
					{ value: 'action', label: 'Do' },
					{ value: 'plugin', label: 'Run plugin' },
					{ value: 'workflow', label: 'Run workflow' },
				]}
				{...workflow.getInputProps(`nodes.${nodeIndex}.actions.${actionIndex}.type`)}
				onChange={e => {
					workflow.setFieldValue(`nodes.${nodeIndex}.actions.${actionIndex}.fn.type`, '');
					workflow.getInputProps(`nodes.${nodeIndex}.actions.${actionIndex}.type`).onChange(e);
				}}
			/>
			<Select
				variant="unstyled"
				style={{
					borderBottom: '1px solid #ccc',
				}}
				w={200}
				data={getSelectDataFromActionType(action.type)}
				{...workflow.getInputProps(`nodes.${nodeIndex}.actions.${actionIndex}.fn.type`)}
			/>
		</Group>
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
