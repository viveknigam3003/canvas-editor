import { Box, ColorInput, Group, NumberInput } from '@mantine/core';
import React, { useEffect, useState } from 'react';

interface ShadowProps {
	currentSelectedElement: fabric.Object;
	canvas: fabric.Canvas;
	artboardRef: React.RefObject<fabric.Rect>;
}

const Shadow: React.FC<ShadowProps> = ({ currentSelectedElement, canvas, artboardRef }) => {
	const artboardWidth = artboardRef.current?.width ?? 100;
	const artboardHeight = artboardRef.current?.height ?? 100;
	const [shadowValues, setShadowValues] = useState({
		offsetX: 0,
		offsetY: 0,
		blur: 0,
		color: '#000000',
	});

	useEffect(() => {
		const shadow = currentSelectedElement?.shadow as fabric.Shadow;
		setShadowValues({
			offsetX: shadow?.offsetX || 0,
			offsetY: shadow?.offsetY || 0,
			blur: shadow?.blur || 0,
			color: shadow?.color || '#000000',
		});
	}, [currentSelectedElement]);

	return (
		<Box>
			<Group spacing={8} grow>
				<NumberInput
					label="X"
					value={shadowValues.offsetX}
					onChange={e => {
						currentSelectedElement.set(
							'shadow',
							Object.assign({}, currentSelectedElement.shadow, { offsetX: e }),
						);
						setShadowValues(prev => ({ ...prev, offsetX: e as number }));
						canvas.requestRenderAll();
					}}
					min={-artboardWidth}
					max={artboardWidth}
					step={1}
				/>
				<NumberInput
					label="Y"
					value={shadowValues.offsetY}
					onChange={e => {
						currentSelectedElement.set(
							'shadow',
							Object.assign({}, currentSelectedElement.shadow, { offsetY: e }),
						);
						setShadowValues(prev => ({ ...prev, offsetY: e as number }));
						canvas.requestRenderAll();
					}}
					min={-artboardHeight}
					max={artboardHeight}
					step={1}
				/>
			</Group>
			<NumberInput
				label="Blur"
				value={shadowValues.blur}
				onChange={e => {
					currentSelectedElement.set('shadow', Object.assign({}, currentSelectedElement.shadow, { blur: e }));
					setShadowValues(prev => ({ ...prev, blur: e as number }));
					canvas.requestRenderAll();
				}}
				min={0}
				max={250}
				step={0.1}
				precision={1}
			/>
			<ColorInput
				label="Color"
				value={shadowValues.color}
				onChange={e => {
					currentSelectedElement.set(
						'shadow',
						Object.assign({}, currentSelectedElement.shadow, { color: e }),
					);
					setShadowValues(prev => ({ ...prev, color: e as string }));
					canvas.requestRenderAll();
				}}
				format="hexa"
			/>
		</Box>
	);
};

export default Shadow;
