/**
 * @module transformer
 * The module is responsible for transforming the data from the database to the client
 * Client data is of the type 'Variation'
 */

import { fabric } from 'fabric';
import { generateId } from '../../utils';
import { BoxProperties } from '../text/TextboxOverride';
import { Creative, Variant } from './types';
import { IImageOptions } from 'fabric/fabric-impl';

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
		const [width, height] = sizeKey.split('x');
		const overrides = option.overrides[sizeKey];
		const padding = overrides.padding ?? option.styles.padding;

		// If padding is not present, then return 0
		if (!padding) return 0;

		const { all, top, right, bottom, left } = padding;
		// If top,right,bottom,left, and all are equal, then return the value of all
		if (all === top && all === right && all === bottom && all === left)
			return Math.round((all / 100) * Math.min(Number(width), Number(height)));
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
				offsetX: (shadow.hShadow / 1000) * Number(width), // Due to some logic we've written in rocketium_main
				offsetY: (shadow.vShadow / 1000) * Number(height), // Due to some logic we've written in rocketium_main
			});
		};

		for (const shadow of shadows) {
			if (typeof shadow === 'string' && shadow === 'none') {
				return null;
			} else if (typeof shadow === 'object') {
				const fabricShadow = getFabricShadowWithShadowObject(shadow);
				return fabricShadow;
			}
		}

		errors[sizeKey].push(`No text shadow found for element ${option.id}, setting it to null`);
		return null;
	};

	const getTextTransform = (option: any, sizeKey: string) => {
		const overridesTextTransform = option.overrides[sizeKey].capitalization;

		if (overridesTextTransform) {
			switch (overridesTextTransform) {
				case 1: {
					return 'uppercase';
				}
				case 2: {
					return 'lowercase';
				}
				case 3: {
					return 'capitalize';
				}
				default: {
					return 'none';
				}
			}
		}

		return 'none';
	};

	const isLineThrough = (option: any, sizeKey: string) => {
		const textDecoration = option.overrides[sizeKey].textDecoration;
		if (textDecoration === 'line-through') {
			return true;
		}
		return false;
	};

	const isOverline = (option: any, sizeKey: string) => {
		const textDecoration = option.overrides[sizeKey].textDecoration;
		if (textDecoration === 'overline') {
			return true;
		}
		return false;
	};

	const isUnderline = (option: any, sizeKey: string) => {
		const textDecoration = option.overrides[sizeKey].textDecoration;
		if (textDecoration === 'underline') {
			return true;
		}
		return false;
	};

	const getBoxBorder = (option: any, sizeKey: string) => {
		const [width, height] = sizeKey.split('x');
		const overrides = option.overrides[sizeKey];

		const boxBorder = {
			width: 0,
			color: '',
			style: 'solid',
			radius: 0,
		};

		const borderStyle = overrides.borderStyle;
		const borderRadius = overrides.borderRadius;

		if (!borderStyle) {
			return null;
		}

		boxBorder.width = Math.round((borderStyle.width / 100) * Math.min(Number(width), Number(height)));
		boxBorder.color = borderStyle.color;
		boxBorder.style = borderStyle.style;

		if (borderStyle.style === 'dotted') {
			errors[sizeKey].push(`Dotted border styles are not supported in Editor v2, setting border style to solid`);
			boxBorder.style = 'solid';
		}

		const { all, top, right, bottom, left } = borderRadius;
		if (all > 0 || top > 0 || right > 0 || bottom > 0 || left > 0) {
			errors[sizeKey].push(`Border radius is not supported in Editor v2, setting border radius to 0`);
		}

		return boxBorder;
	};

	const getFontSize = (option: any, sizeKey: string) => {
		const [width, height] = sizeKey.split('x');
		const overrides = option.overrides[sizeKey];

		if (overrides.customFontSize) {
			return Math.round((overrides.customFontSize / 100) * Math.min(Number(width), Number(height)));
		}

		// Check the height and width of the element
		errors[sizeKey].push(`No font size found for element ${option.id}, setting it proportionally to the element`);
		const { width: w, height: h } = getDimensionsFromModifyLength(option, sizeKey);
		// Set the font size in proportion to the height and width of the element with respect to the height and width of the board
		const percentageWidth = (w / Number(width)) * 100;
		const percentageHeight = (h / Number(height)) * 100;

		return Math.round(Math.max(percentageWidth, percentageHeight));
	};

	const getFabricText = (option: any, sizeKey: string): BoxProperties => {
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
			displayText: option.templateRules?.helpText ?? option.text,
		};
		const fontFamily = overrides.font ?? option.styles.font;
		const fill = getTextColor(option, sizeKey);
		const textAlign = getHorizontalTextAlign(option, sizeKey);
		const fontSize = getFontSize(option, sizeKey);
		const lineHeight = getLineHeight(option, sizeKey);

		const properties: BoxProperties = {
			type: 'textbox',
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
			width,
			height,
			text,
		};

		const textShadow = getTextShadow(option, sizeKey);

		if (textShadow) {
			properties.shadow = textShadow;
		}

		const backgroundColor = getBackgroundColor(option, sizeKey);
		const backgroundGradient = getBackgroundGradient(option, sizeKey);

		if (backgroundGradient) {
			properties.boxBackgroundFill = backgroundGradient;
		} else {
			properties.backgroundColor = backgroundColor;
		}

		const textTransform = getTextTransform(option, sizeKey);

		if (textTransform) {
			properties.textTransform = textTransform;
		}

		const lineThrough = isLineThrough(option, sizeKey);
		const overline = isOverline(option, sizeKey);
		const underline = isUnderline(option, sizeKey);

		if (lineThrough) {
			properties.linethrough = lineThrough;
		}

		if (overline) {
			properties.overline = overline;
		}

		if (underline) {
			properties.underline = underline;
		}

		const boxBorder = getBoxBorder(option, sizeKey);

		if (boxBorder) {
			properties.boxBorderWidth = boxBorder.width;
			properties.boxBorderColor = boxBorder.color;
			properties.boxBorderStyle = boxBorder.style;
		}

		return properties;
	};

	const getFabricImage = (option: any, sizeKey: string): IImageOptions & { src: string } => {
		const overrides = option.overrides[sizeKey];
		// const [boardWidth, boardHeight] = sizeKey.split('x');
		const { top, left } = getPositionFromModifyLength(option, sizeKey);
		const { width, height } = getDimensionsFromModifyLength(option, sizeKey);
		const angle = getElementAngle(overrides.modifyLength);
		const src = 'https:' + option.url;

		const properties: IImageOptions & { src: string } = {
			top,
			left,
			width,
			height,
			angle,
			src,
			type: 'image',
			data: {
				id: option.id,
			},
			name: option.templateRules?.helpText ?? 'Media',
		};

		const stroke = getBoxBorder(option, sizeKey);
		if (stroke) {
			properties.stroke = stroke.color;
			properties.strokeWidth = stroke.width;
			properties.strokeDashArray = stroke.style === 'dashed' ? [stroke.width + 5, 5] : [];
			properties.strokeLineJoin = 'miter';
			properties.strokeUniform = true;
		}

		return properties;
	};

	const getElementFromOptions = (options: any, sizeKey: string): fabric.Object[] => {
		const elements = options.map((option: any) => {
			const type = getElementType(option);
			if (type === 'text') {
				return getFabricText(option, sizeKey);
			}
			if (type === 'image') {
				return getFabricImage(option, sizeKey);
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
