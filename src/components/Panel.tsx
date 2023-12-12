import { ActionIcon, Box, ColorInput, Flex, Group, NumberInput, Select, Stack, Tooltip } from '@mantine/core';
import { useHotkeys } from '@mantine/hooks';
import {
	IconLayoutAlignBottom,
	IconLayoutAlignCenter,
	IconLayoutAlignLeft,
	IconLayoutAlignMiddle,
	IconLayoutAlignRight,
	IconLayoutAlignTop,
} from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { getAltKey } from '../modules/utils/keyboard';
import CustomFont from './CustomFont';

type Font = {
	family: string;
	files: {
		[key: string]: string;
	};
};

type PanelProps = {
	canvas: fabric.Canvas;
	currentSelectedElement: fabric.Object[];
	artboardRef: React.RefObject<fabric.Rect>;
};

// function to get extreme points of a fabric object
const getExtremePoints = (object: fabric.Object) => {
	const { aCoords } = object;
	if (!aCoords) throw new Error('Invalid object while finding extreme points');
	const { tl, tr, bl, br } = aCoords;
	const left = Math.min(tl.x, tr.x, bl.x, br.x);
	const top = Math.min(tl.y, tr.y, bl.y, br.y);
	const right = Math.max(tl.x, tr.x, bl.x, br.x);
	const bottom = Math.max(tl.y, tr.y, bl.y, br.y);
	console.log(aCoords, object);
	return {
		left,
		top,
		right,
		bottom,
	};
};

const alignElementToRect = (
	currentSelectedElement: fabric.Object[],
	targetRect: fabric.Rect,
	position: string,
	canvas: fabric.Canvas,
) => {
	switch (position) {
		case 'left':
			currentSelectedElement.forEach(element => {
				if (!targetRect.left || !element.left) throw new Error('Invalid target rect in left align');
				element.set({
					left: targetRect.left + (element.left - getExtremePoints(element).left),
				});
			});
			break;
		case 'center':
			currentSelectedElement.forEach(element => {
				if (!targetRect.left || !element.left || !targetRect.width)
					throw new Error('Invalid target rect in center align');
				const artboardCenter = targetRect.left + (targetRect.width + targetRect.left - targetRect.left) / 2;
				const elementCenter =
					getExtremePoints(element).left +
					(getExtremePoints(element).right - getExtremePoints(element).left) / 2;
				element.set({
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					//@ts-ignore
					left: element.left + (artboardCenter - elementCenter),
				});
			});

			break;
		case 'right':
			currentSelectedElement.forEach(element => {
				element.set({
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					//@ts-ignore
					left: element.left + (targetRect.left + targetRect.width) - getExtremePoints(element).right,
				});
			});
			break;
		case 'top':
			currentSelectedElement.forEach(element => {
				if (!targetRect.top || !element.top || !targetRect.width)
					throw new Error('Invalid target rect in top align');
				element.set({
					top: targetRect.top + (element.top - getExtremePoints(element).top),
				});
			});
			break;
		case 'middle':
			currentSelectedElement.forEach(element => {
				if (!targetRect.top || !element.top || !targetRect.height)
					throw new Error('Invalid target rect in middle align');
				const artboardCenter = targetRect.top + (targetRect.height + targetRect.top - targetRect.top) / 2;
				const elementCenter =
					getExtremePoints(element).top +
					(getExtremePoints(element).bottom - getExtremePoints(element).top) / 2;
				element.set({
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					//@ts-ignore
					top: element.top + (artboardCenter - elementCenter),
				});
			});
			break;
		case 'bottom':
			currentSelectedElement.forEach(element => {
				element.set({
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					//@ts-ignore
					top: element.top + (targetRect.top + targetRect.height) - getExtremePoints(element).bottom,
				});
			});
			break;
		default:
			console.error('Invalid position:', position);
	}

	canvas.requestRenderAll();
};
const AlignmentPanel = ({ canvas, currentSelectedElement, artboardRef }: PanelProps) => {
	//TODO: fix this
	const castedArtboardRef = artboardRef.current as fabric.Rect;
	useHotkeys([
		[
			'alt+a',
			e => {
				e.preventDefault();
				alignElementToRect(currentSelectedElement, castedArtboardRef, 'left', canvas);
			},
		],
		[
			'alt+d',
			e => {
				e.preventDefault();
				alignElementToRect(currentSelectedElement, castedArtboardRef, 'right', canvas);
			},
		],
		[
			'alt+h',
			e => {
				e.preventDefault();
				alignElementToRect(currentSelectedElement, castedArtboardRef, 'center', canvas);
			},
		],
		[
			'alt+w',
			e => {
				e.preventDefault();
				alignElementToRect(currentSelectedElement, castedArtboardRef, 'top', canvas);
			},
		],
		[
			'alt+s',
			e => {
				e.preventDefault();
				alignElementToRect(currentSelectedElement, castedArtboardRef, 'bottom', canvas);
			},
		],
		[
			'alt+v',
			e => {
				e.preventDefault();
				alignElementToRect(currentSelectedElement, castedArtboardRef, 'middle', canvas);
			},
		],
	]);
	return (
		<Stack>
			<Box>Alignment</Box>
			<Flex gap={16}>
				<Tooltip label={`Align Left (${getAltKey()} + A)`}>
					<ActionIcon
						onClick={() => alignElementToRect(currentSelectedElement, castedArtboardRef, 'left', canvas)}
					>
						<IconLayoutAlignLeft />
					</ActionIcon>
				</Tooltip>
				<Tooltip label={`Align Center (${getAltKey()} + H)`}>
					<ActionIcon
						onClick={() => alignElementToRect(currentSelectedElement, castedArtboardRef, 'center', canvas)}
					>
						<IconLayoutAlignMiddle />{' '}
					</ActionIcon>
				</Tooltip>
				<Tooltip label={`Align Right (${getAltKey()} + D)`}>
					<ActionIcon
						onClick={() => alignElementToRect(currentSelectedElement, castedArtboardRef, 'right', canvas)}
					>
						<IconLayoutAlignRight />
					</ActionIcon>
				</Tooltip>
				<Tooltip label={`Align Top (${getAltKey()} + W)`}>
					<ActionIcon
						onClick={() => alignElementToRect(currentSelectedElement, castedArtboardRef, 'top', canvas)}
					>
						<IconLayoutAlignTop />
					</ActionIcon>
				</Tooltip>
				<Tooltip label={`Align Middle (${getAltKey()} + V)`}>
					<ActionIcon
						onClick={() => alignElementToRect(currentSelectedElement, castedArtboardRef, 'middle', canvas)}
					>
						<IconLayoutAlignCenter />
					</ActionIcon>
				</Tooltip>
				<Tooltip label={`Align Bottom (${getAltKey()} + S)`}>
					<ActionIcon
						onClick={() => alignElementToRect(currentSelectedElement, castedArtboardRef, 'bottom', canvas)}
					>
						<IconLayoutAlignBottom />
					</ActionIcon>
				</Tooltip>
			</Flex>
		</Stack>
	);
};

