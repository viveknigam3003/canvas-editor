import { Group, NumberInput, Stack } from '@mantine/core';
import React, { useEffect, useState } from 'react';
import SectionTitle from '../../components/SectionTitle';
import { useHotkeys } from '@mantine/hooks';

interface PositionProps {
	canvas: fabric.Canvas;
	currentSelectedElements: fabric.Object[];
}

const Position: React.FC<PositionProps> = ({ canvas, currentSelectedElements }) => {
	const [positionValues, setPositionValues] = useState({
		x: 0,
		y: 0,
		width: 0,
		height: 0,
	});

	useEffect(() => {
		const element = currentSelectedElements[0];
		if (!element) return;
		setPositionValues({
			x: element.left as number,
			y: element.top as number,
			width: element.getScaledWidth() as number,
			height: element.getScaledHeight() as number,
		});
	}, [currentSelectedElements]);

	useEffect(() => {
		const element = currentSelectedElements[0];
		element.on('moving', () => {
			setPositionValues(prev => ({
				...prev,
				x: element.left as number,
				y: element.top as number,
			}));
		});
		element.on('resizing', () => {
			setPositionValues(prev => ({
				...prev,
				width: element.getScaledWidth() as number,
				height: element.getScaledHeight() as number,
			}));
		});
		element.on('scaling', () => {
			setPositionValues({
				x: element.left as number,
				y: element.top as number,
				width: element.getScaledWidth(),
				height: element.getScaledHeight() as number,
			});
		});
	}, [currentSelectedElements]);

	useHotkeys([
		[
			'ArrowUp',
			() => {
				const element = currentSelectedElements?.[0];
				if (!element) return;
				element?.set('top', element.top! - 1);
				setPositionValues(prev => ({ ...prev, y: element.top as number }));
				canvas.requestRenderAll();
			},
		],
		[
			'ArrowDown',
			() => {
				const element = currentSelectedElements?.[0];
				if (!element) return;
				element?.set('top', element.top! + 1);
				setPositionValues(prev => ({ ...prev, y: element.top as number }));
				canvas.requestRenderAll();
			},
		],
		[
			'ArrowLeft',
			() => {
				const element = currentSelectedElements?.[0];
				if (!element) return;
				element?.set('left', element.left! - 1);
				setPositionValues(prev => ({ ...prev, x: element.left as number }));
				canvas.requestRenderAll();
			},
		],
		[
			'ArrowRight',
			() => {
				const element = currentSelectedElements?.[0];
				if (!element) return;
				element?.set('left', element.left! + 1);
				setPositionValues(prev => ({ ...prev, x: element.left as number }));
				canvas.requestRenderAll();
			},
		],
		[
			'Alt+ArrowUp',
			() => {
				const element = currentSelectedElements?.[0];
				if (!element) return;
				element?.set('top', element.top! - 10);
				setPositionValues(prev => ({ ...prev, y: element.top as number }));
				canvas.requestRenderAll();
			},
		],
		[
			'Alt+ArrowDown',
			() => {
				const element = currentSelectedElements?.[0];
				if (!element) return;
				element?.set('top', element.top! + 10);
				setPositionValues(prev => ({ ...prev, y: element.top as number }));
				canvas.requestRenderAll();
			},
		],
		[
			'Alt+ArrowLeft',
			() => {
				const element = currentSelectedElements?.[0];
				if (!element) return;
				element?.set('left', element.left! - 10);
				setPositionValues(prev => ({ ...prev, x: element.left as number }));
				canvas.requestRenderAll();
			},
		],
		[
			'Alt+ArrowRight',
			() => {
				const element = currentSelectedElements?.[0];
				if (!element) return;
				element?.set('left', element.left! + 10);
				setPositionValues(prev => ({ ...prev, x: element.left as number }));
				canvas.requestRenderAll();
			},
		],
	]);

	return (
		<Stack>
			<SectionTitle>Position</SectionTitle>
			<Group grow>
				<NumberInput
					label="X"
					value={positionValues.x}
					onChange={e => {
						currentSelectedElements?.[0].set('left', e as number);
						setPositionValues(prev => ({ ...prev, x: e as number }));
						canvas.requestRenderAll();
					}}
					step={1}
				/>
				<NumberInput
					label="Y"
					value={positionValues.y}
					onChange={e => {
						currentSelectedElements?.[0].set('top', e as number);
						setPositionValues(prev => ({ ...prev, y: e as number }));
						canvas.requestRenderAll();
					}}
					step={1}
				/>
			</Group>
			<Group grow>
				<NumberInput
					label="Width"
					value={positionValues.width}
					onChange={e => {
						const element = currentSelectedElements?.[0];
						if (!element) return;
						// Set only scaled width
						element.set('scaleX', (e as number) / element.width!);
						setPositionValues(prev => ({ ...prev, width: element.getScaledWidth() as number }));
						canvas.requestRenderAll();
					}}
					step={1}
				/>
				<NumberInput
					label="Height"
					value={positionValues.height}
					onChange={e => {
						const element = currentSelectedElements?.[0];
						if (!element) return;
						// Set only scaled height
						element.set('scaleY', (e as number) / element.height!);
						setPositionValues(prev => ({ ...prev, height: element.getScaledHeight() as number }));
						canvas.requestRenderAll();
					}}
					step={1}
				/>
			</Group>
		</Stack>
	);
};

export default Position;
