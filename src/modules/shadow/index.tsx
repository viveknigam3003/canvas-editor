import { Box, ColorInput, Group, NumberInput } from '@mantine/core';
import React, { useEffect, useState } from 'react';

interface ShadowProps {
	currentSelectedElements: fabric.Object[];
	canvas: fabric.Canvas;
}

const Shadow: React.FC<ShadowProps> = ({ currentSelectedElements, canvas }) => {
	const xOffset = canvas.width ?? 100;
	const yOffset = canvas.height ?? 100;

	const [shadowValues, setShadowValues] = useState({
		offsetX: 0,
		offsetY: 0,
		blur: 0,
		color: '#000000',
	});

	useEffect(() => {
		const shadow = currentSelectedElements?.[0]?.shadow as fabric.Shadow;
		setShadowValues({
			offsetX: shadow?.offsetX || 0,
			offsetY: shadow?.offsetY || 0,
			blur: shadow?.blur || 0,
			color: shadow?.color || '#000000',
		});
	}, [currentSelectedElements]);

	return (
		<Box>
			<Group spacing={8} grow>
				<NumberInput
					label="X"
					value={shadowValues.offsetX}
					onChange={e => {
						currentSelectedElements?.[0].set(
							'shadow',
							Object.assign({}, currentSelectedElements?.[0].shadow, { offsetX: e }),
						);
						setShadowValues(prev => ({ ...prev, offsetX: e as number }));
						canvas.requestRenderAll();
					}}
					min={-xOffset}
					max={xOffset}
					step={1}
				/>
				<NumberInput
					label="Y"
					value={shadowValues.offsetY}
					onChange={e => {
						currentSelectedElements?.[0].set(
							'shadow',
							Object.assign({}, currentSelectedElements?.[0].shadow, { offsetY: e }),
						);
						setShadowValues(prev => ({ ...prev, offsetY: e as number }));
						canvas.requestRenderAll();
					}}
					min={-yOffset}
					max={yOffset}
					step={1}
				/>
			</Group>
			<NumberInput
				label="Blur"
				value={shadowValues.blur}
				onChange={e => {
					currentSelectedElements?.[0].set(
						'shadow',
						Object.assign({}, currentSelectedElements?.[0].shadow, { blur: e }),
					);
					setShadowValues(prev => ({ ...prev, blur: e as number }));
					canvas.requestRenderAll();
				}}
				min={0}
				max={250}
				step={0.1}
				precision={1}
			/>
			<ColorInput
				label="Shadow Color"
				value={shadowValues.color}
				onChange={e => {
					currentSelectedElements?.[0].set(
						'shadow',
						Object.assign({}, currentSelectedElements?.[0].shadow, { color: e }),
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
