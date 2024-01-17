import { Group, Select, Stack, Text, createStyles } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import React from 'react';
import { enumObjectFromString, getDataFromEnum, getEnumValues, getKeyFromEnum } from '../helpers';
import { ConditionComponent, Conditional, ITriggerNode, IWorkflow, Target, When } from '../types';

interface TriggerNodeProps {
	workflow: UseFormReturnType<IWorkflow | null, (values: IWorkflow | null) => IWorkflow | null>;
	id: string;
}

const TriggerNode: React.FC<TriggerNodeProps> = ({ id, workflow }) => {
	const { classes } = useStyles();
	const currentNode = (workflow?.values?.nodes as unknown as ITriggerNode[]).find(node => node.id === id) as
		| ITriggerNode
		| undefined;
	const currentNodeIndex = workflow?.values?.nodes.findIndex(node => node.id === id) as number;

	if (currentNode?.type !== 'trigger') {
		return null;
	}

	const updateWorkflowNodeCondition = (key: string | null, component: ConditionComponent) => {
		const enumObject = enumObjectFromString(component);
		// Get value from enum using the key
		const value = enumObject ? enumObject[key as keyof typeof enumObject] : null;

		const newNodes = (workflow.values?.nodes as unknown as ITriggerNode[]).map((node, index) => {
			if (index === currentNodeIndex) {
				return {
					...node,
					condition: {
						...node.condition,
						[component]: value,
					},
				};
			}

			return node;
		});

		workflow.setFieldValue('nodes', newNodes);
	};

	const renderConditionComponent = (condition: string | null) => {
		const WhenKeys = getEnumValues(When);
		const ConditionalKeys = getEnumValues(Conditional);
		const TargetKeys = getEnumValues(Target);

		if (!condition) {
			return null;
		}

		// When condition is something from When, then render Select with options from enum When
		if (WhenKeys.includes(condition)) {
			const data = getDataFromEnum(When);
			return (
				<Group spacing={4}>
					<Text className={classes.conditionText}>When</Text>
					<Select
						variant="filled"
						size="xs"
						placeholder="Select a condition"
						data={data}
						value={getKeyFromEnum(When, condition)}
						onChange={v => updateWorkflowNodeCondition(v, 'when')}
					/>
				</Group>
			);
		}

		if (ConditionalKeys.includes(condition)) {
			const data = getDataFromEnum(Conditional);
			return (
				<Select
					variant="filled"
					size="xs"
					placeholder="Select a condition"
					data={data}
					value={getKeyFromEnum(Conditional, condition)}
					onChange={v => updateWorkflowNodeCondition(v, 'conditional')}
				/>
			);
		}

		if (TargetKeys.includes(condition)) {
			const data = getDataFromEnum(Target);
			return (
				<Select
					variant="filled"
					size="xs"
					placeholder="Select a condition"
					data={data}
					value={getKeyFromEnum(Target, condition)}
					onChange={v => updateWorkflowNodeCondition(v, 'target')}
				/>
			);
		}

		return null;
	};

	return (
		<Stack className={classes.root}>
			<Text className={classes.overline}>Trigger</Text>
			{Object.values(currentNode.condition).map((condition, index) => (
				<Group key={index} spacing={4}>
					{renderConditionComponent(condition)}
				</Group>
			))}
		</Stack>
	);
};

export default TriggerNode;

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
