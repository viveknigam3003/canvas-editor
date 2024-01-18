export type ConditionComponent = 'when' | 'conditional' | 'target';

export type Condition = Record<ConditionComponent, When | Conditional | Target | null>;

export enum Target {
	IMAGE = 'Image',
	TEXTBOX = 'Text',
}

export enum Conditional {
	IS = 'Is',
	CONTAIN = 'Contain',
}

export enum When {
	ACTIVE_ELEMENT = 'Workflow Triggered',
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
			id?: string;
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

export enum PLUGIN_TYPES {
	SET_FABRIC = 'SET_FABRIC',
	WORKFLOW = 'WORKFLOW',
	COLOR_PLUGIN = 'COLOR_PLUGIN',
	AI_COPY_REFRESH = 'AI_COPY_REFRESH',
	GLOW_PLUGIN = 'GLOW_PLUGIN',
}
