import { Box, ColorInput, Group, NumberInput, Stack } from '@mantine/core';
import { useEffect, useState } from 'react';

interface PanelProps {
	canvas: fabric.Canvas;
	currentSelectedElement: fabric.Object[];
	artboardRef: React.RefObject<fabric.Rect>;
}

const ImagePanel = ({ canvas, currentSelectedElement, artboardRef }: PanelProps) => {
	const artboardWidth = artboardRef.current?.width ?? 100;
	const artboardHeight = artboardRef.current?.height ?? 100;
	const [shadowValues, setShadowValues] = useState({
		offsetX: 0,
		offsetY: 0,
		blur: 0,
		color: '#000000',
	});

	useEffect(() => {
		const shadow = (currentSelectedElement?.[0] as fabric.Image)?.shadow as fabric.Shadow;
		setShadowValues({
			offsetX: shadow?.offsetX || 0,
			offsetY: shadow?.offsetY || 0,
			blur: shadow?.blur || 0,
			color: shadow?.color || '#000000',
		});
	}, [currentSelectedElement]);

	return (
		<Stack>
			<Box>Shadow</Box>
			<Group spacing={8} grow>
				<NumberInput
					label="X"
					value={shadowValues.offsetX}
					onChange={e => {
						(currentSelectedElement?.[0] as fabric.Image)?.set(
							'shadow',
							Object.assign({}, (currentSelectedElement?.[0] as fabric.Image).shadow, { offsetX: e }),
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
						(currentSelectedElement?.[0] as fabric.Image)?.set(
							'shadow',
							Object.assign({}, (currentSelectedElement?.[0] as fabric.Image).shadow, { offsetY: e }),
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
					(currentSelectedElement?.[0] as fabric.Image)?.set(
						'shadow',
						Object.assign({}, (currentSelectedElement?.[0] as fabric.Image).shadow, { blur: e }),
					);
					setShadowValues(prev => ({ ...prev, blur: e as number }));
					canvas.requestRenderAll();
				}}
				min={0}
				max={250}
				precision={1}
				step={0.1}
			/>
			<ColorInput
				label="Color"
				value={shadowValues.color}
				onChange={e => {
					(currentSelectedElement?.[0] as fabric.Image)?.set(
						'shadow',
						Object.assign({}, (currentSelectedElement?.[0] as fabric.Image).shadow, { color: e }),
					);
					setShadowValues(prev => ({ ...prev, color: e as string }));
					canvas.requestRenderAll();
				}}
				format="hexa"
			/>
		</Stack>
	);
};

export default ImagePanel;
