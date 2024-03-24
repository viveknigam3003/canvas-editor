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
import { ImageContainer } from '../fabricContainer/ImageContainer';
import { TextContainer } from '../fabricContainer/TextContainer';
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
			fontSize: 40,
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

	const addTextBox = () => {
		const containerWidth = 300;
		const containerHeight = 300;
		const container = new TextContainer({
			text: 'Hello World',
			width: containerWidth,
			height: containerHeight,
			data: {
				id: 'textcontainer',
			},
			properties: {
				padding: {
					top: 20,
				},
				fill: 'red',
				radius: {
					tl: 20,
					tr: 20,
					br: 20,
					bl: 20,
				},
				// fill: '#e3e3e3',
				// border: {
				// 	color: 'blue',
				// 	style: 'dashed',
				// 	// top: 8,
				// 	bottom: 5,
				// 	left: 5,
				// 	right: 5,
				// },
			},
		}) as fabric.ImageContainer;
		canvasRef.current?.add(container);
		canvasRef.current?.requestRenderAll();
	};
	const addImageFromUrl = async () => {
		const src_2 =
			'https://images.unsplash.com/photo-1709325454201-e81c76d0487c?q=80&w=2871&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';

		const containerWidth = 300;
		const containerHeight = 300;

		const canvas = canvasRef.current;
		const artboardId = activeArtboard?.id;

		if (!canvas || !artboardId) {
			return;
		}

		const container = new ImageContainer({
			width: containerWidth,
			height: containerHeight,
			data: {
				id: generateId(),
			},
			src: src_2,
			properties: {
				objectFit: 'fill',
				fill: '#e3e3e3',
				border: {
					color: 'blue',
					top: 4,
					bottom: 4,
					left: 4,
					right: 4,
				},
			},
		}) as fabric.ImageContainer;

		// const oc = new ObjectContainer({
		// 	width: 100,
		// 	height: 100,
		// 	data: {
		// 		id: generateId(),
		// 	},
		// 	left: 100,
		// 	top: 100,
		// 	properties: {
		// 		radius: { tr: 20, br: 0, bl: 20, tl: 0 },
		// 		fill: '#e3e3e3',
		// 		border: {
		// 			color: 'red',
		// 			style: 'solid',
		// 			top: 2,
		// 			bottom: 2,
		// 			left: 2,
		// 			right: 2,
		// 		},
		// 	},
		// }) as fabric.ObjectContainer;

		// const rr = new RoundedRect({
		// 	width: 100,
		// 	height: 100,
		// 	fill: '#fff820',
		// 	cornerSmoothing: 0.1,
		// 	cornerRadius: { tl: 20, tr: 10, br: 0, bl: 20 },
		// 	left: 100,
		// 	top: 100,
		// 	data: {
		// 		id: generateId(),
		// 	},
		// });
		// canvas.add(rr);

		await container.loadImage();
		canvas.add(container);
		// canvas.add(oc);
		const obj = container.getObject();
		canvas.requestRenderAll();
		container.on('mousedblclick', () => {
			console.log('dblclick');
			canvas.setActiveObject(obj);
			// canvas.setActiveObject(obj);
		});

		obj.on('deselected', function () {
			console.log('selection cleared');
		});
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
				<Tooltip label="Add Textbox (I)" openDelay={500}>
					<ActionIcon onClick={addTextBox}>
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
