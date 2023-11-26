import { Menu, ActionIcon, Box } from '@mantine/core';
import { IconSquare, IconPhoto, IconLayersSubtract, IconPencilPlus, IconLetterT } from '@tabler/icons-react';
import { fabric } from 'fabric';
import { Artboard } from '../types';
import { useDisclosure } from '@mantine/hooks';
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
	return (
		<Box>
			<Menu trigger="hover" shadow="md">
				<Menu.Target>
					<ActionIcon>
						<IconPencilPlus />
					</ActionIcon>
				</Menu.Target>
				<Menu.Dropdown>
					<Menu.Item onClick={addText} icon={<IconLetterT size={14} />}>
						Text
					</Menu.Item>
					<Menu.Item onClick={openImageModal} icon={<IconPhoto size={14} />}>
						Image
					</Menu.Item>
					<Menu.Item icon={<IconSquare size={14} />}>Shape</Menu.Item>
					<Menu.Item icon={<IconLayersSubtract size={14} />}>Preset</Menu.Item>
				</Menu.Dropdown>
			</Menu>
			<ImageModal
				selectedArtboard={selectedArtboard}
				artboardRef={artboardRef}
				canvasRef={canvasRef}
				imageModalOpened={imageModalOpened}
				closeImageModal={closeImageModal}
			/>
		</Box>
	);
}
