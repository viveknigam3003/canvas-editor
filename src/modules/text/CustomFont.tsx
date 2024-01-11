import React, { useState } from 'react';
import { Button, Modal, TextInput, Tabs } from '@mantine/core';
import FontFaceObserver from 'fontfaceobserver';
interface CustomFontProps {
	onLoad: () => void;
	currentSelectedElements: fabric.Object[];
	canvas: fabric.Canvas;
}

const CustomFont: React.FC<CustomFontProps> = ({ onLoad, canvas, currentSelectedElements }) => {
	const [name, setName] = useState('');
	const [url, setUrl] = useState('');
	const [modalOpen, setModalOpen] = useState(false);
	const [boldUrl, setBoldUrl] = useState('');

	const handleLoad = () => {
		onLoad();
		setModalOpen(false);

		const fontFaceRule = `
			@font-face {
				font-family: ${name};
				src: url(${url})
			}
		`;

		const style = document.createElement('style');
		style.appendChild(document.createTextNode(fontFaceRule));

		let boldFontFaceRule: any;
		if (boldUrl) {
			boldFontFaceRule = `
				@font-face {
					font-family: ${name}_bold;
					src: url(${boldUrl});
					font-weight: bold;
				}
			`;
			style.appendChild(document.createTextNode(boldFontFaceRule));
		}

		document.head.appendChild(style);

		const observer = new FontFaceObserver(name);
		observer.load().then(
			() => {
				console.log('Font is available');
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

		if (boldUrl) {
			const boldObserver = new FontFaceObserver(`${name}_bold`);
			boldObserver.load().then(
				() => {
					console.log('Bold font is available');
					if (currentSelectedElements && currentSelectedElements) {
						const textElement = currentSelectedElements?.[0] as fabric.Text;
						textElement.set({ data: { ...textElement.data, boldFont: boldFontFaceRule } });
						canvas.renderAll();
					}
				},
				(err: any) => {
					console.log('Bold font is not available', err);
				},
			);
		}
	};

	return (
		<>
			<Button onClick={() => setModalOpen(true)}>Manage Font</Button>

			<Modal opened={modalOpen} onClose={() => setModalOpen(false)} title="Manage Fonts" size="md" centered>
				<Tabs defaultValue="customFonts">
					<Tabs.List>
						<Tabs.Tab value="customFonts">Upload a font</Tabs.Tab>
					</Tabs.List>

					<Tabs.Panel value="customFonts">
						<div style={{ marginBottom: '.5rem', marginTop: '2rem', fontSize: '12px' }}>
							Font Family Name
						</div>
						<TextInput
							value={name}
							placeholder="Font Name"
							onChange={event => setName(event.currentTarget.value)}
						/>
						<div style={{ fontSize: '12px', marginTop: '1rem' }}>Regular Font URL</div>

						<TextInput
							style={{ marginTop: '10px' }}
							value={url}
							placeholder="Font Url"
							onChange={event => setUrl(event.currentTarget.value)}
						/>
						<div style={{ fontSize: '12px', marginTop: '1rem' }}>Bold Font URL</div>
						<TextInput
							style={{ marginTop: '10px' }}
							value={boldUrl}
							placeholder="Bold Font Url"
							onChange={event => setBoldUrl(event.currentTarget.value)}
						/>

						<Button fullWidth style={{ marginTop: '20px' }} onClick={handleLoad}>
							Load
						</Button>
					</Tabs.Panel>
				</Tabs>
			</Modal>
		</>
	);
};

export default CustomFont;
