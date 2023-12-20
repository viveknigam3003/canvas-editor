import { Divider, Stack } from '@mantine/core';
import ImagePanel from '../modules/image/Panel';
import AlignmentPanel from '../modules/position/Alignment';
import TextPanel from '../modules/text/Panel';
import ClipMask from '../modules/clipmask';
import Position from '../modules/position';

type PanelProps = {
	canvas: fabric.Canvas;
	currentSelectedElements: fabric.Object[];
	artboardRef: React.RefObject<fabric.Rect>;
};

const Panel = ({ canvas, currentSelectedElements, artboardRef }: PanelProps) => {
	if (!currentSelectedElements.length) {
		return null;
	}

	return (
		<Stack>
			{currentSelectedElements.length === 1 && (
				<>
					<AlignmentPanel
						artboardRef={artboardRef}
						canvas={canvas}
						currentSelectedElements={currentSelectedElements}
					/>
					<Divider />
					<Position canvas={canvas} currentSelectedElements={currentSelectedElements} />
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
				</>
			)}
			{currentSelectedElements.length > 1 ? (
				<ClipMask currentSelectedElements={currentSelectedElements} canvas={canvas} />
			) : null}
		</Stack>
	);
};

export default Panel;
