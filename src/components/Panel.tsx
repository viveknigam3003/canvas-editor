import { Divider, Stack } from '@mantine/core';
import ImagePanel from '../modules/image/Panel';
import AlignmentPanel from '../modules/position/Alignment';
import TextPanel from '../modules/text/Panel';

type PanelProps = {
	canvas: fabric.Canvas;
	currentSelectedElements: fabric.Object[];
	artboardRef: React.RefObject<fabric.Rect>;
};

const Panel = ({ canvas, currentSelectedElements, artboardRef }: PanelProps) => {
	if (!currentSelectedElements || currentSelectedElements?.length !== 1) {
		return null;
	}

	return (
		<Stack>
			<AlignmentPanel
				artboardRef={artboardRef}
				canvas={canvas}
				currentSelectedElements={currentSelectedElements}
			/>
			<Divider />
			{currentSelectedElements?.[0]?.type === 'textbox' && (
				<TextPanel
					artboardRef={artboardRef}
					canvas={canvas}
					currentSelectedElements={currentSelectedElements}
				/>
			)}
			{currentSelectedElements?.[0]?.type === 'image' && (
				<ImagePanel
					artboardRef={artboardRef}
					canvas={canvas}
					currentSelectedElements={currentSelectedElements}
				/>
			)}
		</Stack>
	);
};

export default Panel;
