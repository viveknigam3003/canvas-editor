import { ActionIcon, Box, Select, Stack } from '@mantine/core';
import { IconBold, IconItalic, IconSubscript, IconSuperscript, IconUnderline } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import Reflection from '../reflection';
import Shadow from '../shadow';
import CustomFont from './CustomFont';
import { Font } from './types';

interface PanelProps {
	canvas: fabric.Canvas;
	currentSelectedElement: fabric.Object[];
	artboardRef: React.RefObject<fabric.Rect>;
}

const TextPanel = ({ canvas, currentSelectedElement, artboardRef }: PanelProps) => {
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

	const toggleBold = () => {
		const textElement = currentSelectedElement?.[0] as fabric.Text;
		if (textElement.fontWeight === 'bold') {
			textElement.set({ fontWeight: 'normal' });
		} else {
			textElement.set({ fontWeight: 'bold' });
		}
		canvas.requestRenderAll();
	};
	const toggleItalic = () => {
		const textElement = currentSelectedElement?.[0] as fabric.Text;
		if (textElement.fontStyle === 'italic') {
			textElement.set({ fontStyle: 'normal' });
		} else {
			textElement.set({ fontStyle: 'italic' });
		}
		canvas.requestRenderAll();
	};
	const toggleUndeline = () => {
		const textElement = currentSelectedElement?.[0] as fabric.Text;
		if (textElement.underline) {
			textElement.set({ underline: false });
		} else {
			textElement.set({ underline: true });
		}
		canvas.requestRenderAll();
	};
	const toggleSuperscript = () => {
		const textElement = currentSelectedElement?.[0] as fabric.Textbox;
		const start = textElement.selectionStart;
		const end = textElement.selectionEnd;
		const selectedStyles = textElement.getSelectionStyles(start, end);
		const selectedText = textElement?.text?.slice(start, end);

		console.log('Selected text:', selectedText);
		console.log('Selected styles:', selectedStyles);
	};

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
				<Box>Font Styling</Box>
				<div style={{ display: 'flex', justifyContent: 'space-around' }}>
					<ActionIcon
						onClick={() => {
							toggleBold();
						}}
					>
						<IconBold size={20} />
					</ActionIcon>
					<ActionIcon
						onClick={() => {
							toggleItalic();
						}}
					>
						<IconItalic size={20} />
					</ActionIcon>
					<ActionIcon
						onClick={() => {
							toggleUndeline();
						}}
					>
						<IconUnderline size={20} />
					</ActionIcon>
					<ActionIcon
						onClick={() => {
							toggleSuperscript();
						}}
					>
						<IconSuperscript size={20} />
					</ActionIcon>
					<ActionIcon>
						<IconSubscript size={20} />
					</ActionIcon>
				</div>
			</Stack>
			<Stack>
				<Box>Shadow</Box>
				<Shadow canvas={canvas} currentSelectedElement={currentSelectedElement[0]} artboardRef={artboardRef} />
			</Stack>
			<Stack>
				<Reflection canvas={canvas} currentSelectedElement={currentSelectedElement} />
			</Stack>
		</Stack>
	);
};

export default TextPanel;
