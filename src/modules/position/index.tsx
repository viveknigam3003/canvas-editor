import { Divider, Group, NumberInput, Stack } from '@mantine/core';
import { useHotkeys } from '@mantine/hooks';
import { fabric } from 'fabric';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import SectionTitle from '../../components/SectionTitle';
import { RootState } from '../../store/rootReducer';
import { applyBulkEdit } from '../app/actions';
import { getKeyboardShortcuts } from '../keyboard/helpers';

interface PositionProps {
	canvas: fabric.Canvas;
	currentSelectedElements: fabric.Object[];
}

const Position: React.FC<PositionProps> = ({ canvas, currentSelectedElements }) => {
	const keyboardShortcuts = getKeyboardShortcuts();
	const dispatch = useDispatch();
	const currentSelectedArtboards = useSelector((state: RootState) => state.app.selectedArtboards);
	const [positionValues, setPositionValues] = useState({
		x: 0,
		y: 0,
		width: 0,
		height: 0,
		angle: 0,
	});

	useEffect(() => {
		const element = currentSelectedElements[0];
		if (!element) return;
		setPositionValues({
			x: element.left as number,
			y: element.top as number,
			width: element.getScaledWidth() as number,
			height: element.getScaledHeight() as number,
			angle: element.angle as number,
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
				dispatch(
					applyBulkEdit({
						element,
						properties: {
							left: element.left,
							top: element.top,
						},
					}),
				);
			}
		});
		element.on('resizing', () => {
			setPositionValues(prev => ({
				...prev,
				width: element.getScaledWidth() as number,
				height: element.getScaledHeight() as number,
			}));
			if (currentSelectedArtboards.length > 1) {
				dispatch(
					applyBulkEdit({
						element,
						properties: {
							scaleX: element.scaleX,
							scaleY: element.scaleY,
						},
					}),
				);
			}
		});
		element.on('scaling', () => {
			setPositionValues({
				x: element.left as number,
				y: element.top as number,
				width: element.getScaledWidth(),
				height: element.getScaledHeight() as number,
				angle: element.angle as number,
			});
			if (currentSelectedArtboards.length > 1) {
				dispatch(
					applyBulkEdit({
						element,
						properties: {
							left: element.left,
							top: element.top,
							scaleX: element.scaleX,
							scaleY: element.scaleY,
						},
					}),
				);
			}
		});
		element.on('rotating', () => {
			setPositionValues({
				x: element.left as number,
				y: element.top as number,
				width: element.getScaledWidth(),
				height: element.getScaledHeight() as number,
				angle: element.angle as number,
			});
			if (currentSelectedArtboards.length > 1) {
				dispatch(
					applyBulkEdit({
						element,
						properties: {
							left: element.left,
							top: element.top,
							scaleX: element.scaleX,
							scaleY: element.scaleY,
							angle: element.angle,
						},
					}),
				);
			}
		});

		return () => {
			element.off('moving');
			element.off('resizing');
			element.off('scaling');
			element.off('rotating');
		};
	}, [currentSelectedElements, currentSelectedArtboards]);

	useHotkeys([
		[
			keyboardShortcuts['Move up'],
			() => {
				const element = currentSelectedElements?.[0];
				if (!element) return;
				element?.set('top', element.top! - 1);
				setPositionValues(prev => ({ ...prev, y: element.top as number }));
				if (currentSelectedArtboards.length > 1) {
					dispatch(
						applyBulkEdit({
							element,
							properties: {
								top: element.top! - 1,
							},
						}),
					);
				}
				canvas.requestRenderAll();
			},
		],
		[
			keyboardShortcuts['Move down'],
			() => {
				const element = currentSelectedElements?.[0];
				if (!element) return;
				element?.set('top', element.top! + 1);
				setPositionValues(prev => ({ ...prev, y: element.top as number }));
				if (currentSelectedArtboards.length > 1) {
					dispatch(
						applyBulkEdit({
							element,
							properties: {
								top: element.top! + 1,
							},
						}),
					);
				}
				canvas.requestRenderAll();
			},
		],
		[
			keyboardShortcuts['Move left'],
			() => {
				const element = currentSelectedElements?.[0];
				if (!element) return;
				element?.set('left', element.left! - 1);
				setPositionValues(prev => ({ ...prev, x: element.left as number }));
				if (currentSelectedArtboards.length > 1) {
					dispatch(
						applyBulkEdit({
							element,
							properties: {
								left: element.left! - 1,
							},
						}),
					);
				}
				canvas.requestRenderAll();
			},
		],
		[
			keyboardShortcuts['Move right'],
			() => {
				const element = currentSelectedElements?.[0];
				if (!element) return;
				element?.set('left', element.left! + 1);
				setPositionValues(prev => ({ ...prev, x: element.left as number }));
				if (currentSelectedArtboards.length > 1) {
					dispatch(
						applyBulkEdit({
							element,
							properties: {
								left: element.left! + 1,
							},
						}),
					);
				}
				canvas.requestRenderAll();
			},
		],
		[
			keyboardShortcuts['Move up fast'],
			() => {
				const element = currentSelectedElements?.[0];
				if (!element) return;
				element?.set('top', element.top! - 10);
				setPositionValues(prev => ({ ...prev, y: element.top as number }));
				if (currentSelectedArtboards.length > 1) {
					dispatch(
						applyBulkEdit({
							element,
							properties: {
								top: element.top! - 10,
							},
						}),
					);
				}
				canvas.requestRenderAll();
			},
		],
		[
			keyboardShortcuts['Move down fast'],
			() => {
				const element = currentSelectedElements?.[0];
				if (!element) return;
				element?.set('top', element.top! + 10);
				setPositionValues(prev => ({ ...prev, y: element.top as number }));
				if (currentSelectedArtboards.length > 1) {
					dispatch(
						applyBulkEdit({
							element,
							properties: {
								top: element.top! + 10,
							},
						}),
					);
				}
				canvas.requestRenderAll();
			},
		],
		[
			keyboardShortcuts['Move left fast'],
			() => {
				const element = currentSelectedElements?.[0];
				if (!element) return;
				element?.set('left', element.left! - 10);
				setPositionValues(prev => ({ ...prev, x: element.left as number }));
				if (currentSelectedArtboards.length > 1) {
					dispatch(
						applyBulkEdit({
							element,
							properties: {
								left: element.left! - 10,
							},
						}),
					);
				}
				canvas.requestRenderAll();
			},
		],
		[
			keyboardShortcuts['Move right fast'],
			() => {
				const element = currentSelectedElements?.[0];
				if (!element) return;
				element?.set('left', element.left! + 10);
				setPositionValues(prev => ({ ...prev, x: element.left as number }));
				if (currentSelectedArtboards.length > 1) {
					dispatch(
						applyBulkEdit({
							element,
							properties: {
								left: element.left! + 10,
							},
						}),
					);
				}
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
						const element = currentSelectedElements?.[0];
						if (!element) return;
						element.set('left', e as number);
						setPositionValues(prev => ({ ...prev, x: e as number }));
						if (currentSelectedArtboards.length > 1) {
							dispatch(
								applyBulkEdit({
									element,
									properties: {
										left: e as number,
									},
								}),
							);
						}
						canvas.requestRenderAll();
					}}
					step={1}
				/>
				<NumberInput
					label="Y"
					value={positionValues.y}
					onChange={e => {
						const element = currentSelectedElements?.[0];
						if (!element) return;
						element.set('top', e as number);
						setPositionValues(prev => ({ ...prev, y: e as number }));
						if (currentSelectedArtboards.length > 1) {
							dispatch(
								applyBulkEdit({
									element,
									properties: {
										top: e as number,
									},
								}),
							);
						}
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
						if (currentSelectedArtboards.length > 1) {
							dispatch(
								applyBulkEdit({
									element,
									properties: {
										width: element.getScaledWidth() as number,
									},
								}),
							);
						}
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
						if (currentSelectedArtboards.length > 1) {
							dispatch(
								applyBulkEdit({
									element,
									properties: {
										height: element.getScaledHeight() as number,
									},
								}),
							);
						}
						canvas.requestRenderAll();
					}}
					step={1}
				/>
			</Group>
			<NumberInput
				label="Rotation"
				value={currentSelectedElements[0]?.angle}
				onChange={e => {
					const element = currentSelectedElements?.[0];
					if (!element) return;
					element.set('angle', e as number);
					if (currentSelectedArtboards.length > 1) {
						dispatch(
							applyBulkEdit({
								element,
								properties: {
									angle: element.angle,
								},
							}),
						);
					}
					canvas.requestRenderAll();
				}}
				step={1}
				min={0}
				max={360}
			/>
			<Divider />
		</Stack>
	);
};

export default Position;
