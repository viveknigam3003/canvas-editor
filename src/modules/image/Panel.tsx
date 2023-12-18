import { Divider, Stack } from '@mantine/core';
import SectionTitle from '../../components/SectionTitle';
import Shadow from '../shadow';
import Reflection from '../reflection';

interface PanelProps {
	canvas: fabric.Canvas;
	currentSelectedElements: fabric.Object[];
	artboardRef: React.RefObject<fabric.Rect>;
}

const ImagePanel = ({ canvas, currentSelectedElements, artboardRef }: PanelProps) => {
	return (
		<Stack>
			<Stack>
				<SectionTitle>Shadow</SectionTitle>
				<Shadow currentSelectedElements={currentSelectedElements} canvas={canvas} artboardRef={artboardRef} />
			</Stack>
			<Divider />
			<Stack>
				<SectionTitle>Reflection</SectionTitle>
				<Reflection currentSelectedElements={currentSelectedElements} canvas={canvas} />
			</Stack>
		</Stack>
	);
};

export default ImagePanel;
