import { Divider, Stack } from '@mantine/core';
import SectionTitle from '../../components/SectionTitle';
import Reflection from '../reflection';
import Shadow from '../shadow';

interface PanelProps {
	canvas: fabric.Canvas;
	currentSelectedElements: fabric.Object[];
}

const ImagePanel = ({ canvas, currentSelectedElements }: PanelProps) => {
	return (
		<Stack>
			<Stack>
				<SectionTitle>Shadow</SectionTitle>
				<Shadow currentSelectedElements={currentSelectedElements} canvas={canvas} />
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
