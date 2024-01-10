import { ActionIcon, Box, ColorInput, Divider, Select, Stack } from '@mantine/core';
import { IconBold, IconItalic, IconSubscript, IconSuperscript, IconUnderline } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import Reflection from '../reflection';
import Shadow from '../shadow';
import CustomFont from './CustomFont';
import { Font } from './types';
import SectionTitle from '../../components/SectionTitle';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/rootReducer';
import { applyBulkEdit } from '../app/actions';

interface PanelProps {
	canvas: fabric.Canvas;
	currentSelectedElements: fabric.Object[];
}

const TextPanel = ({ canvas, currentSelectedElements }: PanelProps) => {
	const dispatch = useDispatch();
	const currentSelectedArtboards = useSelector((state: RootState) => state.app.selectedArtboards);
	const [fontList, setFontList] = useState<Font[]>([]);
	const [value, setValue] = useState('');
	const [fontWeight, setFontWeight] = useState('regular');
	const currentFont = fontList.find(font => font.family === value) as Font;
	// Add these states at the beginning of your component
	const [isBold, setIsBold] = useState(false);
	const [isItalic, setIsItalic] = useState(false);
	const [isUnderline, setIsUnderline] = useState(false);
	const [isSuperscript, setIsSuperscript] = useState(false);
	const [isSubscript, setIsSubscript] = useState(false);
	const [selectedFontColor, setSelectedFontColor] = useState('#000000');

	useEffect(() => {
		const textElement = currentSelectedElements?.[0] as fabric.Text;
		if (textElement) {
			const isBold = textElement.fontWeight === 'bold';
			setIsBold(isBold);

			const isItalic = textElement.fontStyle === 'italic';
			setIsItalic(isItalic);

			const isUnderline = textElement.underline;
			setIsUnderline(isUnderline || false);

			// Check if the text is superscript or subscript by checking the fontSize and deltaY properties
			const selectedStyles = textElement.getSelectionStyles(0, textElement?.text?.length);
			const isSuperscript = selectedStyles.some(style => style.fontSize && style.deltaY < 0);
			setIsSuperscript(isSuperscript);

			const isSubscript = selectedStyles.some(style => style.fontSize && style.deltaY > 0);
			setIsSubscript(isSubscript);

			const fontColor = textElement.fill;
			setSelectedFontColor(fontColor as string);
		}
	}, [currentSelectedElements]);

	useEffect(() => {
		fetch('/fonts.json')
			.then(response => response.json())
			.then(fonts => {
				setFontList(fonts.items);
			})
			.catch(error => console.error(error));
	}, []);

	const toggleBold = () => {
		const textElement = currentSelectedElements?.[0] as fabric.Text;
		if (textElement.fontWeight === 'bold') {
			textElement.set({ fontWeight: 'normal', fontFamily: textElement?.fontFamily?.replace('_bold', '') });
			setIsBold(false);
			if (currentSelectedArtboards.length > 1) {
				dispatch(
					applyBulkEdit({
						element: textElement,
						properties: {
							fontWeight: 'normal',
							fontFamily: textElement?.fontFamily?.replace('_bold', ''),
						},
					}),
				);
			}
		} else {
			textElement.set({ fontWeight: 'bold', fontFamily: `${textElement.fontFamily}_bold` });
			setIsBold(true);
			if (currentSelectedArtboards.length > 1) {
				dispatch(
					applyBulkEdit({
						element: textElement,
						properties: {
							fontWeight: 'bold',
							fontFamily: `${textElement.fontFamily}_bold`,
						},
					}),
				);
			}
		}
		canvas.requestRenderAll();
	};
	const toggleItalic = () => {
		const textElement = currentSelectedElements?.[0] as fabric.Text;
		if (textElement.fontStyle === 'italic') {
			textElement.set({ fontStyle: 'normal' });
			setIsItalic(false);
			if (currentSelectedArtboards.length > 1) {
				dispatch(
					applyBulkEdit({
						element: textElement,
						properties: {
							fontStyle: 'normal',
						},
					}),
				);
			}
		} else {
			textElement.set({ fontStyle: 'italic' });
			setIsItalic(true);
			if (currentSelectedArtboards.length > 1) {
				dispatch(
					applyBulkEdit({
						element: textElement,
						properties: {
							fontStyle: 'italic',
						},
					}),
				);
			}
		}
		canvas.requestRenderAll();
	};
	const toggleUndeline = () => {
		const textElement = currentSelectedElements?.[0] as fabric.Text;
		if (textElement.underline) {
			textElement.set({ underline: false });
			setIsUnderline(false);
			if (currentSelectedArtboards.length > 1) {
				dispatch(
					applyBulkEdit({
						element: textElement,
						properties: {
							underline: false,
						},
					}),
				);
			}
		} else {
			textElement.set({ underline: true });
			setIsUnderline(true);
			if (currentSelectedArtboards.length > 1) {
				dispatch(
					applyBulkEdit({
						element: textElement,
						properties: {
							underline: true,
						},
					}),
				);
			}
		}
		canvas.requestRenderAll();
	};
	const toggleSuperscript = () => {
		const textElement = currentSelectedElements?.[0] as fabric.Textbox;
		const start = textElement.selectionStart || 0;
		const end = textElement.selectionEnd || 1;

		// Get the current styles of the selected text
		const selectedStyles = textElement.getSelectionStyles(start, end);

		// Check if the selected text is superscript by checking the fontSize and deltaY properties
		const isSuperscript = selectedStyles.some(style => style.fontSize && style.deltaY < 0);

		// Check if the selected text is subscript
		const isSubscript = selectedStyles.some(style => style.fontSize && style.deltaY > 0);

		if (isSubscript) {
			// If subscript is active, remove it
			for (const line in textElement.styles) {
				if (textElement.styles[line]) {
					for (let i = start; i < end; i++) {
						if (textElement.styles[line][i]) {
							textElement.styles[line][i] = {};
						}
					}
				}
			}
			setIsSubscript(false);
		}

		if (isSuperscript) {
			// If the selected text is superscript, remove the superscript
			for (const line in textElement.styles) {
				if (textElement.styles[line]) {
					for (let i = start; i < end; i++) {
						if (textElement.styles[line][i]) {
							textElement.styles[line][i] = {};
						}
					}
				}
			}
			setIsSuperscript(false);
		} else {
			// If the selected text is not superscript, add superscript
			textElement.setSuperscript(start || 0, end || 1);
			setIsSuperscript(true);
		}

		// Force the textbox to re-render
		textElement.canvas?.requestRenderAll();
	};

	const toggleSubscript = () => {
		const textElement = currentSelectedElements?.[0] as fabric.Textbox;
		const start = textElement.selectionStart || 0;
		const end = textElement.selectionEnd || 1;

		// Get the current styles of the selected text
		const selectedStyles = textElement.getSelectionStyles(start, end);

		// Check if the selected text is subscript
		const isSubscript = selectedStyles.some(style => style.fontSize && style.deltaY > 0);

		// Check if the selected text is superscript
		const isSuperscript = selectedStyles.some(style => style.fontSize && style.deltaY < 0);

		if (isSuperscript) {
			// If superscript is active, remove it
			for (const line in textElement.styles) {
				if (textElement.styles[line]) {
					for (let i = start; i < end; i++) {
						if (textElement.styles[line][i]) {
							textElement.styles[line][i] = {};
						}
					}
				}
			}
			setIsSuperscript(false);
		}

		if (isSubscript) {
			// If the selected text is subscript, remove the subscript
			for (const line in textElement.styles) {
				if (textElement.styles[line]) {
					for (let i = start; i < end; i++) {
						if (textElement.styles[line][i]) {
							textElement.styles[line][i] = {};
						}
					}
				}
			}
			setIsSubscript(false);
		} else {
			// If the selected text is not subscript, add subscript
			textElement.setSubscript(start || 0, end || 1);
			setIsSubscript(true);
		}

		// Force the textbox to re-render
		textElement.canvas?.requestRenderAll();
	};

	return (
		<Stack spacing={16}>
			<SectionTitle>Font Family</SectionTitle>
			<CustomFont onLoad={() => {}} canvas={canvas} currentSelectedElements={currentSelectedElements} />

			<Divider />
			<Stack>
				<SectionTitle>Font Styling</SectionTitle>
				<div style={{ display: 'flex', justifyContent: 'space-around' }}>
					<ActionIcon
						onClick={() => {
							toggleBold();
						}}
					>
						<IconBold
							size={20}
							style={{
								borderRadius: 4,
								backgroundColor: isBold ? '#7950f2' : 'transparent',
								color: isBold ? 'white' : 'grey',
							}}
						/>
					</ActionIcon>
					<ActionIcon
						onClick={() => {
							toggleItalic();
						}}
					>
						<IconItalic
							size={20}
							style={{
								borderRadius: 4,
								backgroundColor: isItalic ? '#7950f2' : 'transparent',
								color: isItalic ? 'white' : 'grey',
							}}
						/>
					</ActionIcon>
					<ActionIcon
						onClick={() => {
							toggleUndeline();
						}}
					>
						<IconUnderline
							size={20}
							style={{
								borderRadius: 4,
								backgroundColor: isUnderline ? '#7950f2' : 'transparent',
								color: isUnderline ? 'white' : 'grey',
							}}
						/>
					</ActionIcon>
					<ActionIcon
						onClick={() => {
							toggleSuperscript();
						}}
					>
						<IconSuperscript
							size={20}
							style={{
								borderRadius: 4,
								backgroundColor: isSuperscript ? '#7950f2' : 'transparent',
								color: isSuperscript ? 'white' : 'grey',
							}}
						/>
					</ActionIcon>
					<ActionIcon
						onClick={() => {
							toggleSubscript();
						}}
					>
						<IconSubscript
							size={20}
							style={{
								borderRadius: 4,
								backgroundColor: isSubscript ? '#7950f2' : 'transparent',
								color: isSubscript ? 'white' : 'grey',
							}}
						/>
					</ActionIcon>
				</div>
			</Stack>
			<Divider />
			<Stack>
				<SectionTitle>Shadow</SectionTitle>
				<Shadow canvas={canvas} currentSelectedElements={currentSelectedElements} />
			</Stack>
			<Divider />
			<Stack>
				<SectionTitle>Reflection</SectionTitle>
				<Reflection canvas={canvas} currentSelectedElements={currentSelectedElements} />
			</Stack>
		</Stack>
	);
};

export default TextPanel;
