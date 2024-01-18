import { Conditional, NodeAction, When, Workflow, Node, PLUGIN_TYPES } from './types';

const WORKFLOW_DELAY = 200;

export const getSavedWorkflow = (): Workflow[] => {
	return JSON.parse(localStorage.getItem('workflows') || '[]');
};

export const getWorkflowById = (id: string) => {
	const workflows = getSavedWorkflow();
	return workflows.find((workflow: Workflow) => workflow.id === id);
};

export const saveWorkflow = (workflow: Workflow) => {
	const workflows = getSavedWorkflow();
	workflows.push(workflow);
	localStorage.setItem('workflows', JSON.stringify(workflows));
};

export const updateWorkflow = (wf: Workflow) => {
	const workflows = getSavedWorkflow();
	const index = workflows.findIndex((workflow: Workflow) => workflow.id === wf.id);
	workflows[index] = wf;
	localStorage.setItem('workflows', JSON.stringify(workflows));
};

export const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// get random colors
const getRandomColor = () => {
	const letters = '0123456789ABCDEF';
	let color = '#';
	for (let i = 0; i < 3; i++) {
		color += letters[Math.floor(Math.random() * 16)];
	}
	return color;
};

const getAIText = () => {
	const randomIndex = Math.floor(Math.random() * 5);
	const texts = [
		'McNjoy Your Meal',
		'McFeast Calling',
		'Order Today',
		'Big Mac Attack!',
		'Parapapapa',
		"i'm lovin' it",
	];

	return texts[randomIndex];
};

export const plugins = {
	[PLUGIN_TYPES.SET_FABRIC]: (
		currentSelectedElements: fabric.Object[],
		args: { property: string; value: any },
		canvas: fabric.Canvas,
	) => {
		if (!currentSelectedElements || !canvas) return;
		canvas.discardActiveObject();
		for (const element of currentSelectedElements) {
			if (args.property === 'width') {
				element.scaleToWidth(args.value, true);
			} else if (args.property === 'height') {
				element.scaleToHeight(args.value, true);
			} else {
				element.set({
					[args.property]: args.value,
				});
			}
		}
		canvas.requestRenderAll();
	},
	workflow: (currentSelectedElements: fabric.Object[], args: { id: string }, canvas: fabric.Canvas) => {
		if (!currentSelectedElements || !canvas) return;
		const workflow = getSavedWorkflow().find((workflow: Workflow) => workflow.id === args.id);
		if (!workflow) return;
		executor(workflow, currentSelectedElements, canvas);
	},
	[PLUGIN_TYPES.COLOR_PLUGIN]: (currentSelectedElements: fabric.Object[], _args: any, canvas: fabric.Canvas) => {
		const fabricSetPlugin = plugins[PLUGIN_TYPES.SET_FABRIC];
		fabricSetPlugin(currentSelectedElements, { property: 'fill', value: getRandomColor() }, canvas);
		canvas.requestRenderAll();
	},
	[PLUGIN_TYPES.AI_COPY_REFRESH]: async (
		currentSelectedElements: fabric.Object[],
		args: any,
		canvas: fabric.Canvas,
		callback: (arg: NodeAction) => void = () => {},
	) => {
		// const fabricSetPlugin = plugins[PLUGIN_TYPES.SET_FABRIC];

		const text = currentSelectedElements[0] as fabric.Textbox;
		if (text && text.type === 'textbox') {
			try {
				const newText = getAIText();
				console.log('newtext', newText);
				text.set('text', newText); // Use the property name as the first argument
				canvas.requestRenderAll();
				await callback(args);
			} catch (error) {
				console.log(error);
			}
		}
	},
	[PLUGIN_TYPES.GLOW_PLUGIN]: async (
		currentSelectedElements: fabric.Object[],
		args: any,
		canvas: fabric.Canvas,
		callback: (arg: NodeAction) => void = () => {},
	) => {
		const fabricSetPlugin = plugins[PLUGIN_TYPES.SET_FABRIC];
		currentSelectedElements.forEach(async (element: fabric.Object) => {
			fabricSetPlugin([element], { property: 'shadow', value: '0 0 10 #ff4d00f5' }, canvas);
			fabricSetPlugin([element], { property: 'blur', value: '50' }, canvas);
			await callback(args);
		});
	},
};

export async function executor(
	workflow1: { nodes: Node[] },
	currentSelectedElements: fabric.Object[],
	canvas: fabric.Canvas,
	callback: (arg: NodeAction) => void = () => {},
) {
	for (let index = 0; index < workflow1.nodes.length; index++) {
		const node = workflow1.nodes[index];
		if (node.condition.when === When.ACTIVE_ELEMENT) {
			executeFn(node, currentSelectedElements, canvas, callback);
			canvas.requestRenderAll();
		} else if (node.condition.when === When.SELECTED_ELEMENT) {
			if (
				node.condition.conditional === Conditional.IS &&
				currentSelectedElements.find(x => x.type === node.condition.targets?.[0])
			) {
				const element = currentSelectedElements.find(
					x => x.type === node.condition.targets?.[0],
				) as fabric.Object;
				executeFn(node, [element], canvas, callback);
			} else if (
				node.condition.conditional === Conditional.CONTAIN &&
				currentSelectedElements.filter(x => node.condition.targets?.includes(x.type as string)).length > 0
			) {
				const elements = currentSelectedElements.filter(
					x => node.condition.targets?.includes(x.type as string),
				);
				for (let index = 0; index < elements.length; index++) {
					const element = elements[index];
					await executeFn(node, [element], canvas, callback);
				}
			} else {
				break;
			}
			canvas.requestRenderAll();
		}
	}
}

async function executeFn(
	node: Node,
	currentSelectedElements: fabric.Object[],
	canvas: fabric.Canvas,
	callback: (arg: NodeAction) => void,
) {
	const aa = node.actions;
	for (let index = 0; index < aa.length; index++) {
		const action = aa[index];
		const actionType = action.type;

		const fnType = actionType === 'workflow' ? 'workflow' : action.fn.type;
		const fnPayload = actionType === 'workflow' ? { id: action.fn.type } : action.fn.payload;
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		const fn = plugins[fnType] as any;
		if (fn) {
			fn(currentSelectedElements, fnPayload, canvas);
		}
		await wait(WORKFLOW_DELAY);
		callback(action);
	}
}
