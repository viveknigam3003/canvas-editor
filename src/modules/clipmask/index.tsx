import { Button, Stack, Text, useMantineTheme } from '@mantine/core';
import React from 'react';
import SectionTitle from '../../components/SectionTitle';
import { generateId } from '../../utils';
import { Canvas, FabricObject, Group } from 'fabric';

interface ClipMaskProps {
	canvas: Canvas;
	currentSelectedElements: FabricObject[];
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
		const clipGroup = new Group([mask, ...contents], {
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
