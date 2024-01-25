/**
 * @module transformer
 * The module is responsible for transforming the data from the database to the client
 * Client data is of the type 'Variation'
 */

import { fabric } from 'fabric';
import { generateId } from '../../utils';
import { Creative, Variant } from './types';

const getSizes = (cards: any): string[] => {
	const sizes = Object.keys(cards.map((card: any) => card.options[0].overrides)[0]);
	return sizes;
};

const getElementType = (option: any): fabric.Object['type'] => {
	const isText = option.isText;
	const isImage = option.elementType === 'image' && !option.subType;
	const isShape = option.elementType === 'image' && option.subType === 'svg';

	if (isText) return 'text';
	if (isImage) return 'image';
	if (isShape) return 'path';
};

const getPositionFromModifyLength = (modifyLength: any, sizeKey: string): { top: number; left: number } => {
	const [width, height] = sizeKey.split('x');

	// Since modify length is in percentage, we need to convert it to pixels
	const top = Math.round((Math.round(modifyLength.headingTop) * parseInt(height, 10)) / 100);
	const left = Math.round((Math.round(modifyLength.headingLeft) * parseInt(width, 10)) / 100);
	return { top, left };
};

const getDimensionsFromModifyLength = (modifyLength: any, sizeKey: string): { width: number; height: number } => {
	const [boardWidth, boardHeight] = sizeKey.split('x');

	// Modify length is in % we need to convert it to pixels
	const top = Math.round((Math.round(modifyLength.headingTop) * parseInt(boardHeight, 10)) / 100);
	const left = Math.round((Math.round(modifyLength.headingLeft) * parseInt(boardWidth, 10)) / 100);
	const bottom = Math.round((Math.round(modifyLength.headingBottom) * parseInt(boardHeight, 10)) / 100);
	const right = Math.round((Math.round(modifyLength.headingRight) * parseInt(boardWidth, 10)) / 100);

	// Calculate the width and height
	const width = parseInt(boardWidth, 10) - (left + right);
	const height = parseInt(boardHeight, 10) - (top + bottom);

	return { width, height };
};

const getElementPadding = (padding: any): number => {
	const { all, top, right, bottom, left } = padding;
	// If top,right,bottom,left, and all are equal, then return the value of all
	if (all === top && all === right && all === bottom && all === left) return Math.round(all);
	// If all is not equal to top,right,bottom,left, then return 0
	console.warn('Unequal padding is not supported in Editor v2, setting padding to 0');
	return 0;
};

const getElementAngle = (modifyLength: any): number => {
	const { rotateAngle } = modifyLength;

	if (!rotateAngle) return 0;

	return rotateAngle;
};

const getBackgroundColor = (option: any, sizeKey: string): string => {
	// If option.overrides[sizeKey].backgroundColor is not present, then try for option.styles.backgroundColor, else return white
	const overrideBackgroundColor = option.overrides[sizeKey].backgroundColor;

	if (overrideBackgroundColor.type === 'solid-color') {
		return overrideBackgroundColor.color;
	}

	const styleBackgroundColor = option.styles.backgroundColor;

	if (styleBackgroundColor) {
		return styleBackgroundColor;
	}

	return '#fff';
};

const getFabricText = (option: any, sizeKey: string): fabric.Text => {
	const overrides = option.overrides[sizeKey];
	const { top, left } = getPositionFromModifyLength(overrides.modifyLength, sizeKey);
	const { width, height } = getDimensionsFromModifyLength(overrides.modifyLength, sizeKey);
	const angle = getElementAngle(overrides.modifyLength);
	const padding = getElementPadding(overrides.padding);
	const text = option.text;
	const data = {
		id: option.id,
		charCount: option.charCount,
		ignoreSnapping: false,
	};
	const fontFamily = option.overrides[sizeKey].font;
	const fill = option.styles.textColor;
	const textAlign = option.styles.textAlignment;
	const fontSize = option.customFontSize;
	const lineHeight = Number(option.styles.lineSpacing);

	const backgroundColor = getBackgroundColor(option, sizeKey);

	const properties = {
		top,
		left,
		padding,
		data,
		fontFamily,
		fill,
		textAlign,
		fontSize,
		angle,
		lineHeight,
		// boxBorderColor: '#ff00ff',
		// boxBorderWidth: 1,
		// boxBorderStyle: 'dotted',
		backgroundColor,
	};
	const textElement = new fabric.Textbox(text, properties);
	textElement.set({
		width,
		height,
	});
	return textElement;
};

const getElementFromOptions = (options: any, sizeKey: string): fabric.Object[] => {
	console.log('Total elements', options.length);
	const elements = options.map((option: any) => {
		const type = getElementType(option);
		if (type === 'text') {
			return getFabricText(option, sizeKey);
		}
	});

	return elements;
};

const transformCards = (cards: any): Creative[] => {
	const sizes = getSizes(cards);
	const creatives = sizes.map((size: string) => {
		const [width, height] = size.split('x');

		return {
			id: generateId(),
			width: parseInt(width, 10),
			height: parseInt(height, 10),
			displayNames: [size],
			elements: getElementFromOptions(cards[0].options, size),
			rulers: [],
		};
	});
	return creatives;
};

const transformVariation = (capsuleData: any): Variant => {
	const { version } = capsuleData;

	return {
		_id: capsuleData._id.$oid,
		createdAt: capsuleData.createdAt.$date,
		updatedAt: capsuleData.updatedAt.$date,
		createdBy: capsuleData.authorId,
		updatedBy: capsuleData.lastModifiedId,
		creatives: transformCards(capsuleData.cards),
		isDeleted: capsuleData.isDeleted,
		thumbnail: capsuleData.image,
		metadata: capsuleData.metadata,
		shortid: capsuleData.shortId,
		status: version === 1 ? 'draft' : 'published',
	};
};

export default transformVariation;
