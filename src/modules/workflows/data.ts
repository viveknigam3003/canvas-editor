import { Conditional, Target, When } from './types';

const getFunctionFromName = (name: string) => {
	switch (name) {
		case 'set':
			return (
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

				canvas.renderAll();
			};
		default:
			return null;
	}
};

const workflow = {
	nodes: [
		{
			id: '1',
			type: 'SET/OTHER function',
			label: 'When workflow is triggered',
			condition: {
				when: When.WORKFLOW_TRIGGERED,
				conditional: Conditional.IS,
				target: Target.IMAGE,
			},
			actions: [
				{
					id: '2',
					type: 'action',
					fn: {
						type: 'set',
						payload: {
							property: 'opacity',
							value: 0.5,
						},
					},
				},
			],
		},
	],
};

const wf = {
	name: 'test',
	owner: 'test',
	nodes: [
		{
			id: '1',
			type: 'trigger',
			condition: {
				when: When.WORKFLOW_TRIGGERED,
				conditional: Conditional.IS,
				target: Target.IMAGE,
			},
		},
		{
			id: '2',
			type: 'action',
			action: {
				type: 'set',
				payload: {
					property: 'opacity',
					value: 0.5,
				},
			},
		},
		{
			id: '3',
			type: 'action',
			action: {
				type: 'set',
				payload: {
					property: 'opacity',
					value: 0.5,
				},
			},
		},
		{
			id: '4',
			type: 'action',
			action: {
				type: 'set',
				payload: {
					property: 'opacity',
					value: 0.5,
				},
			},
		},
	],
};

const executor = () => {
	workflow.nodes.forEach(node => {
		// nest items
		// false // executor(item)
		// check condition
		// break
		// action[adas]()
	});
};
