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

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// get random colors
const getRandomColor = () => {
	const letters = '0123456789ABCDEF';
	let color = '#';
	for (let i = 0; i < 3; i++) {
		color += letters[Math.floor(Math.random() * 16)];
	}
	return color;
};

const plugins = {
	[PLUGIN_TYPES.SET_FABRIC]: (
		currentSelectedElements: fabric.Object[],
		args: { property: string; value: any },
		canvas: fabric.Canvas,
	) => {
		if (!currentSelectedElements || !canvas) return;
		for (const element of currentSelectedElements) {
			element.set({
				[args.property]: args.value,
			});
		}
		canvas.requestRenderAll();
	},
	[PLUGIN_TYPES.WORKFLOW]: (
		currentSelectedElements: fabric.Object[],
		args: { id: string },
		canvas: fabric.Canvas,
	) => {
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
};

export async function executor(
	workflow1: { nodes: Node[] },
	currentSelectedElements: fabric.Object[],
	canvas: fabric.Canvas,
	callback: (arg: NodeAction) => void = () => { },
) {
	for (let index = 0; index < workflow1.nodes.length; index++) {
		const node = workflow1.nodes[index];
		if (node.condition.when === When.ACTIVE_ELEMENT) {
			executeFn(node, currentSelectedElements, canvas, callback);
			canvas.requestRenderAll();
		} else if (node.condition.when === When.SELECTED_ELEMENT) {
			if (
				node.condition.conditional === Conditional.IS &&
				currentSelectedElements.find(x => x.data.type === node.condition.targets?.[0])
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
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		const fn = plugins[action.fn.type] as any;
		if (fn) {
			fn(currentSelectedElements, action.fn.payload, canvas);
		}
		await wait(WORKFLOW_DELAY);
		callback(action);
	}
}
