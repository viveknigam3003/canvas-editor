import { ActionIcon, Group, Tooltip, useMantineTheme } from '@mantine/core';
import { useDisclosure, useHotkeys } from '@mantine/hooks';
import { IconLetterT, IconPhoto, IconPhotoCircle } from '@tabler/icons-react';
import { fabric } from 'fabric';
import { useDispatch } from 'react-redux';
import { FABRIC_JSON_ALLOWED_KEYS } from '../../constants';
import { Artboard } from '../../types';
import { generateId } from '../../utils';
import { updateActiveArtboardLayers } from '../app/actions';
import { getArtboardCenter } from '../artboard/helpers';
import ImageModal from '../image/AddImage';
import { getKeyboardShortcuts } from '../keyboard/helpers';
import ShapePopover from '../shapes/ShapePopover';

type AddMenuProps = {
	activeArtboard: Artboard | null;
	canvasRef: React.RefObject<fabric.Canvas>;
	saveArtboardChanges: () => void;
};

export default function AddMenu({ activeArtboard, canvasRef, saveArtboardChanges }: AddMenuProps) {
	const [imageModalOpened, { open: openImageModal, close: closeImageModal }] = useDisclosure();
	const keyboardShortcuts = getKeyboardShortcuts();
	const theme = useMantineTheme();
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
		saveArtboardChanges();
	};

	useHotkeys([
		[
			keyboardShortcuts['Add text element'],
			(event: KeyboardEvent) => {
				event.preventDefault();
				addText();
			},
		],
		[
			keyboardShortcuts['Add image element'],
			(event: KeyboardEvent) => {
				event.preventDefault();
				openImageModal();
			},
		],
		[
			keyboardShortcuts['Add rectangle element'],
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
				type: 'shape',
				displayText: 'Shape',
				id: generateId(),
			},
		});
		canvasRef.current?.add(rect);
		canvasRef.current?.requestRenderAll();
		dispatch(updateActiveArtboardLayers(canvasRef.current?.toJSON(FABRIC_JSON_ALLOWED_KEYS).objects || []));
		saveArtboardChanges();
	};

	const addImageFromUrl = async () => {
		// const src =
		// 'https://ik.imagekit.io/mfsshclpl/A%20man%20and%20a%20woman%20walking%20in%20the%20desert.jpg?updatedAt=1699352535525';
		const src_2 =
			'https://images.unsplash.com/photo-1709325454201-e81c76d0487c?q=80&w=2871&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';

		const containerWidth = 300;
		const containerHeight = 300;

		const image = await new Promise<fabric.Image>(resolve => {
			fabric.Image.fromURL(src_2, resolve, { crossOrigin: 'anonymous' });
		});

		const canvas = canvasRef.current;
		const artboardId = activeArtboard?.id;

		if (!canvas || !artboardId) {
			return;
		}

		image.set({
			data: {
				id: generateId(),
			},
			originX: 'center',
			originY: 'center',
		});

		const container = new fabric.Group([image], {
			left: 0,
			top: 0,
			width: containerWidth,
			height: containerHeight,
			objectCaching: false,
			data: {
				id: generateId(),
			},
			name: 'My Image',
		});

		// Calculate scale based on if the image is wider or taller than the container
		// If the image is taller, we will scale it to the width of the container
		// If the image is wider, we will scale it to the height of the container
		const isWide = image.width! / image.height! > container.width! / container.height!;
		if (isWide) {
			image.scaleToHeight(containerHeight);
		} else {
			image.scaleToWidth(containerWidth);
		}

		container.clipPath = new fabric.Rect({
			left: -container.width! / 2,
			top: -container.height! / 2,
			width: containerWidth,
			height: containerHeight,
		});
		container.setCoords();
		canvas.add(container);
		canvas.requestRenderAll();
		dispatch(updateActiveArtboardLayers(canvasRef.current?.toJSON(FABRIC_JSON_ALLOWED_KEYS).objects || []));
		saveArtboardChanges();
	};

	return (
		<>
			<Group spacing={4}>
				<Tooltip label="Add text (T)" openDelay={500}>
					<ActionIcon onClick={addText}>
						<IconLetterT
							size={14}
							color={theme.colorScheme === 'dark' ? theme.colors.gray[5] : theme.colors.gray[7]}
						/>
					</ActionIcon>
				</Tooltip>
				<Tooltip label="Add image (I)" openDelay={500}>
					<ActionIcon onClick={openImageModal}>
						<IconPhoto
							size={14}
							color={theme.colorScheme === 'dark' ? theme.colors.gray[5] : theme.colors.gray[7]}
						/>
					</ActionIcon>
				</Tooltip>
				<ShapePopover canvasRef={canvasRef} activeArtboard={activeArtboard} />
				<Tooltip label="Add image (I)" openDelay={500}>
					<ActionIcon onClick={addImageFromUrl}>
						<IconPhotoCircle
							size={14}
							color={theme.colorScheme === 'dark' ? theme.colors.gray[5] : theme.colors.gray[7]}
						/>
					</ActionIcon>
				</Tooltip>
			</Group>
			<ImageModal
				activeArtboard={activeArtboard}
				canvasRef={canvasRef}
				imageModalOpened={imageModalOpened}
				closeImageModal={closeImageModal}
				saveArtboardChanges={saveArtboardChanges}
			/>
		</>
	);
}
