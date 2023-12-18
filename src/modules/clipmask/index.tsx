import { Box, Button } from '@mantine/core';
import { fabric as Fabric } from 'fabric';
import React from 'react';
import SectionTitle from '../../components/SectionTitle';

interface ClipMaskProps {
	canvas: fabric.Canvas;
	currentSelectedElements: fabric.Object[];
}

const ClipMask: React.FC<ClipMaskProps> = ({ currentSelectedElements, canvas }) => {
	const createClipGroup = () => {
		const selectedObjects = currentSelectedElements;

		if (!selectedObjects || selectedObjects.length <= 1) return;

		// Assuming the first object is the mask
		const mask = selectedObjects[0];
		const contents = selectedObjects.slice(1);

		// Create a group with the mask and the contents
		const clipGroup = new Fabric.Group([mask, ...contents], {
			subTargetCheck: true,
			left: currentSelectedElements[0].left,
			top: currentSelectedElements[0].top,
		});

		// Set the clip path
		clipGroup.clipPath = mask;

		// Remove individual objects and add the group
		selectedObjects.forEach(obj => canvas?.remove(obj));
		canvas?.add(clipGroup);

		canvas?.renderAll();
	};

	return (
		<Box>
			<SectionTitle>Clipping mask</SectionTitle>
			<Button onClick={createClipGroup}>Create clip mask</Button>
		</Box>
	);
};

export default ClipMask;
