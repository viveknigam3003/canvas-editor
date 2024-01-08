import { ActionIcon, Group, Tooltip } from '@mantine/core';
import { useDisclosure, useHotkeys } from '@mantine/hooks';
import { IconLetterT, IconPhoto } from '@tabler/icons-react';
import { fabric } from 'fabric';
import { useDispatch } from 'react-redux';
import { FABRIC_JSON_ALLOWED_KEYS } from '../../constants';
import { Artboard } from '../../types';
import { generateId } from '../../utils';
import { updateActiveArtboardLayers } from '../app/actions';
import { getArtboardCenter } from '../artboard/helpers';
import ImageModal from '../image/AddImage';
import ShapePopover from '../shapes/ShapePopover';

type AddMenuProps = {
	activeArtboard: Artboard | null;
	canvasRef: React.RefObject<fabric.Canvas>;
};

export default function AddMenu({ activeArtboard, canvasRef }: AddMenuProps) {
	const [imageModalOpened, { open: openImageModal, close: closeImageModal }] = useDisclosure();
	const dispatch = useDispatch();

	const addText = () => {
		if (!activeArtboard) {
			return;
		}

		const artboardCenter = getArtboardCenter(canvasRef.current, activeArtboard.id);
		const { x: centerX, y: centerY } = artboardCenter;

		const text = new fabric.Textbox('', {
			left: centerX,
			top: centerY,
			fontFamily: 'Inter',
			fontSize: 20,
			data: {
				displayText: 'Text',
				id: generateId(),
			},
		});

		canvasRef.current?.add(text);
		canvasRef.current?.setActiveObject(text);
		text.enterEditing();
		text.selectAll();
		dispatch(updateActiveArtboardLayers(canvasRef.current?.toJSON(FABRIC_JSON_ALLOWED_KEYS).objects || []));
	};

	useHotkeys([
		[
			'T',
			(event: KeyboardEvent) => {
				event.preventDefault();
				addText();
			},
		],
		[
			'I',
			(event: KeyboardEvent) => {
				event.preventDefault();
				openImageModal();
			},
		],
		[
			'R',
			(event: KeyboardEvent) => {
				event.preventDefault();
				addRectangle();
			},
		],
	]);

	const addRectangle = () => {
		if (!activeArtboard) {
			return;
		}
		const artboard = getArtboardCenter(canvasRef.current, activeArtboard.id);
		const { x: centerX, y: centerY } = artboard;

		const rect = new fabric.Rect({
			left: centerX,
			top: centerY,
			fill: '#e3e3e3',
			width: 100,
			height: 100,
			data: {
				displayText: 'Shape',
				id: generateId(),
			},
		});
		canvasRef.current?.add(rect);
		canvasRef.current?.requestRenderAll();
		dispatch(updateActiveArtboardLayers(canvasRef.current?.toJSON(FABRIC_JSON_ALLOWED_KEYS).objects || []));
	};

	return (
		<>
			<Group spacing={4}>
				<Tooltip label="Add text (T)" openDelay={500}>
					<ActionIcon onClick={addText}>
						<IconLetterT size={14} />
					</ActionIcon>
				</Tooltip>
				<Tooltip label="Add image (I)" openDelay={500}>
					<ActionIcon onClick={openImageModal}>
						<IconPhoto size={14} />
					</ActionIcon>
				</Tooltip>
				<ShapePopover canvasRef={canvasRef} activeArtboard={activeArtboard} />
			</Group>
			<ImageModal
				activeArtboard={activeArtboard}
				canvasRef={canvasRef}
				imageModalOpened={imageModalOpened}
				closeImageModal={closeImageModal}
			/>
		</>
	);
}
