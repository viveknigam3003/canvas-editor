import { Button, FileInput, Modal, Stack, Tabs, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconLinkPlus, IconPhoto, IconSettings, IconShape, IconUpload, IconVideo } from '@tabler/icons-react';
import { fabric } from 'fabric';
import { useDispatch } from 'react-redux';
import { FABRIC_JSON_ALLOWED_KEYS } from '../../constants';
import { updateActiveArtboardLayers } from '../../modules/app/actions';
import { useModalStyles } from '../../styles/modal';
import { Artboard } from '../../types';
import { generateId } from '../../utils';
import { addVideoToCanvas, getElementScale, getScaledPosition } from './helpers';
import { getArtboardObject } from '../artboard/helpers';

type ImageModalProps = {
	imageModalOpened: boolean;
	closeImageModal: () => void;
	activeArtboard?: Artboard | null;
	canvasRef: React.MutableRefObject<fabric.Canvas | null>;
	saveArtboardChanges: () => void;
};

const ImageModal = ({
	imageModalOpened,
	closeImageModal,
	activeArtboard,
	canvasRef,
	saveArtboardChanges,
}: ImageModalProps) => {
	const dispatch = useDispatch();
	const { classes: modalClasses } = useModalStyles();
	const imageForm = useForm<{ url: string }>({
		initialValues: {
			url: '',
		},
		validate: values => {
			const errors: Record<string, string> = {};
			if (values.url.trim().length === 0) {
				errors.url = 'Image url cannot be empty';
			}
			return errors;
		},
	});

	const addImageFromUrl = (url: string) => {
		fabric.Image.fromURL(
			url,
			img => {
				const canvas = canvasRef.current;
				const artboardId = activeArtboard?.id;

				if (!canvas || !artboardId) {
					return;
				}

				const artboard = getArtboardObject(canvas, artboardId);

				const { left, top } = getScaledPosition(artboard);
				const scale = getElementScale(img, artboard);

				console.log('Scale = ', scale);

				img.set({
					left,
					top,
					scaleX: scale,
					scaleY: scale,
					data: {
						id: generateId(),
					},
					name: 'My Image',
				});

				canvasRef.current?.add(img);
				canvasRef.current?.setActiveObject(img);
				imageForm.reset();
				dispatch(updateActiveArtboardLayers(canvasRef.current?.toJSON(FABRIC_JSON_ALLOWED_KEYS).objects || []));
				saveArtboardChanges();
				closeImageModal();
			},
			{
				crossOrigin: 'anonymous',
			},
		);
	};

	const addSvgFromUrl = (url: string) => {
		fabric.loadSVGFromURL(url, (objects, options) => {
			const obj = fabric.util.groupSVGElements(objects, options);

			const artboardId = activeArtboard?.id;
			if (!canvasRef.current || !artboardId) {
				return;
			}

			const artboard = getArtboardObject(canvasRef.current, artboardId);
			const { left, top } = getScaledPosition(artboard);

			obj.set({
				left,
				top,
				data: {
					id: generateId(),
				},
			});
			canvasRef.current?.add(obj);
			canvasRef.current?.setActiveObject(obj);
			imageForm.reset();
			dispatch(
				updateActiveArtboardLayers(canvasRef.current?.toJSON(['data', 'selectable', 'effects']).objects || []),
			);
			saveArtboardChanges();
			closeImageModal();
		});
	};

	const addVideoFromFile = async (file: File) => {
		const reader = new FileReader();
		reader.onload = async function (f: ProgressEvent<FileReader>) {
			const data = f?.target?.result as string;
			const video = await addVideoToCanvas(data, canvasRef.current!);
			canvasRef.current?.setActiveObject(video);
			canvasRef.current?.renderAll();
			dispatch(
				updateActiveArtboardLayers(canvasRef.current?.toJSON(['data', 'selectable', 'effects']).objects || []),
			);
			saveArtboardChanges();
			closeImageModal();
		};
		reader.onerror = function (e) {
			console.log('Error in reading file', e);
		};
		reader.readAsDataURL(file);
	};

	return (
		<Modal
			opened={imageModalOpened}
			onClose={() => {
				imageForm.reset();
				closeImageModal();
			}}
			title={`Add image to ${activeArtboard?.name}`}
			classNames={{
				content: modalClasses.content,
				title: modalClasses.title,
			}}
			size={600}
		>
			<Tabs defaultValue="upload">
				<Tabs.List>
					<Tabs.Tab value="upload" icon={<IconLinkPlus size="0.8rem" />}>
						Upload Image
					</Tabs.Tab>
					<Tabs.Tab value="video" icon={<IconVideo size="0.8rem" />}>
						Upload Video
					</Tabs.Tab>
					<Tabs.Tab value="url" icon={<IconPhoto size="0.8rem" />}>
						From URL
					</Tabs.Tab>
					<Tabs.Tab value="svg" icon={<IconShape size="0.8rem" />}>
						SVG from URL
					</Tabs.Tab>
					<Tabs.Tab value="unsplash" icon={<IconSettings size="0.8rem" />}>
						Unsplash Random
					</Tabs.Tab>
				</Tabs.List>

				<Tabs.Panel value="url" pt="xs">
					<Stack spacing={'lg'}>
						<TextInput
							label="Image URL"
							placeholder="Enter valid url"
							required
							classNames={{ label: modalClasses.label }}
							{...imageForm.getInputProps('url')}
						/>
						<Button
							variant="light"
							size="sm"
							fullWidth
							mt={'md'}
							onClick={() => {
								const validationResult = imageForm.validate();
								if (validationResult.hasErrors) {
									console.log('Errors in image form= ', validationResult.errors);
									return;
								}
								addImageFromUrl(imageForm.values.url);
							}}
						>
							Add image
						</Button>
					</Stack>
				</Tabs.Panel>

				<Tabs.Panel value="upload" pt="xs">
					<Stack spacing={'lg'}>
						<FileInput
							multiple
							onChange={files => {
								console.log(files);
								files.forEach(file => {
									const reader = new FileReader();
									reader.onload = function (f: ProgressEvent<FileReader>) {
										const data = f?.target?.result as string;
										addImageFromUrl(data);
									};
									reader.readAsDataURL(file);
								});
							}}
							label="Upload Images"
							placeholder="Select Images for upload"
							icon={<IconUpload size="0.8rem" />}
						/>
						<Button
							onClick={() => {
								closeImageModal();
							}}
						>
							Close
						</Button>
					</Stack>
				</Tabs.Panel>

				<Tabs.Panel value="unsplash" pt="xs">
					<Stack spacing={'lg'}>
						<Button
							onClick={() => {
								addImageFromUrl(`https://source.unsplash.com/random/?background`);
								closeImageModal();
							}}
						>
							Add Random From Unsplash
						</Button>
					</Stack>
				</Tabs.Panel>

				<Tabs.Panel value="svg" pt="xs">
					<Stack spacing={'lg'}>
						<TextInput
							label="SVG URL"
							placeholder="Enter valid url"
							required
							classNames={{ label: modalClasses.label }}
							{...imageForm.getInputProps('url')}
						/>
						<Button
							variant="light"
							size="sm"
							fullWidth
							mt={'md'}
							onClick={() => {
								const validationResult = imageForm.validate();
								if (validationResult.hasErrors) {
									console.log('Errors in image form= ', validationResult.errors);
									return;
								}
								addSvgFromUrl(imageForm.values.url);
							}}
						>
							Add SVG
						</Button>
					</Stack>
				</Tabs.Panel>

				<Tabs.Panel value="video" pt="xs">
					<Stack spacing={'lg'}>
						<FileInput
							accept="video/*"
							onChange={async file => {
								console.log(file);
								if (file) {
									await addVideoFromFile(file);
								}
							}}
							label="Upload Video"
							placeholder="Select video for upload"
							icon={<IconUpload size="0.8rem" />}
						/>
						<Button
							onClick={() => {
								closeImageModal();
							}}
						>
							Close
						</Button>
					</Stack>
				</Tabs.Panel>
			</Tabs>
		</Modal>
	);
};

export default ImageModal;
