import React, { useEffect, useState } from 'react';
import { SmartObject, createReflection, updateReflection } from '../reflection/helpers';
import { Checkbox } from '@mantine/core';

interface ReflectionProps {
	currentSelectedElements: fabric.Object[];
	canvas: fabric.Canvas;
}

const Reflection: React.FC<ReflectionProps> = ({ currentSelectedElements, canvas }) => {
	const [reflection, setReflection] = useState(false);

	useEffect(() => {
		if ((currentSelectedElements?.[0] as SmartObject).effects?.reflection) {
			setReflection(true);
		} else {
			setReflection(false);
		}
	}, [currentSelectedElements]);

	useEffect(() => {
		const element = currentSelectedElements?.[0] as SmartObject;
		const reflection = (currentSelectedElements?.[0] as SmartObject).effects?.reflection as fabric.Textbox;
		if (reflection && element.type === 'textbox') {
			element.on('resizing', () => {
				reflection.width = element.width;
				reflection.height = element.height;
				updateReflection(element, canvas);
			});

			element.on('changed', () => {
				reflection.text = (element as unknown as fabric.Textbox).text;
				canvas.requestRenderAll();
				updateReflection(element, canvas);
			});
		}

		return () => {
			element.off('resizing');
			element.off('changed');
		};
	}, [canvas, currentSelectedElements]);

	useEffect(() => {
		const element = currentSelectedElements?.[0] as SmartObject;
		if (reflection) {
			element.on('moving', () => {
				updateReflection(element, canvas);
			});

			currentSelectedElements?.[0].on('scaling', () => {
				updateReflection(element, canvas);
			});

			currentSelectedElements?.[0].on('rotating', () => {
				updateReflection(element, canvas);
			});
		}

		return () => {
			element.off('moving');
			element.off('scaling');
			element.off('rotating');
		};
	}, [currentSelectedElements, canvas, reflection]);
	return (
		<Checkbox
			label="Show reflection"
			checked={reflection}
			onChange={e => {
				setReflection(e.currentTarget.checked);
				console.log('Checked?', e.currentTarget.checked);
				if (e.currentTarget.checked) {
					console.log('Creating reflection', currentSelectedElements?.[0]);
					createReflection(currentSelectedElements?.[0] as SmartObject, canvas);
					canvas.requestRenderAll();
				} else {
					console.log('Removing reflection', currentSelectedElements?.[0]);
					// Remove reflection from canvas
					const reflection = canvas
						.getObjects()
						.find(
							object =>
								object.data.type === 'reflection' &&
								object.data.parent === currentSelectedElements?.[0].data.id,
						);
					if (reflection) {
						canvas.remove(reflection);
						(currentSelectedElements?.[0] as SmartObject).set('effects', {
							...(currentSelectedElements?.[0] as SmartObject).effects,
							reflection: null,
						});
					}
					const reflectionOverlay = canvas
						.getObjects()
						.find(
							object =>
								object.data.type === 'reflectionOverlay' &&
								object.data.parent === currentSelectedElements?.[0].data.id,
						);

					if (reflectionOverlay) {
						canvas.remove(reflectionOverlay);
						(currentSelectedElements?.[0] as SmartObject).set('effects', {
							...(currentSelectedElements?.[0] as SmartObject).effects,
							reflectionOverlay: null,
						});
					}
					// Remove reflection from object
					canvas.requestRenderAll();
				}
			}}
		/>
	);
};

export default Reflection;
