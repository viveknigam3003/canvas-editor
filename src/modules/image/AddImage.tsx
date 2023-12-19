import { Button, Modal, Stack, TextInput } from '@mantine/core';
import { Artboard } from '../../types';
import { fabric } from 'fabric';
import { Tabs, FileInput } from '@mantine/core';
import { IconPhoto, IconSettings, IconUpload, IconLinkPlus } from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import { updateActiveArtboardLayers } from '../../modules/app/actions';
import { useDispatch } from 'react-redux';
import { generateId } from '../../utils';
import { useModalStyles } from '../../styles/modal';
import { FABRIC_JSON_ALLOWED_KEYS } from '../../constants';

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
	const getImageScale = (image: fabric.Image): number => {
		// Calculate the scale needed to fit the image inside the artboard with 20% padding
		const artboardWidth = artboardRef.current?.width;
		const artboardHeight = artboardRef.current?.height;
		console.log('Artboard = ', artboardWidth, artboardHeight);
		if (!artboardWidth || !artboardHeight) {
			return 1;
		}
		const imageWidth = image.width;
		const imageHeight = image.height;

		console.log('Image = ', imageWidth, imageHeight);

		if (!imageWidth || !imageHeight) {
			return 1;
		}

		const widthScale = (artboardWidth * 0.8) / imageWidth;
		const heightScale = (artboardHeight * 0.8) / imageHeight;

		console.log('Width scale = ', widthScale, 'Height scale = ', heightScale);

		return Math.min(widthScale, heightScale);
	};
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

				const scale = getImageScale(img);

				console.log('Scale = ', scale);

				img.set({
					left: centerX,
					top: centerY,
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

			obj.set({
				left: centerX,
				top: centerY,
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
						Upload
					</Tabs.Tab>
					<Tabs.Tab value="url" icon={<IconPhoto size="0.8rem" />}>
						From URL
					</Tabs.Tab>
					<Tabs.Tab value="svg" icon={<IconPhoto size="0.8rem" />}>
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
			</Tabs>
		</Modal>
	);
};

export default ImageModal;
