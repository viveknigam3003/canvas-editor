import React, { useState } from 'react';
import { Button, Modal, TextInput } from '@mantine/core';
import FontFaceObserver from 'fontfaceobserver';

interface CustomFontProps {
	onLoad: () => void;
	currentSelectedElements: fabric.Object[];
	canvas: fabric.Canvas;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const CustomFont: React.FC<CustomFontProps> = ({ onLoad, canvas, currentSelectedElements }) => {
	const [name, setName] = useState('');
	const [url, setUrl] = useState('');
	const [modalOpen, setModalOpen] = useState(false);

	const handleLoad = () => {
		onLoad();
		setModalOpen(false);
		// create a font family taking font name and url
		const fontFaceRule = `
            @font-face {
                font-family: ${name};
                src: url(${url})
            }
        `;
		// create a style sheet
		const style = document.createElement('style');
		// add font face rule to style sheet
		style.appendChild(document.createTextNode(fontFaceRule));
		// add style sheet to document head
		document.head.appendChild(style);

		// create a new FontFaceObserver
		const observer = new FontFaceObserver(name);

		// load the font
		observer.load().then(
			() => {
				console.log('Font is available');
				// set font family of canvas text
				console.log('first', currentSelectedElements);
				if (currentSelectedElements && currentSelectedElements) {
					const textElement = currentSelectedElements?.[0] as fabric.Text;
					textElement.set({ fontFamily: name, data: { ...textElement.data, font: fontFaceRule } });
					canvas.renderAll();
				}
			},
			(err: any) => {
				console.log('Font is not available', err);
			},
		);
	};

	return (
		<>
			<Button onClick={() => setModalOpen(true)}>Custom Font</Button>

			<Modal opened={modalOpen} onClose={() => setModalOpen(false)} title="Custom Font" size="sm">
				<TextInput
					value={name}
					placeholder="Font Name"
					onChange={event => setName(event.currentTarget.value)}
				/>

				<TextInput
					style={{ marginTop: '20px' }}
					value={url}
					placeholder="Font Url"
					onChange={event => setUrl(event.currentTarget.value)}
				/>

				<Button fullWidth style={{ marginTop: '20px' }} onClick={handleLoad}>
					Load
				</Button>
			</Modal>
		</>
	);
};

export default CustomFont;
