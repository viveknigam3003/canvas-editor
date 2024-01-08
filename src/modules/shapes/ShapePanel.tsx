import { ColorInput, Divider, Stack } from '@mantine/core';
import SectionTitle from '../../components/SectionTitle';
import Shadow from '../shadow';
import Reflection from '../reflection';
import { useEffect, useState } from 'react';

interface PanelProps {
	canvas: fabric.Canvas;
	currentSelectedElements: fabric.Object[];
}

const ShapePanel = ({ canvas, currentSelectedElements }: PanelProps) => {
	const [selectedFontColor, setSelectedFontColor] = useState('#000000');

	useEffect(() => {
		setSelectedFontColor(currentSelectedElements?.[0]?.fill as string);
	}, [currentSelectedElements]);

	return (
		<Stack>
			<Stack>
				<SectionTitle>Color</SectionTitle>
				<ColorInput
					value={selectedFontColor}
					onChange={e => {
						console.log('first', currentSelectedElements);
						currentSelectedElements?.[0].set('fill', e);
						currentSelectedElements?.[0].set('stroke', e);
						setSelectedFontColor(e as string);
						canvas.requestRenderAll();
					}}
					format="hexa"
				/>
			</Stack>
			<Divider />
			<Stack>
				<SectionTitle>Shadow</SectionTitle>
				<Shadow currentSelectedElements={currentSelectedElements} canvas={canvas} />
			</Stack>
			<Divider />
			<Stack>
				<SectionTitle>Reflection</SectionTitle>
				<Reflection currentSelectedElements={currentSelectedElements} canvas={canvas} />
			</Stack>
		</Stack>
	);
};

export default ShapePanel;
