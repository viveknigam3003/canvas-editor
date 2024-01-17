import {
	ActionIcon,
	Box,
	Flex,
	Group,
	MultiSelect,
	Select,
	Stack,
	Text,
	TextInput,
	Tooltip,
	createStyles,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconArrowLeft, IconPlayerPlay, IconPuzzle, IconSquareRoundedPlusFilled } from '@tabler/icons-react';
import { Workflow, executor, getSavedWorkflow } from './engine';
import { Conditional, When } from './types';
import { useEffect } from 'react';

interface WorkflowComponentProps {
	canvas: fabric.Canvas | null;
	currentSelectedElements: fabric.Object[] | null;
}

const workflows: Workflow[] = [
	{
		name: 'Workflow2',
		id: '91',
		nodes: [
			{
				id: '1',
				name: 'Step 1',
				condition: {
					when: When.SELECTED_ELEMENT,
					conditional: Conditional.CONTAIN,
					targets: ['image', 'textbox'],
				},
				actions: [
					{
						id: '2',
						type: 'action',
						name: 'Step 1',
						fn: {
							type: 'set',
							payload: {
								property: 'fill',
								value: 'red',
							},
						},
					},
					{
						id: '3',
						type: 'plugin',
						name: 'Step 2',
						fn: {
							type: 'plugin-color',
							payload: {
								property: 'fill',
								value: 'green',
							},
						},
					},
				],
			},
		],
	},
];

// React Component
const WorkflowComponent: React.FC<WorkflowComponentProps> = ({ canvas, currentSelectedElements }) => {
	const { classes } = useStyles();
	const currentSelectedFlow = useForm<Workflow | null>({
		initialValues: {
			name: '',
			id: '',
			nodes: [],
		},
	});

	const handleButtonClick = async (id: string) => {
		const workflow = workflows.find(workflow => workflow.id === id);
		await executor(workflow as any, currentSelectedElements as fabric.Object[], canvas as fabric.Canvas);
	};

	useEffect(() => {
		console.log(currentSelectedFlow.values);
	}, [currentSelectedFlow]);

	const getSelectDataFromActionType = (type: string) => {
		switch (type) {
			case 'action':
				return [{ value: 'set', label: 'Set property' }];
			case 'plugin':
				return [{ value: 'plugin-color', label: 'Set random color' }];
			case 'workflow': {
				const allWorkflows = getSavedWorkflow();
				return allWorkflows.map((workflow: Workflow) => ({ value: workflow.id, label: workflow.name }));
			}
		}
	};

	return (
		<Box>
			{!currentSelectedFlow.values?.id ? (
				<>
					<Flex>
						<Stack spacing={8}>
							<Group spacing={4}>
								<IconPuzzle size={16} className={classes.gray} />
								<Text className={classes.title}>Workflows</Text>
							</Group>
							<Text className={classes.subtext}>
								Streamline your creative process with one-click automated design sequences.
							</Text>
						</Stack>
						<Tooltip label="New workflow">
							<ActionIcon color={'violet'} variant="subtle">
								<IconSquareRoundedPlusFilled size={24} />
							</ActionIcon>
						</Tooltip>
					</Flex>
					<Stack mt={24} mb={16} spacing={8}>
						{workflows.map(workflow => (
							<Group
								key={workflow.id}
								className={classes.flowBox}
								onClick={() => {
									currentSelectedFlow.setValues(workflow);
								}}
							>
								<ActionIcon
									color="violet"
									variant="filled"
									size={'sm'}
									onClick={e => {
										e.stopPropagation();
										handleButtonClick(workflow.id);
									}}
								>
									<IconPlayerPlay size={12} />
								</ActionIcon>
								<Text className={classes.workflowText}>{workflow.name}</Text>
							</Group>
						))}
					</Stack>
				</>
			) : (
				<Stack>
					<Stack spacing={8}>
						<Group spacing={4}>
							<ActionIcon onClick={() => currentSelectedFlow.reset()}>
								<IconArrowLeft size={16} className={classes.gray} />
							</ActionIcon>
							<Text className={classes.title}>Edit workflow</Text>
						</Group>
						<Text className={classes.subtext}>
							Customize the actions in this workflow using the editor below.
						</Text>
					</Stack>
					<Stack>
						<TextInput
							label="Workflow name"
							placeholder="Eg. Center element, Create CTA"
							{...currentSelectedFlow.getInputProps('name')}
						/>
						<Box>
							<Text className={classes.subtext}>
								Nodes are the individual steps in your workflow. Each node can have multiple actions.
							</Text>
							<Stack aria-label="workflow editor" className={classes.editorContainer}>
								{currentSelectedFlow &&
									currentSelectedFlow.values.nodes.map((node, nodeIndex) => (
										<>
											<Select
												data={[
													{ value: When.ACTIVE_ELEMENT, label: 'Active element' },
													{ value: When.SELECTED_ELEMENT, label: 'Selected element' },
												]}
												{...currentSelectedFlow.getInputProps(
													`nodes.${nodeIndex}.condition.when`,
												)}
											/>
											<Select
												data={[
													{ value: Conditional.IS, label: 'is equal to' },
													{ value: Conditional.CONTAIN, label: 'contains' },
												]}
												{...currentSelectedFlow.getInputProps(
													`nodes.${nodeIndex}.condition.conditional`,
												)}
											/>
											<MultiSelect
												data={[
													{ value: 'image', label: 'Image' },
													{ value: 'textbox', label: 'Text' },
													{ value: 'path', label: 'Shape' },
												]}
												{...currentSelectedFlow.getInputProps(
													`nodes.${nodeIndex}.condition.targets`,
												)}
											/>
											{node.actions.map((action, actionIndex) => (
												<Group className={classes.node} key={action.id}>
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
														{...currentSelectedFlow.getInputProps(
															`nodes.${nodeIndex}.actions.${actionIndex}.type`,
														)}
														onChange={e => {
															currentSelectedFlow.setFieldValue(
																`nodes.${nodeIndex}.actions.${actionIndex}.fn.type`,
																'',
															);
															currentSelectedFlow
																.getInputProps(
																	`nodes.${nodeIndex}.actions.${actionIndex}.type`,
																)
																.onChange(e);
														}}
													/>
													<Select
														variant="unstyled"
														style={{
															borderBottom: '1px solid #ccc',
														}}
														w={200}
														data={getSelectDataFromActionType(action.type)}
														{...currentSelectedFlow.getInputProps(
															`nodes.${nodeIndex}.actions.${actionIndex}.fn.type`,
														)}
													/>
												</Group>
											))}
										</>
									))}
							</Stack>
						</Box>
					</Stack>
				</Stack>
			)}
		</Box>
	);
};

