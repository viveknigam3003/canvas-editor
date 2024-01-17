import { Conditional, When } from './types';

const getSavedWorkflow = () => {
	return JSON.parse(localStorage.getItem('workflows') || '{}');
};

export type Workflow = {
	id: string;
	label: string;
	condition: {
		when: When;
		conditional: Conditional;
		targets: string[];
	};
	actions: {
		id: string;
		type: string;
		fn: {
			type: string;
			payload: {
				property: string;
				value: any;
			};
		};
	}[];
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
	executeWorkflow: (
		currentSelectedElements: fabric.Object[],
		args: { workflow: { id: string } },
		canvas: fabric.Canvas,
	) => {
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

export function executor(
	workflow1: { nodes: Workflow[] },
	currentSelectedElements: fabric.Object[],
	canvas: fabric.Canvas,
) {
	for (let index = 0; index < workflow1.nodes.length; index++) {
		const node = workflow1.nodes[index];
		if (node.condition.when === When.ACTIVE_ELEMENT) {
			executeFn(node, currentSelectedElements, canvas);
			canvas.requestRenderAll();
		} else if (node.condition.when === When.SELECTED_ELEMENT) {
			if (
				node.condition.conditional === Conditional.IS &&
				currentSelectedElements.find(x => x.data.type === node.condition.targets?.[0])
			) {
				const element = currentSelectedElements.find(
					x => x.type === node.condition.targets?.[0],
				) as fabric.Object;
				executeFn(node, [element], canvas);
			} else if (
				node.condition.conditional === Conditional.CONTAIN &&
				currentSelectedElements.filter(x => node.condition.targets?.includes(x.type)).length > 0
			) {
				console.log(
					'contains',
					currentSelectedElements.filter(x => node.condition.targets?.includes(x.type)),
				);
				currentSelectedElements
					.filter(x => node.condition.targets?.includes(x.type))
					.forEach(element => {
						executeFn(node, [element], canvas);
					});
			} else {
				break;
			}
			canvas.requestRenderAll();
		}
	}
}

function executeFn(node: any, currentSelectedElements: fabric.Object[], canvas: fabric.Canvas) {
	node.actions.forEach((action: any) => {
		const fn = getFunctionFromName(action.fn.type);
		if (fn) {
			fn(currentSelectedElements, action.fn.payload, canvas);
		}
	});
}
