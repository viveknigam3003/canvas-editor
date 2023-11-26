import { ActionIcon, Box, Flex, Select, Stack } from '@mantine/core';
import {
	IconLayoutAlignBottom,
	IconLayoutAlignCenter,
	IconLayoutAlignMiddle,
	IconLayoutAlignRight,
	IconLayoutAlignTop,
} from '@tabler/icons-react';
import { IconLayoutAlignLeft } from '@tabler/icons-react';
import { useEffect, useState } from 'react';

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
const alignElementToRect =
	(currentSelectedElement: fabric.Object[], targetRect: fabric.Rect, position: string, canvas: fabric.Canvas) =>
	() => {
		switch (position) {
			case 'left':
				currentSelectedElement.forEach(element => {
					element.set({
						left: targetRect.left,
					});
				});
				break;
			case 'center':
				currentSelectedElement.forEach(element => {
					element.set({
						// eslint-disable-next-line @typescript-eslint/ban-ts-comment
						//@ts-ignore
						left: (targetRect.width - element.width * element.scaleX) / 2,
					});
				});

				break;
			case 'right':
				currentSelectedElement.forEach(element => {
					element.set({
						// eslint-disable-next-line @typescript-eslint/ban-ts-comment
						//@ts-ignore
						left: targetRect.left + targetRect.width - element.width * element.scaleX,
					});
				});
				break;
			case 'top':
				currentSelectedElement.forEach(element => {
					element.set({
						top: targetRect.top,
					});
				});
				break;
			case 'middle':
				currentSelectedElement.forEach(element => {
					element.set({
						// eslint-disable-next-line @typescript-eslint/ban-ts-comment
						//@ts-ignore
						top: (targetRect.top + targetRect.height - element.height * element.scaleY) / 2,
					});
				});
				break;
			case 'bottom':
				currentSelectedElement.forEach(element => {
					element.set({
						// eslint-disable-next-line @typescript-eslint/ban-ts-comment
						//@ts-ignore
						top: targetRect.top + targetRect.height - element.height * element.scaleY,
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
	return (
		<Stack>
			<Box>Alignment</Box>
			<Flex gap={16}>
				<ActionIcon onClick={alignElementToRect(currentSelectedElement, castedArtboardRef, 'left', canvas)}>
					<IconLayoutAlignLeft />
				</ActionIcon>
				<ActionIcon onClick={alignElementToRect(currentSelectedElement, castedArtboardRef, 'center', canvas)}>
					<IconLayoutAlignMiddle />{' '}
				</ActionIcon>
				<ActionIcon onClick={alignElementToRect(currentSelectedElement, castedArtboardRef, 'right', canvas)}>
					<IconLayoutAlignRight />
				</ActionIcon>
				<ActionIcon onClick={alignElementToRect(currentSelectedElement, castedArtboardRef, 'top', canvas)}>
					<IconLayoutAlignTop />
				</ActionIcon>
				<ActionIcon onClick={alignElementToRect(currentSelectedElement, castedArtboardRef, 'middle', canvas)}>
					<IconLayoutAlignCenter />
				</ActionIcon>
				<ActionIcon onClick={alignElementToRect(currentSelectedElement, castedArtboardRef, 'bottom', canvas)}>
					<IconLayoutAlignBottom />
				</ActionIcon>
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
				console.log(fonts);
				setFontList(fonts.items);
			})
			.catch(error => console.error(error));
	}, []);

	return (
		<Stack spacing={16}>
			<Box>Font Family</Box>
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
							canvas.requestRenderAll();
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
		</Stack>
	);
};

const Panel = ({ canvas, currentSelectedElement, artboardRef }: PanelProps) => {
	if (!currentSelectedElement || currentSelectedElement?.length !== 1) {
		return null;
	}
	console.log(currentSelectedElement);
	return (
		<Stack>
			<AlignmentPanel artboardRef={artboardRef} canvas={canvas} currentSelectedElement={currentSelectedElement} />
			{currentSelectedElement?.[0]?.type === 'textbox' && (
				<TextPanel artboardRef={artboardRef} canvas={canvas} currentSelectedElement={currentSelectedElement} />
			)}
		</Stack>
	);
};

export default Panel;
