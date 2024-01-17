import { MultiSelect, Select, Stack, Text, createStyles } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import React from 'react';
import { Workflow } from '../engine';
import { Conditional, When } from '../types';

interface ConditionNodeProps {
	workflow: UseFormReturnType<Workflow | null, (values: Workflow | null) => Workflow | null>;
	nodeIndex: number;
}

const ConditionNode: React.FC<ConditionNodeProps> = ({ workflow, nodeIndex }) => {
	const { classes } = useStyles();

	return (
		<Stack className={classes.root}>
			<Text className={classes.overline}>Condition</Text>
			<Select
				data={[
					{ value: When.ACTIVE_ELEMENT, label: 'Active element' },
					{ value: When.SELECTED_ELEMENT, label: 'Selected element' },
				]}
				{...workflow.getInputProps(`nodes.${nodeIndex}.condition.when`)}
			/>
			<Select
				data={[
					{ value: Conditional.IS, label: 'is equal to' },
					{ value: Conditional.CONTAIN, label: 'contains' },
				]}
				{...workflow.getInputProps(`nodes.${nodeIndex}.condition.conditional`)}
			/>
			<MultiSelect
				data={[
					{ value: 'image', label: 'Image' },
					{ value: 'textbox', label: 'Text' },
					{ value: 'path', label: 'Shape' },
				]}
				{...workflow.getInputProps(`nodes.${nodeIndex}.condition.targets`)}
			/>
		</Stack>
	);
};

export default ConditionNode;

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
