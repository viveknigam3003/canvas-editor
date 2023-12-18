import { Button, Stack, Text, useMantineTheme } from '@mantine/core';
import { fabric as Fabric } from 'fabric';
import React from 'react';
import SectionTitle from '../../components/SectionTitle';
import { generateId } from '../../utils';

interface ClipMaskProps {
	canvas: fabric.Canvas;
	currentSelectedElements: fabric.Object[];
}

const ClipMask: React.FC<ClipMaskProps> = ({ currentSelectedElements, canvas }) => {
	const theme = useMantineTheme();
	const createClipGroup = () => {
		const selectedObjects = currentSelectedElements;

		if (!selectedObjects || selectedObjects.length <= 1) return;

		// Assuming the first object is the mask
		const mask = selectedObjects[0];
		const contents = selectedObjects.slice(1);

		// Create a group with the mask and the contents
		const clipGroup = new Fabric.Group([mask, ...contents], {
			subTargetCheck: true,
			data: {
				id: generateId(),
				type: 'clipGroup',
			},
		});

		// Set the clip path
		clipGroup.clipPath = mask;

		// Remove individual objects and add the group
		selectedObjects.forEach(obj => canvas?.remove(obj));
		canvas?.add(clipGroup);

		canvas?.renderAll();
	};

	return (
		<Stack>
			<SectionTitle>Clipping mask</SectionTitle>
			<Button onClick={createClipGroup}>Create clip mask</Button>
			<Text size={'xs'} color={theme.colors.gray[6]}>
				First select the mask, then the elements to create a clipping mask group
			</Text>
		</Stack>
	);
};

export default ClipMask;
