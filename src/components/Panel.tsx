import { Stack } from '@mantine/core';
import ImagePanel from '../modules/image/Panel';
import AlignmentPanel from '../modules/position/Alignment';
import TextPanel from '../modules/text/Panel';

type PanelProps = {
	canvas: fabric.Canvas;
	currentSelectedElement: fabric.Object[];
	artboardRef: React.RefObject<fabric.Rect>;
};

const Panel = ({ canvas, currentSelectedElement, artboardRef }: PanelProps) => {
	if (!currentSelectedElement || currentSelectedElement?.length !== 1) {
		return null;
	}

	return (
		<Stack>
			<AlignmentPanel artboardRef={artboardRef} canvas={canvas} currentSelectedElement={currentSelectedElement} />
			{currentSelectedElement?.[0]?.type === 'textbox' && (
				<TextPanel artboardRef={artboardRef} canvas={canvas} currentSelectedElement={currentSelectedElement} />
			)}
			{currentSelectedElement?.[0]?.type === 'image' && (
				<ImagePanel artboardRef={artboardRef} canvas={canvas} currentSelectedElement={currentSelectedElement} />
			)}
		</Stack>
	);
};

export default Panel;
