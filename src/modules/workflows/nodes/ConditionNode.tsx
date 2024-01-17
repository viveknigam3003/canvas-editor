import { MultiSelect, Select, Stack, Text, createStyles } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import React, { useEffect } from 'react';

import { Conditional, When, Workflow } from '../types';

interface ConditionNodeProps {
	workflow: UseFormReturnType<Workflow | null, (values: Workflow | null) => Workflow | null>;
	nodeIndex: number;
}

const ConditionNode: React.FC<ConditionNodeProps> = ({ workflow, nodeIndex }) => {
	const { classes } = useStyles();
	const [showConditional, setShowConditional] = React.useState(false);
	const [showTargets, setShowTargets] = React.useState(false);
	const [showSingleTarget, setShowSingleTarget] = React.useState(false);

	useEffect(() => {
		if (workflow.values?.nodes[nodeIndex].condition.when === When.ACTIVE_ELEMENT) {
			setShowConditional(false);
			setShowTargets(false);
		} else {
			setShowConditional(true);
			setShowTargets(true);
			if (workflow.values?.nodes[nodeIndex].condition.conditional === Conditional.IS) {
				setShowSingleTarget(true);
			}
		}
	}, [nodeIndex, workflow.values?.nodes]);

	return (
		<Stack className={classes.root}>
			<Text className={classes.overline}>When</Text>
			<Select
				defaultValue={When.ACTIVE_ELEMENT}
				data={[
					{ value: When.ACTIVE_ELEMENT, label: 'Workflow Triggered' },
					{ value: When.SELECTED_ELEMENT, label: 'Selected element' },
				]}
				{...workflow.getInputProps(`nodes.${nodeIndex}.condition.when`)}
				onChange={value => {
					if (value === When.ACTIVE_ELEMENT) {
						setShowConditional(false);
						setShowTargets(false);
					} else {
						setShowConditional(true);
						setShowTargets(true);
					}
					workflow.getInputProps(`nodes.${nodeIndex}.condition.when`).onChange(value);
				}}
			/>
			{showConditional && (
				<Select
					data={[
						{ value: Conditional.IS, label: 'is equal to' },
						{ value: Conditional.CONTAIN, label: 'contains' },
					]}
					{...workflow.getInputProps(`nodes.${nodeIndex}.condition.conditional`)}
					onChange={value => {
						if (value === Conditional.IS) {
							setShowSingleTarget(true);
						} else {
							setShowSingleTarget(false);
						}
						workflow.getInputProps(`nodes.${nodeIndex}.condition.conditional`).onChange(value);
					}}
				/>
			)}
			{showTargets &&
				(showSingleTarget ? (
					<Select
						data={[
							{ value: 'image', label: 'Image' },
							{ value: 'textbox', label: 'Text' },
							{ value: 'path', label: 'Shape' },
						]}
						{...workflow.getInputProps(`nodes.${nodeIndex}.condition.targets`)}
						value={workflow.values?.nodes[nodeIndex].condition.targets[0]}
						onChange={value => {
							console.log('VAL', value);
							workflow.getInputProps(`nodes.${nodeIndex}.condition.targets`).onChange([value]);
						}}
					/>
				) : (
					<MultiSelect
						data={[
							{ value: 'image', label: 'Image' },
							{ value: 'textbox', label: 'Text' },
							{ value: 'path', label: 'Shape' },
						]}
						{...workflow.getInputProps(`nodes.${nodeIndex}.condition.targets`)}
					/>
				))}
		</Stack>
	);
};

export default ConditionNode;

const useStyles = createStyles(theme => ({
	root: {
		padding: theme.spacing.md,
		border: `1px solid ${theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[1]}`,
		borderRadius: theme.radius.md,
		boxShadow: theme.shadows.sm,
		margin: theme.spacing.md,
		marginBottom: theme.spacing.md,
		backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : '#fdfdfd',
	},
	overline: {
		textTransform: 'uppercase',
		fontWeight: 700,
		color: theme.colors.blue[5],
		fontSize: 14,
	},
	conditionText: {
		fontSize: 12,
		color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.colors.gray[7],
	},
}));
