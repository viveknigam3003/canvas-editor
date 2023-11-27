import { Menu, ActionIcon, Box, Group, Tooltip, useMantineColorScheme } from '@mantine/core';
import { IconSquare, IconPhoto, IconLayersSubtract, IconPencilPlus, IconLetterT } from '@tabler/icons-react';
import { fabric } from 'fabric';
import { Artboard } from '../types';
import { useColorScheme, useDisclosure, useHotkeys } from '@mantine/hooks';
import ImageModal from './ImageModal';

type AddMenuProps = {
	artboardRef: React.RefObject<fabric.Rect>;
	selectedArtboard: Artboard | null;
	canvasRef: React.RefObject<fabric.Canvas>;
};

export default function AddMenu({ artboardRef, selectedArtboard, canvasRef }: AddMenuProps) {
	const [imageModalOpened, { open: openImageModal, close: closeImageModal }] = useDisclosure();
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
		const text = new fabric.Textbox('Edit this text', {
			left: centerX,
			top: centerY,
			fontFamily: 'Inter',
			fontSize: 20,
			width: width / 10,
		});
		canvasRef.current?.add(text);
		canvasRef.current?.setActiveObject(text);
		text.enterEditing();
		text.selectAll();
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
						<IconSquare size={14} />
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
