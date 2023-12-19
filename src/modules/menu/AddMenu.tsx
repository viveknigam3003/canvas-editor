import { ActionIcon, Group, Tooltip } from '@mantine/core';
import { useDisclosure, useHotkeys } from '@mantine/hooks';
import { IconLayersSubtract, IconLetterT, IconPhoto, IconSquare } from '@tabler/icons-react';
import { fabric } from 'fabric';
import { Artboard } from '../../types';
import ImageModal from '../image/AddImage';
import { updateActiveArtboardLayers } from '../app/actions';
import { useDispatch } from 'react-redux';
import { generateId } from '../../utils';
import { FABRIC_JSON_ALLOWED_KEYS } from '../../constants';

type AddMenuProps = {
	artboardRef: React.RefObject<fabric.Rect>;
	selectedArtboard: Artboard | null;
	canvasRef: React.RefObject<fabric.Canvas>;
};

export default function AddMenu({ artboardRef, selectedArtboard, canvasRef }: AddMenuProps) {
	const [imageModalOpened, { open: openImageModal, close: closeImageModal }] = useDisclosure();
	const dispatch = useDispatch();
	const addText = () => {
		if (!selectedArtboard) {
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
	]);

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
				<Tooltip label="Add shape" openDelay={500}>
					<ActionIcon>
						<IconSquare
							onClick={() => {
								for (let index = 0; index < 10; index++) {
									const rect = new fabric.Rect({
										left: Math.random() * 1000,
										top: Math.random() * 1000,
										// random color
										fill: '#' + Math.floor(Math.random() * 16777215).toString(16),
										width: 100,
										height: 100,
										data: {
											displayText: 'Shape',
											id: generateId(),
										},
									});
									canvasRef.current?.add(rect);
								}
								canvasRef.current?.requestRenderAll();
							}}
							size={14}
						/>
					</ActionIcon>
				</Tooltip>
				<Tooltip label="Add preset" openDelay={500}>
					<ActionIcon>
						<IconLayersSubtract size={14} />
					</ActionIcon>
				</Tooltip>
			</Group>
			<ImageModal
				selectedArtboard={selectedArtboard}
				artboardRef={artboardRef}
				canvasRef={canvasRef}
				imageModalOpened={imageModalOpened}
				closeImageModal={closeImageModal}
			/>
		</>
	);
}
