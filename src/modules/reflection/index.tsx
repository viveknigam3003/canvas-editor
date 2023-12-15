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
		if ((currentSelectedElements?.[0] as SmartObject).reflection) {
			setReflection(true);
		} else {
			setReflection(false);
		}
	}, [currentSelectedElements]);

	useEffect(() => {
		const element = currentSelectedElements?.[0] as SmartObject;
		const reflection = (currentSelectedElements?.[0] as SmartObject).reflection as fabric.Textbox;
		if (reflection && element.type === 'textbox') {
			element.on('resizing', () => {
				reflection.width = element.width;
				reflection.height = element.height;
				updateReflection(element, canvas);
			});

			element.on('changed', () => {
				reflection.text = (element as fabric.Textbox).text;
				canvas.requestRenderAll();
				updateReflection(element, canvas);
			});
		}
	}, [canvas, currentSelectedElements]);

	useEffect(() => {
		if (reflection) {
			currentSelectedElements?.[0].on('moving', () => {
				console.log('moving');
				updateReflection(currentSelectedElements?.[0], canvas);
			});

			currentSelectedElements?.[0].on('scaling', () => {
				console.log('scaling');
				updateReflection(currentSelectedElements?.[0], canvas);
			});

			currentSelectedElements?.[0].on('rotating', event => {
				console.log('rotating', event);
				updateReflection(currentSelectedElements?.[0], canvas);
			});
		}

		return () => {
			currentSelectedElements?.[0].off('moving');
			currentSelectedElements?.[0].off('scaling');
			currentSelectedElements?.[0].off('rotating');
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
					}
					// Remove reflection from object
					(currentSelectedElements?.[0] as SmartObject).reflection = null;
					canvas.requestRenderAll();
				}
			}}
		/>
	);
};

export default Reflection;
