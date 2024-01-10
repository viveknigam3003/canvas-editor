import React, { useEffect, useState } from 'react';
import { Button, Modal, TextInput, Tabs, Select, Box } from '@mantine/core';
import FontFaceObserver from 'fontfaceobserver';
import { Font } from './types';
import { applyBulkEdit } from '../app/actions';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/rootReducer';
import SectionTitle from '../../components/SectionTitle';
interface CustomFontProps {
	onLoad: () => void;
	currentSelectedElements: fabric.Object[];
	canvas: fabric.Canvas;
}

const CustomFont: React.FC<CustomFontProps> = ({ onLoad, canvas, currentSelectedElements }) => {
	const dispatch = useDispatch();
	const [name, setName] = useState('');
	const [url, setUrl] = useState('');
	const [value, setValue] = useState('');
	const [modalOpen, setModalOpen] = useState(false);
	const [boldUrl, setBoldUrl] = useState('');
	const [fontList, setFontList] = useState<Font[]>([]);
	const currentSelectedArtboards = useSelector((state: RootState) => state.app.selectedArtboards);
	const currentFont = fontList.find(font => font.family === value) as Font;
	const [fontWeight, setFontWeight] = useState('regular');

	useEffect(() => {
		fetch('/fonts.json')
			.then(response => response.json())
			.then(fonts => {
				setFontList(fonts.items);
			})
			.catch(error => console.error(error));
	}, []);

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
						<Tabs.Tab value="googleFonts">Google Fonts</Tabs.Tab>
						<Tabs.Tab value="customFonts">Upload a font</Tabs.Tab>
					</Tabs.List>

					<Tabs.Panel value="googleFonts">
						<div style={{ marginTop: '2rem' }}>
							<div style={{ marginBottom: '1rem' }}> Choose your font</div>

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
											const fontBase64 = btoa(
												String.fromCharCode(...new Uint8Array(arrayBuffer)),
											);
											const fontFaceRule = `
										@font-face {
											font-family:  ${font.family};
											src: url(data:font/woff;base64,${fontBase64}) format('woff');
										}
									`;
											const styleElement = document.createElement('style');
											styleElement.appendChild(document.createTextNode(fontFaceRule));
											document.head.appendChild(styleElement);
											(currentSelectedElements?.[0] as fabric.Text)?.set(
												'fontFamily',
												font.family,
											);
											if (currentSelectedElements && currentSelectedElements) {
												const textElement = currentSelectedElements?.[0] as fabric.Text;
												textElement.set({
													data: { ...textElement.data, googleFont: fontFaceRule },
												});
												canvas.renderAll();
											}
											if (currentSelectedArtboards.length > 1) {
												dispatch(
													applyBulkEdit({
														element: currentSelectedElements?.[0],
														properties: {
															fontFamily: font.family,
														},
													}),
												);
											}
											canvas.requestRenderAll();
										})
										.catch(error => console.error('Error loading font:', error));
								}}
								data={fontList.map(font => ({
									value: font?.family,
									label: font?.family,
								}))}
							/>
							{currentFont && (
								<Box style={{ marginTop: '1rem' }}>
									<SectionTitle>Font Weight</SectionTitle>

									<Select
										style={{ marginTop: '1rem' }}
										value={fontWeight}
										onChange={e => {
											setFontWeight(e as string);
											fetch(currentFont.files?.[e as string])
												.then(response => response.arrayBuffer())
												.then(arrayBuffer => {
													const fontBase64 = btoa(
														String.fromCharCode(...new Uint8Array(arrayBuffer)),
													);
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
													(currentSelectedElements?.[0] as fabric.Text)?.set(
														'fontWeight',
														e as string,
													);
													if (currentSelectedElements && currentSelectedElements) {
														const textElement = currentSelectedElements?.[0] as fabric.Text;
														textElement.set({
															data: {
																...textElement.data,
																weightGoogleFont: fontFaceRule,
															},
														});
														canvas.renderAll();
													}
													if (currentSelectedArtboards.length > 1) {
														dispatch(
															applyBulkEdit({
																element: currentSelectedElements?.[0],
																properties: {
																	fontWeight: e as string,
																},
															}),
														);
													}
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
							<div style={{ height: '15rem' }}></div>
							<div style={{ fontSize: '12px', color: 'grey' }}>
								We have collated most of the common fonts from Google Fonts list.
							</div>
						</div>
					</Tabs.Panel>

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
