import { Stack } from '@mantine/core';
import SectionTitle from '../../components/SectionTitle';
import Shadow from '../shadow';

interface PanelProps {
	canvas: fabric.Canvas;
	currentSelectedElements: fabric.Object[];
	artboardRef: React.RefObject<fabric.Rect>;
}

const ImagePanel = ({ canvas, currentSelectedElements, artboardRef }: PanelProps) => {
	return (
		<Stack>
			<SectionTitle>Shadow</SectionTitle>
			<Shadow currentSelectedElements={currentSelectedElements} canvas={canvas} artboardRef={artboardRef} />
		</Stack>
	);
};

export default ImagePanel;
