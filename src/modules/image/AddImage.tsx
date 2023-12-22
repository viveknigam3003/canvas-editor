import { Button, Modal, Stack, TextInput } from '@mantine/core';
import { Artboard } from '../../types';
import { fabric } from 'fabric';
import { Tabs, FileInput } from '@mantine/core';
import { IconPhoto, IconSettings, IconUpload, IconLinkPlus, IconVideo, IconShape } from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import { updateActiveArtboardLayers } from '../../modules/app/actions';
import { useDispatch } from 'react-redux';
import { generateId } from '../../utils';
import { useModalStyles } from '../../styles/modal';
import { FABRIC_JSON_ALLOWED_KEYS } from '../../constants';
import { getElementScale, getScaledPosition, getVideoElement } from './helpers';

type ImageModalProps = {
	imageModalOpened: boolean;
	closeImageModal: () => void;
	selectedArtboard?: Artboard | null;
	canvasRef: React.MutableRefObject<fabric.Canvas | null>;
	artboardRef: React.MutableRefObject<fabric.Rect | null>;
};

const ImageModal = ({
	imageModalOpened,
	closeImageModal,
	selectedArtboard,
	canvasRef,
	artboardRef,
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
				const { left, top } = getScaledPosition(artboardRef!);
				const scale = getElementScale(img, artboardRef);

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

			const { left, top } = getScaledPosition(artboardRef);

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
			closeImageModal();
		});
	};

	const addVideoFromFile = (file: File) => {
		const reader = new FileReader();
		reader.onload = function (f: ProgressEvent<FileReader>) {
			const data = f?.target?.result as string;
			const videoE = getVideoElement(data);
			console.log('Video element = ', videoE.width, videoE.height);
			const { left, top } = getScaledPosition(artboardRef);
			videoE.addEventListener('loadedmetadata', () => {
				videoE.width = videoE.videoWidth;
				videoE.height = videoE.videoHeight;
				console.log('loadedmetadata');
				const video = new fabric.Image(videoE, {
					left,
					top,
					width: videoE.videoWidth,
					height: videoE.videoHeight,
					crossOrigin: 'anonymous',
					data: {
						type: 'video',
						src: data,
						id: generateId(),
					},
				});
				console.log('Video = ', video);
				const scale = getElementScale(video, artboardRef);
				video.set({
					scaleX: scale,
					scaleY: scale,
				});
				canvasRef.current?.add(video);
				canvasRef.current?.setActiveObject(video);
				dispatch(
					updateActiveArtboardLayers(
						canvasRef.current?.toJSON(['data', 'selectable', 'effects']).objects || [],
					),
				);
				closeImageModal();
			});
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
			title={`Add image to ${selectedArtboard?.name}`}
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
							onChange={file => {
								console.log(file);
								if (file) {
									addVideoFromFile(file);
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
