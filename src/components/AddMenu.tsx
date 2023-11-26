import { Menu, ActionIcon } from '@mantine/core';
import { IconSettings, IconPhoto, IconTrash, IconArrowsLeftRight, IconPencilPlus } from '@tabler/icons-react';
import { fabric } from 'fabric';
import { Artboard } from '../types';

type AddMenuProps = {
	artboardRef: React.RefObject<fabric.Rect>;
	selectedArtboard: Artboard | null;
	canvasRef: React.RefObject<fabric.Canvas>;
	openImageModal: () => void;
};

export default function AddMenu({ artboardRef, selectedArtboard, canvasRef, openImageModal }: AddMenuProps) {
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
		<Menu trigger="hover" shadow="md">
			<Menu.Target>
				<ActionIcon>
					<IconPencilPlus />
				</ActionIcon>
			</Menu.Target>

			<Menu.Dropdown>
				<Menu.Item onClick={addText} icon={<IconSettings size={14} />}>
					Text
				</Menu.Item>
				<Menu.Item onClick={openImageModal} icon={<IconPhoto size={14} />}>
					Image
				</Menu.Item>
				<Menu.Item icon={<IconArrowsLeftRight size={14} />}>Shape</Menu.Item>
				<Menu.Item color="red" icon={<IconTrash size={14} />}>
					Preset
				</Menu.Item>
			</Menu.Dropdown>
		</Menu>
	);
}
