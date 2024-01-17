import { ActionIcon, Box, Flex, Group, Stack, Text, TextInput, Tooltip, createStyles } from '@mantine/core';
import { IconPuzzle, IconSquareRoundedPlusFilled } from '@tabler/icons-react';
import { useState } from 'react';
import { executor } from './engine';
import { Conditional, When } from './types';

interface WorkflowComponentProps {
	canvas: fabric.Canvas | null;
	currentSelectedElements: fabric.Object[] | null;
}

const workflow = {
	name: 'Workflow2',
	id: '91',
	nodes: [
		{
			id: '1',
			label: 'Step 1',
			condition: {
				when: When.SELECTED_ELEMENT,
				conditional: Conditional.CONTAIN,
				targets: ['image', 'textbox'],
			},
			actions: [
				{
					id: '2',
					type: 'action',
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
					type: 'action',
					fn: {
						type: 'plugin-color',
						// payload: {
						// 	property: 'fill',
						// 	value: 'green',
						// },
					},
				},
			],
		},
	],
};

// React Component
const WorkflowComponent: React.FC<WorkflowComponentProps> = ({ canvas, currentSelectedElements }) => {
	const { classes } = useStyles();
	const [currentSelectedFlow, setCurrentSelectedFlow] = useState<Workflow | null>(workflows[0]);

	const handleButtonClick = async () => {
		executor(workflow as any, currentSelectedElements as fabric.Object[], canvas as fabric.Canvas);
	};

	return (
		<Box>
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
					<Group key={workflow.id} className={classes.flowBox}>
						<ActionIcon color="violet" variant="filled" size={'sm'}>
							<IconPlayerPlay size={12} />
						</ActionIcon>
						<Text className={classes.workflowText}>{workflow.name}</Text>
					</Group>
				))}
			</Stack>
			{/* <Stack>
				<Stack spacing={8}>
					<Group spacing={4}>
						<IconPuzzle size={16} className={classes.gray} />
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
						value={'Workflow 1'}
						onChange={() => {}}
					/>
					<Box>
						<Text className={classes.subtext}>
							Nodes are the individual steps in your workflow. Each node can have multiple actions.
						</Text>
						<Box aria-label="workflow editor" className={classes.editorContainer}>
							{currentSelectedFlow && (
								<Box>
									{currentSelectedFlow.nodes.map(node => (
										<Box>
											{node.action.map(action => (
												<Box className={classes.node}>{action}</Box>
											))}
										</Box>
									))}
								</Box>
							)}
						</Box>
					</Box>
				</Stack>
			</Stack> */}
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
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'flex-start',
		margin: '16px 0',
		height: '55vh',
		borderBottom: '1px solid #F0F0F0',
		background: `linear-gradient(90deg, white 9px, transparent 1%) center, linear-gradient(white 9px, transparent 1%) center, #A799CC`,
		backgroundSize: `10px 10px`,
	},
	node: {
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
		border: '1px solid #F0F0F0',
		borderRadius: 4,
		padding: 8,
		margin: 8,
	},
}));
