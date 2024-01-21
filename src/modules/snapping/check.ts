import { Object as FabricObject, ActiveSelection, Gradient, Pattern, Text, Group, Canvas } from 'fabric';
import { util as utilOrgin, Group as NativeGroup } from 'fabric';
import { fabric } from 'fabric';
console.log('🚀 ~ ActiveSelection:', ActiveSelection);

const isActiveSelection = (thing: unknown): thing is fabric.ActiveSelection => {
	return thing instanceof fabric.ActiveSelection;
};

const isGroup = (thing?: unknown): thing is Group => {
	return thing instanceof Group;
};

const isCollection = (thing?: unknown): thing is Group | ActiveSelection | Canvas => {
	return !!thing && Array.isArray((thing as Group)._objects);
};

const isNativeGroup = (thing?: unknown): thing is NativeGroup => {
	return thing instanceof NativeGroup;
};

const isGradient = (thing: unknown): thing is Gradient<'linear' | 'radial'> => {
	return thing instanceof Gradient;
};

const isPattern = (thing: unknown): thing is Pattern => {
	return thing instanceof Pattern;
};

const isTextObject = (thing?: FabricObject): thing is Text => {
	// we could use instanceof but that would mean pulling in Text code for a simple check
	// @todo discuss what to do and how to do
	return !!thing && thing.isType('Text', 'IText', 'Textbox');
};

export const check = {
	isCollection,
	isGradient,
	isPattern,
	isActiveSelection,
	isTextObject,
	isGroup,
	isNativeGroup,
};
