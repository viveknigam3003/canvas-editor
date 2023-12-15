import { Box, Stack } from '@mantine/core';
import Shadow from '../shadow';

interface PanelProps {
	canvas: fabric.Canvas;
	currentSelectedElement: fabric.Object[];
	artboardRef: React.RefObject<fabric.Rect>;
}

const ImagePanel = ({ canvas, currentSelectedElement, artboardRef }: PanelProps) => {
	return (
		<Stack>
			<Box>Shadow</Box>
			<Shadow currentSelectedElement={currentSelectedElement?.[0]} canvas={canvas} artboardRef={artboardRef} />
		</Stack>
	);
};

export default ImagePanel;
