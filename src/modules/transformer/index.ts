/**
 * @module transformer
 * The module is responsible for transforming the data from the database to the client
 * Client data is of the type 'Variation'
 */

import { fabric } from 'fabric';
import { generateId } from '../../utils';
import { Creative, Variant } from './types';
import { BoxProperties } from '../text/TextboxOverride';

const transformVariation = (capsuleData: any): { data: Variant; errors: Record<string, string[]> } => {
	const { version } = capsuleData;

	const getSizes = (cards: any): string[] => {
		const sizes = Object.keys(cards.map((card: any) => card.options[0].overrides)[0]);
		return sizes;
	};
	const errors: Record<string, string[]> = getSizes(capsuleData.cards).reduce(
		(acc: Record<string, string[]>, size: string) => {
			acc[size] = [];
			return acc;
		},
		{},
	);

	const getElementType = (option: any): fabric.Object['type'] => {
		const isText = option.isText;
		const isImage = option.elementType === 'image' && !option.subType;
		const isShape = option.elementType === 'image' && option.subType === 'svg';

		if (isText) return 'text';
		if (isImage) return 'image';
		if (isShape) return 'path';

		errors.general.push(`Unknown element type found ${option.elementType}, skipping the element ${option.id}`);
	};

	const getPositionFromModifyLength = (option: any, sizeKey: string): { top: number; left: number } => {
		const overrides = option.overrides[sizeKey];
		const [width, height] = sizeKey.split('x');

		// First check in overrides if there is a modifyLength property, if not then check directly in option
		const modifyLength = overrides.modifyLength ?? option.modifyLength;

		// Since modify length is in percentage, we need to convert it to pixels
		const top = Math.round((Math.round(modifyLength.headingTop) * parseInt(height, 10)) / 100);
		const left = Math.round((Math.round(modifyLength.headingLeft) * parseInt(width, 10)) / 100);
		return { top, left };
	};

	const getDimensionsFromModifyLength = (option: any, sizeKey: string): { width: number; height: number } => {
		const overrides = option.overrides[sizeKey];
		const [boardWidth, boardHeight] = sizeKey.split('x');

		// First check in overrides if there is a modifyLength property, if not then check directly in option
		const modifyLength = overrides.modifyLength ?? option.modifyLength;

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

	const getElementPadding = (option: any, sizeKey: string): number => {
		const overrides = option.overrides[sizeKey];
		const padding = overrides.padding ?? option.styles.padding;

		// If padding is not present, then return 0
		if (!padding) return 0;

		const { all, top, right, bottom, left } = padding;
		// If top,right,bottom,left, and all are equal, then return the value of all
		if (all === top && all === right && all === bottom && all === left) return Math.round(all);
		// If all is not equal to top,right,bottom,left, then return 0
		errors.general.push('Unequal padding is not supported in Editor v2, setting padding to 0');
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

		errors[sizeKey].push(`No background color found for element ${option.id}, setting it to white (#fff)`);
		return '#fff';
	};

	// function convertToFabricGradient(
	// 	gradientData: {
	// 		colorStops: Array<{ r: number; g: number; b: number; a: number; left: number }>;
	// 		angle: number;
	// 	},
	// 	width: number,
	// 	height: number,
	// 	rotationAngle: number,
	// ) {
	// 	const colorStops = gradientData.colorStops.map(stop => ({
	// 		offset: stop.left / 100, // Normalize the position to a 0-1 range
	// 		color: `rgba(${stop.r}, ${stop.g}, ${stop.b}, ${stop.a})`,
	// 	}));

	// 	// Calculate the start and end points of the gradient line
	// 	// Convert angle to radians and adjust for rotationAngle
	// 	const angleRad = ((gradientData.angle - rotationAngle) * Math.PI) / 180;
	// 	const cosAngle = Math.cos(angleRad);
	// 	const sinAngle = Math.sin(angleRad);

	// 	// Assuming gradient line goes through the center of the box
	// 	const xCenter = width / 2;
	// 	const yCenter = height / 2;
	// 	const length = Math.max(width, height); // Length of gradient line, to ensure it covers the entire box

	// 	const x1 = xCenter - (length * cosAngle) / 2;
	// 	const y1 = yCenter - (length * sinAngle) / 2;
	// 	const x2 = xCenter + (length * cosAngle) / 2;
	// 	const y2 = yCenter + (length * sinAngle) / 2;

	// 	return new fabric.Gradient({
	// 		type: 'linear',
	// 		coords: { x1, y1, x2, y2 },
	// 		colorStops,
	// 	});
	// }

	const getBackgroundGradient = (option: any, sizeKey: string): fabric.Gradient | null => {
		const overrideBackgroundColor = option.overrides[sizeKey].backgroundColor;

		if (overrideBackgroundColor.type === 'linear-gradient') {
			errors[sizeKey].push(`Linear gradient is not supported in Editor v2. Skipping fill style for ${option.id}`);
			return null;
		}

		if (overrideBackgroundColor.type === 'radial-gradient') {
			errors[sizeKey].push(`Radial gradient is not supported in Editor v2. Skipping fill style for ${option.id}`);
			return null;
		}

		return null;
	};

	const getTextColor = (option: any, sizeKey: string): string => {
		const overrideTextColor = option.overrides[sizeKey].textColor;
		const stylesTextColor = option.styles.textColor;
		const textColor = option.textColor;

		const checkColor = (color: any) => {
			if (typeof color === 'object' && color.type === 'solid-color') {
				return color.color;
			}
			if (typeof color === 'string') {
				return color;
			}
			if (typeof color === 'object') {
				errors[sizeKey].push(`Gradient text color is not supported in Editor v2. Setting text color to black`);
				return '#000';
			}
		};

		return checkColor(overrideTextColor) || stylesTextColor || checkColor(textColor) || '#000';
	};

	const getHorizontalTextAlign = (option: any, sizeKey: string) => {
		const overrideTextAlign = option.overrides[sizeKey].textAlignment;
		const stylesTextAlign = option.styles.textAlignment;

		if (overrideTextAlign) {
			return overrideTextAlign;
		}

		if (stylesTextAlign) {
			return stylesTextAlign;
		}

		errors[sizeKey].push(`No text alignment found for element ${option.id}, setting it to center`);
		return 'center';
	};

	const getLineHeight = (option: any, sizeKey: string) => {
		const overrideLineHeight = option.overrides[sizeKey].lineHeight;
		const stylesLineHeight = option.styles.lineHeight;

		if (overrideLineHeight) {
			return Number(overrideLineHeight);
		}

		if (stylesLineHeight) {
			return Number(stylesLineHeight);
		}

		errors[sizeKey].push(`No line height found for element ${option.id}, setting it to 1`);
		return 1;
	};

	const getTextShadow = (option: any, sizeKey: string) => {
		const [width, height] = sizeKey.split('x');
		const overrideTextShadow = option.overrides[sizeKey].textShadow;
		const textShadow = option.textShadow;
		const stylesTextShadow = option.styles.textShadow;

		console.log('textshadow called', overrideTextShadow, textShadow, stylesTextShadow);
		const shadows = [overrideTextShadow, textShadow, stylesTextShadow];

		const getFabricShadowWithShadowObject = (shadow: any) => {
			return new fabric.Shadow({
				color: `rgba(${shadow.color.r}, ${shadow.color.g}, ${shadow.color.b}, ${(
					shadow.color.a as number
				).toFixed(2)})`,
				blur: shadow.blur,
				offsetX: (shadow.hShadow * Number(width)) / 100, // Due to some logic we've written in rocketium_main
				offsetY: (shadow.vShadow * Number(height)) / 100, // Due to some logic we've written in rocketium_main
			});
		};

		for (const shadow of shadows) {
			if (typeof shadow === 'string' && shadow === 'none') {
				console.log('none shadow');
				return null;
			} else if (typeof shadow === 'object') {
				const fabricShadow = getFabricShadowWithShadowObject(shadow);
				console.log('fabricShadow', fabricShadow);
				return fabricShadow;
			}
		}

		errors[sizeKey].push(`No text shadow found for element ${option.id}, setting it to null`);
		return null;
	};

	const getFabricText = (option: any, sizeKey: string): fabric.Text => {
		const overrides = option.overrides[sizeKey];
		const { top, left } = getPositionFromModifyLength(option, sizeKey);
		const { width, height } = getDimensionsFromModifyLength(option, sizeKey);
		const angle = getElementAngle(overrides.modifyLength);
		const padding = getElementPadding(option, sizeKey);
		const text = option.text;
		const data = {
			id: option.id,
			charCount: option.charCount,
			ignoreSnapping: false,
		};
		const fontFamily = overrides.font ?? option.styles.font;
		const fill = getTextColor(option, sizeKey);
		const textAlign = getHorizontalTextAlign(option, sizeKey);
		const fontSize = option.customFontSize;
		const lineHeight = getLineHeight(option, sizeKey);

		const properties: BoxProperties = {
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
		};
		const textElement = new fabric.Textbox(text, properties);
		textElement.set({
			width,
			height,
		});

		const textShadow = getTextShadow(option, sizeKey);

		if (textShadow) {
			textElement.set('shadow', textShadow);
		}

		const backgroundColor = getBackgroundColor(option, sizeKey);
		const backgroundGradient = getBackgroundGradient(option, sizeKey);

		if (backgroundGradient) {
			textElement.set('boxBackgroundFill', backgroundGradient);
		} else {
			textElement.set('backgroundColor', backgroundColor);
		}

		return textElement;
	};

	const getElementFromOptions = (options: any, sizeKey: string): fabric.Object[] => {
		const elements = options.map((option: any) => {
			const type = getElementType(option);
			if (type === 'text') {
				return getFabricText(option, sizeKey);
			}
			if (type === 'image') {
				errors[sizeKey].push(`Image element is not supported in Editor v2. Skipping element ${option.id}`);
				return null;
			}
			if (type === 'path') {
				errors[sizeKey].push(`Shape element is not supported in Editor v2. Skipping element ${option.id}`);
				return null;
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

	const creatives = transformCards(capsuleData.cards);
	// console.log('Keys', getUniqueKeys(capsuleData.cards[0].options));
	return {
		data: {
			_id: capsuleData._id.$oid,
			createdAt: capsuleData.createdAt.$date,
			updatedAt: capsuleData.updatedAt.$date,
			createdBy: capsuleData.authorId,
			updatedBy: capsuleData.lastModifiedId,
			creatives,
			isDeleted: capsuleData.isDeleted,
			thumbnail: capsuleData.image,
			metadata: capsuleData.metadata,
			shortid: capsuleData.shortId,
			status: version === 1 ? 'draft' : 'published',
		},
		errors,
	};
};

export default transformVariation;

export const getKeys = (obj: any, prefix: string = ''): string[] => {
	let keys: string[] = [];
	for (const key in obj) {
		// Check if the property is an own property and not inherited
		if (Object.prototype.hasOwnProperty.call(obj, key)) {
			const newKey = prefix ? `${prefix}.${key}` : key;

			if (typeof obj[key] === 'object' && obj[key] !== null) {
				// If the property is an object, recursively get keys
				keys = keys.concat(getKeys(obj[key], newKey));
			} else {
				// Otherwise, add the key to the array
				keys.push(newKey);
			}
		}
	}
	return keys;
};

export const getUniqueKeys = (arrayOfObjects: any[]): string[] => {
	const allKeys = arrayOfObjects.flatMap(obj => getKeys(obj));
	return Array.from(new Set(allKeys));
};
