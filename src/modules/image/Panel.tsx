import { Box, Stack } from '@mantine/core';
import Shadow from '../shadow';

interface PanelProps {
	canvas: fabric.Canvas;
	currentSelectedElements: fabric.Object[];
	artboardRef: React.RefObject<fabric.Rect>;
}

const ImagePanel = ({ canvas, currentSelectedElements, artboardRef }: PanelProps) => {
	return (
		<Stack>
			<Box>Shadow</Box>
			<Shadow currentSelectedElements={currentSelectedElements} canvas={canvas} artboardRef={artboardRef} />
		</Stack>
	);
};

export default ImagePanel;