const TextPanel = ({ canvas, currentSelectedElement }: PanelProps) => {
	const [fontList, setFontList] = useState<Font[]>([]);
	const [value, setValue] = useState('');
	const [fontWeight, setFontWeight] = useState('regular');
	const currentFont = fontList.find(font => font.family === value) as Font;
	useEffect(() => {
		fetch('/fonts.json')
			.then(response => response.json())
			.then(fonts => {
				setFontList(fonts.items);
			})
			.catch(error => console.error(error));
	}, []);

	return (
		<Stack spacing={16}>
			<Box>Font Family</Box>
			<CustomFont onLoad={() => {}} canvas={canvas} currentSelectedElement={currentSelectedElement[0]} />
			<Select
				searchable
				value={value}
				nothingFound="No options"
				onChange={e => {
					console.log('change', e);
					const font = fontList.find(font => font.family === e) as Font;
					setValue(font.family);
					fetch(font.files.regular)
						.then(response => response.arrayBuffer())
						.then(arrayBuffer => {
							const fontBase64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
							const fontFaceRule = `
								@font-face {
									font-family:  ${font.family};
									src: url(data:font/woff;base64,${fontBase64}) format('woff');
								}
           					`;
							const styleElement = document.createElement('style');
							styleElement.appendChild(document.createTextNode(fontFaceRule));
							document.head.appendChild(styleElement);
							console.log('first', currentSelectedElement?.[0]);
							(currentSelectedElement?.[0] as fabric.Text)?.set('fontFamily', font.family);
							canvas.renderAll();
						})
						.catch(error => console.error('Error loading font:', error));
				}}
				data={fontList.map(font => ({
					value: font.family,
					label: font.family,
				}))}
			/>
			{currentFont && (
				<Box>
					<Box>Font Weight</Box>

					<Select
						value={fontWeight}
						onChange={e => {
							setFontWeight(e as string);
							fetch(currentFont.files?.[e as string])
								.then(response => response.arrayBuffer())
								.then(arrayBuffer => {
									const fontBase64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
									const fontFaceRule = `
											@font-face {
												font-family:  ${currentFont.family};
												src: url(data:font/woff;base64,${fontBase64}) format('woff');
												font-weight: ${e};
											}
										`;
									const styleElement = document.createElement('style');
									styleElement.appendChild(document.createTextNode(fontFaceRule));
									document.head.appendChild(styleElement);
									console.log('first', currentSelectedElement?.[0]);
									(currentSelectedElement?.[0] as fabric.Text)?.set('fontWeight', e as string);
									canvas.requestRenderAll();
								})
								.catch(error => console.error('Error loading font:', error));
						}}
						data={Object.entries(currentFont?.files)?.map(([fontName]) => ({
							value: fontName,
							label: fontName,
						}))}
					/>
				</Box>
			)}
			<Stack>
				<Box>Shadow</Box>
				<Group spacing={8} grow>
					<NumberInput
						label="X"
						value={((currentSelectedElement?.[0] as fabric.Text).shadow as fabric.Shadow)?.offsetX || 0}
						onChange={e => {
							(currentSelectedElement?.[0] as fabric.Text)?.set(
								'shadow',
								Object.assign({}, (currentSelectedElement?.[0] as fabric.Text).shadow, { offsetX: e }),
							);
							canvas.renderAll();
						}}
						min={-100}
						max={100}
						step={1}
					/>
					<NumberInput
						label="Y"
						value={((currentSelectedElement?.[0] as fabric.Text).shadow as fabric.Shadow)?.offsetY || 0}
						onChange={e => {
							(currentSelectedElement?.[0] as fabric.Text)?.set(
								'shadow',
								Object.assign({}, (currentSelectedElement?.[0] as fabric.Text).shadow, { offsetY: e }),
							);
							canvas.renderAll();
						}}
						min={-100}
						max={100}
						step={1}
					/>
				</Group>
				<Group spacing={8} grow>
					<NumberInput
						label="Blur"
						value={((currentSelectedElement?.[0] as fabric.Text).shadow as fabric.Shadow)?.blur || 0}
						onChange={e => {
							(currentSelectedElement?.[0] as fabric.Text)?.set(
								'shadow',
								Object.assign({}, (currentSelectedElement?.[0] as fabric.Text).shadow, { blur: e }),
							);
							canvas.renderAll();
						}}
						min={0}
						max={100}
						step={1}
					/>
					<ColorInput
						label="Color"
						value={((currentSelectedElement?.[0] as fabric.Text).shadow as fabric.Shadow)?.color}
						onChange={e => {
							(currentSelectedElement?.[0] as fabric.Text)?.set(
								'shadow',
								Object.assign({}, (currentSelectedElement?.[0] as fabric.Text).shadow, { color: e }),
							);
							canvas.renderAll();
						}}
					/>
				</Group>
			</Stack>
		</Stack>
	);
};

