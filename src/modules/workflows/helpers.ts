import { Conditional, Target, When } from './types';

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
