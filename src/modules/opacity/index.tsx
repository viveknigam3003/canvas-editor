import { Divider, Group, NumberInput, Slider, Stack } from '@mantine/core';
import React, { useEffect, useState } from 'react';
import SectionTitle from '../../components/SectionTitle';

interface OpacityProps {
	currentSelectedElements: fabric.Object[];
	canvas: fabric.Canvas;
	saveArtboardChanges: () => void;
}

const Opacity: React.FC<OpacityProps> = ({ canvas, currentSelectedElements, saveArtboardChanges }) => {
	const [opacity, setOpacity] = useState(1);

	useEffect(() => {
		const opacity = currentSelectedElements?.[0]?.opacity;
		console.log('opacity', opacity);
		if (opacity) {
			setOpacity(opacity);
		}
	}, [currentSelectedElements]);

	const updateOpacity = (opacity: number) => {
		const element = currentSelectedElements?.[0];
		if (!element) return;
		element.set('opacity', opacity);
		setOpacity(opacity);
		canvas.requestRenderAll();
	};

	return (
		<Stack>
			<Divider />
			<SectionTitle>Opacity</SectionTitle>
			<Group>
				<Slider
					value={opacity}
					onChange={updateOpacity}
					min={0}
					max={1}
					step={0.01}
					precision={2}
					style={{ width: 150 }}
					onBlur={saveArtboardChanges}
				/>
				<NumberInput
					value={opacity}
					onChange={updateOpacity}
					min={0}
					max={1}
					step={0.01}
					precision={2}
					style={{ width: 80 }}
					onBlur={saveArtboardChanges}
				/>
			</Group>
		</Stack>
	);
};

export default Opacity;
