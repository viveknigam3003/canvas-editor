import { Box, Select } from '@mantine/core';
import { useEffect, useState } from 'react';

const Panel = ({ canvas, currentSelectedElement }: any) => {
	const [fontList, setFontList] = useState([]);
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

	if (!currentSelectedElement || currentSelectedElement?.length !== 1) {
		return null;
	}
	console.log('value', value);
	return (
		<div>
			<Box>Text</Box>
			<Select
				value={value}
				onChange={e => {
					console.log('change', e);
					const font = fontList.find(font => font.family === e);
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
							currentSelectedElement?.[0]?.set('fontFamily', font.family);
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

export default Panel;
