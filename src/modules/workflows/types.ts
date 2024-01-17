export interface INode {
	id: string;
	type: 'trigger' | 'action' | 'workflow';
	label: string;
}

export interface IActionNode extends INode {
	execute: (currentSelectedElements?: fabric.Object[], canvas?: fabric.Canvas) => void | (() => void);
}

export interface IWorkflow {
	nodes: Array<IActionNode | ITriggerNode>;
	// Additional properties like workflow name, description, etc.
}

export type ConditionComponent = 'when' | 'conditional' | 'target';

export type Condition = Record<ConditionComponent, When | Conditional | Target | null>;

export interface ITriggerNode extends INode {
	condition: Condition;
}

export enum Target {
	IMAGE = 'Image',
	TEXTBOX = 'Text',
}

export enum Conditional {
	IS = 'Is',
	CONTAIN = 'Contain',
}

export enum When {
	ACTIVE_ELEMENT = 'Active element',
	SELECTED_ELEMENT = 'Selected element',
}

export enum Property {
	width = 'Width',
	height = 'Height',
	opacity = 'Opacity',
	x = 'X',
	y = 'Y',
}

export const setProperty = (element: fabric.Object, property: Property, value: any) => {
	element.set({
		[property]: value,
	});
};

export const actionFunctionMap = {
	setProperty,
};
