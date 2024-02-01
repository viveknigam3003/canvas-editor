import { Button, Modal, Stack, Text, Textarea, createStyles } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconAlertTriangle, IconFilePlus } from '@tabler/icons-react';
import { fabric } from 'fabric';
import React from 'react';
import { useDispatch } from 'react-redux';
import transformVariation from '.';
import { FABRIC_JSON_ALLOWED_KEYS } from '../../constants';
import { useModalStyles } from '../../styles/modal';
import { Artboard } from '../../types';
import { addArtboard } from '../app/actions';
import { getArtboardRectangle } from '../artboard/helpers';
import data from '../../data/rocketium/capsule.json';
interface ImportModalProps {
	opened: boolean;
	onClose: () => void;
	canvas: fabric.Canvas | null;
}

const ImportModal: React.FC<ImportModalProps> = ({ opened, onClose }) => {
	const { classes: modalClasses } = useModalStyles();
	const dispatch = useDispatch();
	const json = useForm<{ content: string }>({
		initialValues: {
			content: JSON.stringify(data),
		},

		validate: {
			content: value => {
				// value should not be empty
				if (!value) {
					return 'Content is required';
				}

				// value should be valid json
				try {
					JSON.parse(value);
				} catch (error) {
					return 'Invalid JSON';
				}
			},
		},
	});
	const { classes } = useStyles();

	const loadImage = async (properties: any): Promise<fabric.Image> => {
		const { src, width, height, ...rest } = properties;
		return new Promise((resolve, reject) => {
			try {
				fabric.Image.fromURL(
					src!,
					(img: fabric.Image) => {
						const { width: ogWidth, height: ogHeight } = img.getOriginalSize();
						// Apply cropping based on cropX and cropY and original image size
						const topCrop = ogHeight - height;
						const leftCrop = ogWidth - width;

						img.set({
							cropX: leftCrop,
							cropY: topCrop,
							width,
							height,
							...rest,
						});
						img.scaleToHeight(height);
						img.scaleToWidth(width);
						resolve(img);
					},
					{ crossOrigin: 'anonymous' },
				);
			} catch (err) {
				reject(err);
			}
		});
	};

	const createVariant = async () => {
		// Run validations
		const validationResult = json.validate();

		if (validationResult.hasErrors) {
			console.log('Errors in new artboard form', validationResult.errors);
			return;
		}

		try {
			// Convert capsule to phoenix
			const capsuleData = JSON.parse(json.values.content);
			const { data: variant, errors } = transformVariation(capsuleData);

			for (let i = 0; i < variant.creatives.length; i++) {
				const creative = variant.creatives[i];
				const artboard: Artboard = {
					id: creative.id,
					name: creative.displayNames[0],
					width: creative.width,
					height: creative.height,
				};

				try {
					const state = variant.creatives[i].elements.filter(el => el);
					const artboardRect = getArtboardRectangle(artboard);

					const stateJson = { version: '5.3.0', objects: [] as any[] };
					stateJson.objects.push(artboardRect.toJSON(FABRIC_JSON_ALLOWED_KEYS));

					for (let i = 0; i < state.length; i++) {
						const element = state[i];
						switch (element.type) {
							case 'textbox': {
								const { text, ...rest } = element as fabric.Textbox;
								const el = new fabric.Textbox(text!, rest);
								stateJson.objects.push(el.toJSON(FABRIC_JSON_ALLOWED_KEYS));
								break;
							}
							case 'image': {
								const image = await loadImage(element);
								stateJson.objects.push(image.toJSON(FABRIC_JSON_ALLOWED_KEYS));
								break;
							}
						}
					}

					dispatch(addArtboard({ artboard: artboard, state: stateJson }));
				} catch (err) {
					console.error('ERROR in loop', err);
				}
			}

			if (Object.keys(errors).some(key => errors[key].length > 0)) {
				console.error('Errors in capsule transformation', errors);
				notifications.show({
					title: 'Errors in capsule transformation',
					message: 'Some errors were encountered while transforming the capsule, please check the console',
					color: 'red',
					autoClose: 5000,
					icon: <IconAlertTriangle size={12} />,
				});
			}

			json.reset();
			onClose();
		} catch (err) {
			console.error('ERROR', err);
		}
	};

	return (
		<Modal
			size={756}
			opened={opened}
			onClose={onClose}
			title={'Import capsule JSON'}
			classNames={{
				content: modalClasses.content,
				title: modalClasses.title,
			}}
		>
			<Stack>
				<Text size={14} className={modalClasses.subtext}>
					Create a new variant using Rocketium (v1) capsule JSON. This will convert the capsule to the
					Phonenix (v2) format and try to render the creative here.
				</Text>

				<Stack>
					<Textarea
						classNames={{
							input: classes.textarea,
						}}
						placeholder="Paste capsule JSON here"
						{...json.getInputProps('content')}
					/>
					<Button leftIcon={<IconFilePlus size={16} />} onClick={createVariant}>
						Create variant from JSON
					</Button>
				</Stack>
			</Stack>
		</Modal>
	);
};

export default ImportModal;

const useStyles = createStyles(theme => ({
	textarea: {
		backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.white,
		'&::placeholder': {
			color: theme.colorScheme === 'dark' ? theme.colors.dark[3] : theme.colors.gray[5],
		},
		fontFamily: 'monospace',
		height: 500,
	},
}));
