import { getSavedWorkflow } from './engine';
import { Conditional, PLUGIN_TYPES, Target, When, Workflow } from './types';

export const getDataFromEnum = (enumObject: any) => {
	const keys = Object.keys(enumObject);
	const values = Object.values(enumObject);

	return keys.map((key, index) => ({
		value: key,
		label: values[index] as string,
	}));
};

export const getEnumValues = (enumObject: any) => {
	return Object.keys(enumObject).map(key => enumObject[key as keyof typeof enumObject]) as string[];
};

export const getKeyFromEnum = (enumObject: any, value: string) => {
	return Object.keys(enumObject).find(key => enumObject[key as keyof typeof enumObject] === value) as string;
};

export const enumObjectFromString = (key: string) => {
	switch (key) {
		case 'when':
			return When;
		case 'conditional':
			return Conditional;
		case 'target':
			return Target;
		default:
			return null;
	}
};

export const getSelectDataFromActionType = (type: string) => {
	switch (type) {
		case 'action':
			return [{ value: PLUGIN_TYPES.SET_FABRIC, label: 'Set property' }];
		case 'plugin':
			return [{ value: PLUGIN_TYPES.AI_COPY_REFRESH, label: 'AI copy refresh' }];
		case 'workflow': {
			const allWorkflows = getSavedWorkflow();
			return allWorkflows.map((workflow: Workflow) => ({ value: workflow.id, label: workflow.name }));
		}
	}
};
