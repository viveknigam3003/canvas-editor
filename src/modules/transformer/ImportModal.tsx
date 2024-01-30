import { Button, Modal, Stack, Text, Textarea, createStyles } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconAlertTriangle, IconFilePlus } from '@tabler/icons-react';
import React from 'react';
import { useDispatch } from 'react-redux';
import transformVariation from '.';
import { FABRIC_JSON_ALLOWED_KEYS } from '../../constants';
import { useModalStyles } from '../../styles/modal';
import { Artboard } from '../../types';
import { addArtboard } from '../app/actions';
import { getArtboardRectangle } from '../artboard/helpers';
import { filterSaveExcludes } from '../utils/fabricObjectUtils';
import { notifications } from '@mantine/notifications';

interface ImportModalProps {
	opened: boolean;
	onClose: () => void;
	canvas: fabric.Canvas | null;
}

const ImportModal: React.FC<ImportModalProps> = ({ opened, onClose, canvas }) => {
	const { classes: modalClasses } = useModalStyles();
	const dispatch = useDispatch();
	const json = useForm<{ content: string }>({
		initialValues: {
			content: '',
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

	const createVariant = () => {
		// Run validations
		const validationResult = json.validate();

		if (validationResult.hasErrors) {
			console.log('Errors in new artboard form', validationResult.errors);
			return;
		}

		// Convert capsule to phoenix
		const capsuleData = JSON.parse(json.values.content);
		const { data: variant, errors } = transformVariation(capsuleData);

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

		const newArtboard: Artboard = {
			id: variant._id,
			name: variant.creatives[0].displayNames[0],
			width: variant.creatives[0].width,
			height: variant.creatives[0].height,
		};

		canvas?.clear();
		const state = variant.creatives[0].elements.filter(el => el);
		const artboardRect = getArtboardRectangle(newArtboard);
		canvas?.add(artboardRect);

		for (let i = 0; i < state.length; i++) {
			const element = state[i];
			canvas?.add(element);
		}

		const canvasJson = canvas?.toJSON(FABRIC_JSON_ALLOWED_KEYS);

		if (!canvasJson) {
			throw new Error('Could not get canvas json');
		}

		const stateJson = {
			...canvasJson,
			objects: filterSaveExcludes(canvasJson?.objects || []),
		};

		dispatch(addArtboard({ artboard: newArtboard, state: stateJson }));
		json.reset();
		onClose();
	};

	return (
		<Modal
			size={756}
			opened={opened}
			onClose={onClose}
			title="Import variant from JSON"
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