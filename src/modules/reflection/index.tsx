import React, { useEffect, useState } from 'react';
import { PhoenixObject, createReflection, updateReflection } from '../reflection/helpers';
import { Checkbox } from '@mantine/core';

interface ReflectionProps {
	currentSelectedElement: fabric.Object[];
	canvas: fabric.Canvas;
}

const Reflection: React.FC<ReflectionProps> = ({ currentSelectedElement, canvas }) => {
	const [reflection, setReflection] = useState(false);

	useEffect(() => {
		if ((currentSelectedElement?.[0] as PhoenixObject).reflection) {
			setReflection(true);
		} else {
			setReflection(false);
		}
	}, [currentSelectedElement]);

	useEffect(() => {
		const element = currentSelectedElement?.[0] as PhoenixObject;
		const reflection = (currentSelectedElement?.[0] as PhoenixObject).reflection as fabric.Textbox;
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
	}, [canvas, currentSelectedElement]);

	useEffect(() => {
		if (reflection) {
			currentSelectedElement?.[0].on('moving', () => {
				console.log('moving');
				updateReflection(currentSelectedElement?.[0], canvas);
			});

			currentSelectedElement?.[0].on('scaling', () => {
				console.log('scaling');
				updateReflection(currentSelectedElement?.[0], canvas);
			});

			currentSelectedElement?.[0].on('rotating', event => {
				console.log('rotating', event);
				updateReflection(currentSelectedElement?.[0], canvas);
			});
		}

		return () => {
			currentSelectedElement?.[0].off('moving');
			currentSelectedElement?.[0].off('scaling');
			currentSelectedElement?.[0].off('rotating');
		};
	}, [currentSelectedElement, canvas, reflection]);
	return (
		<Checkbox
			label="Apply reflection"
			checked={reflection}
			onChange={e => {
				setReflection(e.currentTarget.checked);
				console.log('Checked?', e.currentTarget.checked);
				if (e.currentTarget.checked) {
					console.log('Creating reflection', currentSelectedElement?.[0]);
					createReflection(currentSelectedElement?.[0] as PhoenixObject, canvas);
					canvas.requestRenderAll();
				} else {
					console.log('Removing reflection', currentSelectedElement?.[0]);
					// Remove reflection from canvas
					const reflection = canvas
						.getObjects()
						.find(
							object =>
								object.data.type === 'reflection' &&
								object.data.parent === currentSelectedElement?.[0].data.id,
						);
					if (reflection) {
						canvas.remove(reflection);
					}
					// Remove reflection from object
					(currentSelectedElement?.[0] as PhoenixObject).reflection = null;
					canvas.requestRenderAll();
				}
			}}
		/>
	);
};

export default Reflection;
