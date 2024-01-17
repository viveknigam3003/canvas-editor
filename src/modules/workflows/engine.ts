import { Conditional, When } from './types';

export const getSavedWorkflow = () => {
	return JSON.parse(localStorage.getItem('workflows') || '{}');
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

export const updateWorkflow = (workflow: Workflow) => {
	const workflows = getSavedWorkflow();
	const index = workflows.findIndex((workflow: Workflow) => workflow.id === id);
	workflows[index] = workflow;
	localStorage.setItem('workflows', JSON.stringify(workflows));
};

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export type Workflow = {
	id: string;
	name: string;
	nodes: Node[];
};

export type NodeAction = {
	id: string;
	type: string;
	name: string;
	fn: {
		type: string;
		payload: {
			property: string;
			value: any;
		};
	};
};
export type Node = {
	id: string;
	name: string;
	condition: {
		when: When;
		conditional: Conditional;
		targets: string[];
	};
	actions: NodeAction[];
};
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
	setFabric: (
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
	executeWorkflow: (currentSelectedElements: fabric.Object[], args: { id: string }, canvas: fabric.Canvas) => {
		if (!currentSelectedElements || !canvas) return;
		const workflow = getSavedWorkflow().find((workflow: Workflow) => workflow.id === args.id);
		executor(workflow, currentSelectedElements, canvas);
	},
	randomFill: (currentSelectedElements: fabric.Object[], _, canvas: fabric.Canvas) => {
		plugins.setFabric(currentSelectedElements, { property: 'fill', value: getRandomColor() }, canvas);
		canvas.renderAll();
	},
};

const getFunctionFromName = (name: string) => {
	switch (name) {
		case 'set':
			return plugins.setFabric;
		case 'workflow':
			return plugins.executeWorkflow;
		case 'plugin-color':
			return plugins.randomFill;
		default:
			return () => {};
	}
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
				console.log(
					'contains',
					currentSelectedElements.filter(x => node.condition.targets?.includes(x.type as string)),
				);
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
	node: any,
	currentSelectedElements: fabric.Object[],
	canvas: fabric.Canvas,
	callback: (arg: NodeAction) => void,
) {
	const aa = node.actions;
	for (let index = 0; index < aa.length; index++) {
		const action = aa[index];
		const fn = getFunctionFromName(action.fn.type);
		console.log('asd', action.fn.type);
		if (fn) {
			fn(currentSelectedElements, action.fn.payload, canvas);
		}
		await wait(3000);
		callback(action);
	}
}