export default WorkflowComponent;

const useStyles = createStyles(theme => ({
	gray: {
		color: theme.colorScheme === 'dark' ? theme.colors.gray[4] : theme.colors.gray[8],
	},
	title: {
		fontSize: 16,
		fontWeight: 600,
		color: theme.colorScheme === 'dark' ? theme.colors.gray[4] : theme.colors.gray[8],
	},
	subtext: {
		fontSize: 12,
		color: theme.colorScheme === 'dark' ? theme.colors.gray[4] : theme.colors.gray[6],
	},
	flowBox: {
		padding: 8,
		borderRadius: 4,
		border: `1px solid ${theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[2]}`,
		backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
		color: theme.colorScheme === 'dark' ? theme.colors.gray[4] : theme.colors.gray[8],
		fontSize: 14,
		transition: 'all 0.2s ease',
		'&:hover': {
			cursor: 'pointer',
			border: `1px solid ${theme.colorScheme === 'dark' ? theme.colors.violet[4] : theme.colors.violet[6]}`,
			backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.violet[0],
		},
	},
	workflowText: {
		fontSize: 14,
		color: theme.colorScheme === 'dark' ? theme.colors.gray[4] : theme.colors.gray[8],
	},
	editorContainer: {
		marginTop: '16px',
		height: '58vh',
		// background:
		// 	theme.colorScheme === 'dark'
		// 		? `linear-gradient(90deg, ${theme.colors.dark[8]} 9px, transparent 1%) center, linear-gradient(${theme.colors.dark[8]} 9px, transparent 1%) center, ${theme.colors.dark[4]}`
		// 		: `linear-gradient(90deg, white 9px, transparent 1%) center, linear-gradient(white 9px, transparent 1%) center, #cbc9c9`,
		// backgroundSize: `10px 10px`,
	},
	node: {
		padding: 8,
		margin: 8,
		borderRadius: 4,
		boxShadow: theme.shadows.md,
		border: `1px solid ${theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]}}`,
	},
}));