const ImagePanel = ({ canvas, currentSelectedElement }: PanelProps) => {
	return (
		<Stack>
			<Box>Shadow</Box>
			<Group spacing={8} grow>
				<NumberInput
					label="X"
					value={((currentSelectedElement?.[0] as fabric.Image).shadow as fabric.Shadow)?.offsetX || 0}
					onChange={e => {
						(currentSelectedElement?.[0] as fabric.Image)?.set(
							'shadow',
							Object.assign({}, (currentSelectedElement?.[0] as fabric.Image).shadow, { offsetX: e }),
						);
						canvas.renderAll();
					}}
					min={-100}
					max={100}
					step={1}
				/>
				<NumberInput
					label="Y"
					value={((currentSelectedElement?.[0] as fabric.Image).shadow as fabric.Shadow)?.offsetY || 0}
					onChange={e => {
						(currentSelectedElement?.[0] as fabric.Image)?.set(
							'shadow',
							Object.assign({}, (currentSelectedElement?.[0] as fabric.Image).shadow, { offsetY: e }),
						);
						canvas.renderAll();
					}}
					min={-100}
					max={100}
					step={1}
				/>
			</Group>
			<Group spacing={8} grow>
				<NumberInput
					label="Blur"
					value={((currentSelectedElement?.[0] as fabric.Image).shadow as fabric.Shadow)?.blur || 0}
					onChange={e => {
						(currentSelectedElement?.[0] as fabric.Image)?.set(
							'shadow',
							Object.assign({}, (currentSelectedElement?.[0] as fabric.Image).shadow, { blur: e }),
						);
						canvas.renderAll();
					}}
					min={0}
					max={100}
					step={1}
				/>
				<ColorInput
					label="Color"
					value={((currentSelectedElement?.[0] as fabric.Image).shadow as fabric.Shadow)?.color}
					onChange={e => {
						(currentSelectedElement?.[0] as fabric.Image)?.set(
							'shadow',
							Object.assign({}, (currentSelectedElement?.[0] as fabric.Image).shadow, { color: e }),
						);
						canvas.renderAll();
					}}
					format="rgba"
				/>
			</Group>
		</Stack>
	);
};

const Panel = ({ canvas, currentSelectedElement, artboardRef }: PanelProps) => {
	if (!currentSelectedElement || currentSelectedElement?.length !== 1) {
		return null;
	}
	return (
		<Stack>
			<AlignmentPanel artboardRef={artboardRef} canvas={canvas} currentSelectedElement={currentSelectedElement} />
			{currentSelectedElement?.[0]?.type === 'textbox' && (
				<TextPanel artboardRef={artboardRef} canvas={canvas} currentSelectedElement={currentSelectedElement} />
			)}
			{currentSelectedElement?.[0]?.type === 'image' && (
				<ImagePanel artboardRef={artboardRef} canvas={canvas} currentSelectedElement={currentSelectedElement} />
			)}
		</Stack>
	);
};

export default Panel;
