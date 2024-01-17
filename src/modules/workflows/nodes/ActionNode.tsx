import { ColorInput, Group, NumberInput, Select, createStyles } from '@mantine/core';
import React from 'react';

import { UseFormReturnType } from '@mantine/form';
import { getSelectDataFromActionType } from '../helpers';
import { NodeAction, PLUGIN_TYPES, Workflow } from '../types';

interface ActionNodeProps {
	workflow: UseFormReturnType<Workflow | null, (values: Workflow | null) => Workflow | null>;
	nodeIndex: number;
	action: NodeAction;
	actionIndex: number;
}

const ActionNode: React.FC<ActionNodeProps> = ({ actionIndex, action, workflow, nodeIndex }) => {
	const { classes } = useStyles();
	const [currentActionType, setCurrentActionType] = React.useState(action.type);
	const [currentProperty, setCurrentProperty] = React.useState(action.fn.payload.property);
	const [currentAction, setCurrentAction] = React.useState(action.type);

	React.useEffect(() => {
		console.log('action.type', action.type);
		setCurrentActionType(action.type);
	}, [action.type]);

	React.useEffect(() => {
		console.log('action.fn.payload.property', action.fn.payload.property);
		setCurrentProperty(action.fn.payload.property);
	}, [action.fn.payload.property]);

	const renderActionInput = (actionType: string) => {
		switch (actionType) {
			case 'width':
			case 'height':
			case 'left':
			case 'top': {
				let value = workflow.getInputProps(`nodes.${nodeIndex}.actions.${actionIndex}.fn.payload.value`).value;

				if (typeof value === 'string') {
					value = 0;
				}

				return (
					<NumberInput
						min={-1000}
						max={1000}
						precision={0}
						step={1}
						{...workflow.getInputProps(`nodes.${nodeIndex}.actions.${actionIndex}.fn.payload.value`)}
						value={value}
						onChange={e => {
							workflow
								.getInputProps(`nodes.${nodeIndex}.actions.${actionIndex}.fn.payload.value`)
								.onChange(e);
						}}
					/>
				);
			}

			case 'angle':
				return (
					<NumberInput
						min={0}
						max={360}
						precision={0}
						step={1}
						{...workflow.getInputProps(`nodes.${nodeIndex}.actions.${actionIndex}.fn.payload.value`)}
						value={
							workflow.getInputProps(`nodes.${nodeIndex}.actions.${actionIndex}.fn.payload.value`).value
						}
						onChange={e => {
							workflow
								.getInputProps(`nodes.${nodeIndex}.actions.${actionIndex}.fn.payload.value`)
								.onChange(e);
						}}
					/>
				);
			case 'fill':
				return (
					<ColorInput
						withPicker
						format="hexa"
						{...workflow.getInputProps(`nodes.${nodeIndex}.actions.${actionIndex}.fn.payload.value`)}
					/>
				);
			default:
				return null;
		}
	};

	const renderAction = (actionType: string) => {
		console.log('actionType', actionType);
		switch (actionType) {
			case 'action':
				// TODO: Add action type, for now only using single as we only have 1 action type
				return (
					<Group>
						<Select
							data={[
								{ value: 'width', label: 'Width' },
								{ value: 'height', label: 'Height' },
								{ value: 'left', label: 'X' },
								{ value: 'top', label: 'Y' },
								{ value: 'fill', label: 'Color' },
								{ value: 'angle', label: 'Angle' },
							]}
							{...workflow.getInputProps(`nodes.${nodeIndex}.actions.${actionIndex}.fn.payload.property`)}
							onChange={e => {
								workflow
									.getInputProps(`nodes.${nodeIndex}.actions.${actionIndex}.fn.payload.property`)
									.onChange(e);
								setCurrentProperty(e as string);
							}}
						/>
						{renderActionInput(currentProperty)}
					</Group>
				);
			default:
				return null;
		}
	};

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
					setCurrentActionType(e as string);
					// setCurrentAction('');
					setCurrentProperty('');
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
				onChange={e => {
					workflow.getInputProps(`nodes.${nodeIndex}.actions.${actionIndex}.fn.type`).onChange(e);
					// setCurrentActionType(e as string);
					console.log('Current Action', e);
				}}
			/>
			{renderAction(currentActionType)}
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
