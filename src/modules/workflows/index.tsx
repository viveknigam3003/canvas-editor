import { ActionIcon, Box, Flex, Group, Stack, Text, TextInput, Tooltip, createStyles } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconArrowLeft, IconPlayerPlay, IconPuzzle, IconSquareRoundedPlusFilled } from '@tabler/icons-react';
import { useEffect } from 'react';
import { executor, getSavedWorkflow, saveWorkflow, updateWorkflow } from './engine';
import ActionNode from './nodes/ActionNode';
import ConditionNode from './nodes/ConditionNode';
import { Conditional, PLUGIN_TYPES, When, Workflow } from './types';
import { generateId } from '../../utils';

interface WorkflowComponentProps {
	canvas: fabric.Canvas | null;
	currentSelectedElements: fabric.Object[] | null;
}

// const workflows: Workflow[] = [
// 	{
// 		name: 'Flash change color',
// 		id: '91',
// 		nodes: [
// 			{
// 				id: '1',
// 				name: 'Step 1',
// 				condition: {
// 					when: When.ACTIVE_ELEMENT,
// 					conditional: Conditional.CONTAIN,
// 					targets: ['image', 'textbox', 'path'],
// 				},
// 				actions: [
// 					{
// 						id: '2',
// 						type: 'action',
// 						name: 'Step 1',
// 						fn: {
// 							type: PLUGIN_TYPES.SET_FABRIC,
// 							payload: {
// 								property: 'fill',
// 								value: '#ff1c1cff',
// 							},
// 						},
// 					},
// 					{
// 						id: '3',
// 						type: 'plugin',
// 						name: 'Step 2',
// 						fn: {
// 							type: PLUGIN_TYPES.COLOR_PLUGIN,
// 							payload: {
// 								property: '',
// 								value: '',
// 							},
// 						},
// 					},
// 				],
// 			},
// 		],
// 	},
// ];

// React Component
const WorkflowComponent: React.FC<WorkflowComponentProps> = ({ canvas, currentSelectedElements }) => {
	const { classes } = useStyles();
	const workflows = getSavedWorkflow();
	const currentSelectedFlow = useForm<Workflow | null>({
		initialValues: {
			name: '',
			id: '',
			nodes: [],
		},
	});

	useEffect(() => {
		console.log('Form', currentSelectedFlow.values);
	}, [currentSelectedFlow.values]);

	const handleButtonClick = async (id: string) => {
		const workflow = workflows.find(workflow => workflow.id === id);
		console.log('workflow on click', workflow);
		await executor(workflow as any, currentSelectedElements as fabric.Object[], canvas as fabric.Canvas, () => {
			// console.log('e', e);
		});
	};

	const handleTest = async () => {
		if (!currentSelectedFlow.values) return;
		await executor(
			currentSelectedFlow.values as Workflow,
			currentSelectedElements as fabric.Object[],
			canvas as fabric.Canvas,
			e => {
				console.log('e', e);
			},
		);
	};

	const createNewWorkflow = () => {
		const newWorkflow: Workflow = {
			name: 'New workflow',
			id: generateId(),
			nodes: [
				{
					id: generateId(),
					name: 'When',
					condition: {
						when: When.ACTIVE_ELEMENT,
						conditional: Conditional.IS,
						targets: ['textbox'],
					},
					actions: [],
				},
			],
		};
		currentSelectedFlow.setValues(newWorkflow);
		saveWorkflow(newWorkflow);
	};

	const addNewAction = (nodeIndex: number) => {
		const newAction = {
			id: generateId(),
			type: 'action',
			name: 'New action',
			fn: {
				type: PLUGIN_TYPES.SET_FABRIC,
				payload: {
					property: 'fill',
					value: '#ff1c1cff',
				},
			},
		};
		// Get the current workflow nodes
		const currentNodes = currentSelectedFlow.values?.nodes;

		if (!currentNodes) return;
		// Add the new action to the current nodeIndex
		currentNodes[nodeIndex].actions.push(newAction);
		// Set the new nodes
		currentSelectedFlow.setFieldValue('nodes', currentNodes);
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
							<ActionIcon color={'violet'} variant="subtle" onClick={() => createNewWorkflow()}>
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
					<Flex>
						<Stack spacing={8}>
							<Group spacing={4}>
								<ActionIcon
									onClick={() => {
										currentSelectedFlow.reset();
										updateWorkflow(currentSelectedFlow.values as Workflow);
									}}
								>
									<IconArrowLeft size={16} className={classes.gray} />
								</ActionIcon>
								<Text className={classes.title}>Edit workflow</Text>
							</Group>
							<Text className={classes.subtext}>
								Customize the actions in this workflow using the editor below.
							</Text>
						</Stack>
						<Tooltip label="Test workflow">
							<ActionIcon
								color="violet"
								variant="filled"
								size={'sm'}
								onClick={e => {
									e.stopPropagation();
									handleTest();
								}}
							>
								<IconPlayerPlay size={12} />
							</ActionIcon>
						</Tooltip>
					</Flex>
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
											<ConditionNode nodeIndex={nodeIndex} workflow={currentSelectedFlow} />
											{node.actions.map((action, actionIndex) => (
												<ActionNode
													action={action}
													actionIndex={actionIndex}
													nodeIndex={nodeIndex}
													workflow={currentSelectedFlow}
												/>
											))}
											<ActionIcon
												color={'violet'}
												variant="subtle"
												onClick={() => addNewAction(nodeIndex)}
											>
												<IconSquareRoundedPlusFilled size={36} />
											</ActionIcon>
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
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
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
