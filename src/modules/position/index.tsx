import { Group, NumberInput, Stack } from '@mantine/core';
import { useHotkeys } from '@mantine/hooks';
import { fabric } from 'fabric';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import SectionTitle from '../../components/SectionTitle';
import { RootState } from '../../store/rootReducer';
import { getBulkEditedArtboards } from '../utils/bulkEdit';
import { setArtboards } from '../app/actions';

interface PositionProps {
	canvas: fabric.Canvas;
	currentSelectedElements: fabric.Object[];
	currentSelectedArtboards: string[];
}

const Position: React.FC<PositionProps> = ({ canvas, currentSelectedElements, currentSelectedArtboards }) => {
	const dispatch = useDispatch();
	const artboards = useSelector((state: RootState) => state.app.artboards);
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
			if (currentSelectedArtboards.length > 1) {
				applyBulkEdit(element, { left: element.left, top: element.top });
			}
		});
		element.on('resizing', () => {
			setPositionValues(prev => ({
				...prev,
				width: element.getScaledWidth() as number,
				height: element.getScaledHeight() as number,
			}));
			if (currentSelectedArtboards.length > 1) {
				applyBulkEdit(element, {
					width: element.getScaledWidth(),
					height: element.getScaledHeight(),
				});
			}
		});
		element.on('scaling', () => {
			setPositionValues({
				x: element.left as number,
				y: element.top as number,
				width: element.getScaledWidth(),
				height: element.getScaledHeight() as number,
			});
			if (currentSelectedArtboards.length > 1) {
				applyBulkEdit(element, {
					left: element.left,
					top: element.top,
					width: element.getScaledWidth(),
					height: element.getScaledHeight(),
				});
			}
		});

		return () => {
			element.off('moving');
			element.off('resizing');
			element.off('scaling');
		};
	}, [currentSelectedElements, currentSelectedArtboards]);

	const applyBulkEdit = (element: fabric.Object, properties: Record<string, any>) => {
		const updated = getBulkEditedArtboards(element.data.id, properties, {
			artboards,
			selectedArtboards: currentSelectedArtboards,
		});
		dispatch(setArtboards(updated));
	};

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
