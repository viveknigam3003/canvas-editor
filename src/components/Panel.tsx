import { Divider, Stack } from '@mantine/core';
import Animation from '../modules/animate';
import ClipMask from '../modules/clipmask';
import ImagePanel from '../modules/image/Panel';
import Position from '../modules/position';
import AlignmentPanel from '../modules/position/Alignment';
import TextPanel from '../modules/text/Panel';
import { RULER_LINES } from '../modules/ruler';
import Opacity from '../modules/opacity';
import ShapePanel from '../modules/shapes/ShapePanel';

type PanelProps = {
	canvas: fabric.Canvas;
	currentSelectedElements: fabric.Object[];
	artboardRef: React.RefObject<fabric.Rect>;
	saveArtboardChanges: () => void;
};

const Panel = ({ canvas, currentSelectedElements, artboardRef, saveArtboardChanges }: PanelProps) => {
	const isVideoEnabled = localStorage.getItem('video') === 'true';
	const isRulerLine = Object.values(RULER_LINES).includes(currentSelectedElements?.[0]?.data?.type);
	if (!currentSelectedElements.length || isRulerLine) {
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

					{currentSelectedElements?.[0]?.data.type === 'shape' && (
						<ShapePanel
							artboardRef={artboardRef}
							canvas={canvas}
							currentSelectedElements={currentSelectedElements}
						/>
					)}

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
					<Opacity
						canvas={canvas}
						currentSelectedElements={currentSelectedElements}
						saveArtboardChanges={saveArtboardChanges}
					/>
				</>
			)}
			{currentSelectedElements.length > 1 ? (
				<ClipMask currentSelectedElements={currentSelectedElements} canvas={canvas} />
			) : null}
			<Divider />
			{isVideoEnabled && (
				<Animation
					canvas={canvas}
					currentSelectedElements={currentSelectedElements}
					saveArtboardChanges={saveArtboardChanges}
				/>
			)}
		</Stack>
	);
};

export default Panel;
