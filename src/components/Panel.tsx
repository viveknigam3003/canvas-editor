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
		regular: string;
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
	return (
		<Stack>
			<Box>Alignment</Box>
			<Flex gap={16}>
				<ActionIcon onClick={alignElementToRect(currentSelectedElement, artboardRef.current, 'left', canvas)}>
					<IconLayoutAlignLeft />
				</ActionIcon>
				<ActionIcon onClick={alignElementToRect(currentSelectedElement, artboardRef.current, 'center', canvas)}>
					<IconLayoutAlignMiddle />{' '}
				</ActionIcon>
				<ActionIcon onClick={alignElementToRect(currentSelectedElement, artboardRef.current, 'right', canvas)}>
					<IconLayoutAlignRight />
				</ActionIcon>
				<ActionIcon onClick={alignElementToRect(currentSelectedElement, artboardRef.current, 'top', canvas)}>
					<IconLayoutAlignTop />
				</ActionIcon>
				<ActionIcon onClick={alignElementToRect(currentSelectedElement, artboardRef.current, 'middle', canvas)}>
					<IconLayoutAlignCenter />
				</ActionIcon>
				<ActionIcon onClick={alignElementToRect(currentSelectedElement, artboardRef.current, 'bottom', canvas)}>
					<IconLayoutAlignBottom />
				</ActionIcon>
			</Flex>
		</Stack>
	);
};

const TextPanel = ({ canvas, currentSelectedElement, artboardRef }: PanelProps) => {
	const [fontList, setFontList] = useState<Font[]>([]);
	const [value, setValue] = useState('');

	useEffect(() => {
		fetch('/fonts.json')
			.then(response => response.json())
			.then(fonts => {
				console.log(fonts);
				setFontList(fonts.items);
			})
			.catch(error => console.error(error));
	}, [currentSelectedElement]);
	return (
		<div>
			<Box>Text</Box>
			<Select
				value={value}
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
				data={fontList.slice(0, 10).map(font => ({
					value: font.family,
					label: font.family,
				}))}
			/>
			<Select
				value={value}
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
				data={fontList.slice(0, 10).map(font => ({
					value: font.family,
					label: font.family,
				}))}
			/>
		</div>
	);
};

const Panel = ({ canvas, currentSelectedElement, artboardRef }: PanelProps) => {
	if (!currentSelectedElement || currentSelectedElement?.length !== 1) {
		return null;
	}
	return (
		<div>
			<AlignmentPanel artboardRef={artboardRef} canvas={canvas} currentSelectedElement={currentSelectedElement} />
			<TextPanel artboardRef={artboardRef} canvas={canvas} currentSelectedElement={currentSelectedElement} />
		</div>
	);
};

export default Panel;
