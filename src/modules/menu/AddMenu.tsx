import { ActionIcon, Group, Tooltip } from '@mantine/core';
import { useDisclosure, useHotkeys } from '@mantine/hooks';
import { IconLetterT, IconPhoto } from '@tabler/icons-react';
import { fabric } from 'fabric';
import { useDispatch } from 'react-redux';
import { FABRIC_JSON_ALLOWED_KEYS } from '../../constants';
import { Artboard } from '../../types';
import { generateId } from '../../utils';
import { updateActiveArtboardLayers } from '../app/actions';
import ImageModal from '../image/AddImage';
import ShapePopover from '../shapes/ShapePopover';

type AddMenuProps = {
	artboardRef: React.RefObject<fabric.Rect>;
	activeArtboard: Artboard | null;
	canvasRef: React.RefObject<fabric.Canvas>;
};

export default function AddMenu({ artboardRef, activeArtboard, canvasRef }: AddMenuProps) {
	const [imageModalOpened, { open: openImageModal, close: closeImageModal }] = useDisclosure();
	const dispatch = useDispatch();
	const addText = () => {
		if (!activeArtboard) {
			return;
		}
		if (!artboardRef.current) {
			return;
		}
		const left = artboardRef.current.left;
		const top = artboardRef.current.top;
		const width = artboardRef.current.width;
		const height = artboardRef.current.height;
		if (!left || !top || !width || !height) {
			return;
		}
		// calculate the center of the artboard
		const centerX = left + width / 2;
		const centerY = top + height / 2;
		const text = new fabric.Textbox('', {
			left: centerX,
			top: centerY,
			fontFamily: 'Inter',
			fontSize: 20,
			width: width / 10,
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
		if (!artboardRef.current) {
			return;
		}
		const left = artboardRef.current.left;
		const top = artboardRef.current.top;
		const width = artboardRef.current.width;
		const height = artboardRef.current.height;
		if (!left || !top || !width || !height) {
			return;
		}
		// calculate the center of the artboard
		const centerX = left + width / 2;
		const centerY = top + height / 2;
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
				<ShapePopover canvasRef={canvasRef} />
			</Group>
			<ImageModal
				activeArtboard={activeArtboard}
				artboardRef={artboardRef}
				canvasRef={canvasRef}
				imageModalOpened={imageModalOpened}
				closeImageModal={closeImageModal}
			/>
		</>
	);
}
