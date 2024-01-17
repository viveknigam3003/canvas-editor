import { Condition, Conditional, IActionNode, INode, ITriggerNode, IWorkflow, When } from './types';

export default class WorkflowEngine {
	private workflow: IWorkflow;
	private selectedElements: fabric.Object[] | null;
	private canvas: fabric.Canvas | null;

	constructor(workflow: IWorkflow, selectedElements: fabric.Object[] | null, canvas: fabric.Canvas | null) {
		this.workflow = workflow;
		this.selectedElements = selectedElements;
		this.canvas = canvas;
	}

	async execute() {
		for (const node of this.workflow.nodes) {
			if (node.type === 'trigger') {
				await this.executeTriggerNode(node as ITriggerNode);
			}
		}
	}

	private evaluateTriggerCondition(condition: Condition): boolean {
		const selectedElement = this.selectedElements?.[0];

		switch (condition.when) {
			case When.WORKFLOW_TRIGGERED:
				return true; // Always true as the workflow is triggered
			case When.SELECTED_ELEMENT:
				// Only one element can be selected at a time
				if (!selectedElement) return false;
				switch (condition.conditional) {
					case Conditional.IS:
						return selectedElement.type === condition.target;
					case Conditional.CONTAIN:
						// Implement logic for 'contains' conditional
						// ...
						break;
				}
				break;
			case When.MULTIPLE_SELECTED_ELEMENTS:
				// Implement logic for 'selected_elements' conditional
				// ...
				break;
		}

		return false;
	}

	private async executeTriggerNode(node: ITriggerNode) {
		if (this.evaluateTriggerCondition(node.condition)) {
			await this.executeSequentialNodes(node.next);
		}
	}

	private async executeSequentialNodes(nodeIds: string[] | undefined) {
		if (!nodeIds) return;

		for (const nodeId of nodeIds) {
			const node = this.findNodeById(nodeId);
			if (node) {
				if (node.type === 'action') {
					(node as IActionNode).execute();
					// Wait for 500ms before executing the next node
					await new Promise(resolve => setTimeout(resolve, 200));
					await this.executeSequentialNodes(node.next);
				}
			}
		}
	}

	private findNodeById(id: string): INode | undefined {
		return this.workflow.nodes.find(node => node.id === id);
	}
}
