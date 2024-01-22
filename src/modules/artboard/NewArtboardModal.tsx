import { Button, Group, Modal, NumberInput, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { fabric } from 'fabric';
import React from 'react';
import { useDispatch } from 'react-redux';
import { FABRIC_JSON_ALLOWED_KEYS } from '../../constants';
import { useModalStyles } from '../../styles/modal';
import { Artboard } from '../../types';
import { generateId } from '../../utils';
import { addArtboard } from '../app/actions';
import { getHotkeyHandler } from '@mantine/hooks';

interface NewArtboardModalProps {
	opened: boolean;
	onClose: () => void;
	canvas: fabric.Canvas | null;
}

const NewArtboardModal: React.FC<NewArtboardModalProps> = ({ opened, onClose, canvas }) => {
	const { classes: modalClasses } = useModalStyles();
	const dispatch = useDispatch();
	const newArtboardForm = useForm<Omit<Artboard, 'id'> & { number: number }>({
		initialValues: {
			name: '',
			width: 500,
			height: 500,
			number: 1,
		},
		validate: values => {
			const errors: Record<string, string> = {};
			if (values.name.trim().length === 0) {
				errors.name = 'Variant name cannot be empty';
			}
			if (values.width < 1) {
				errors.width = 'Variant width cannot be less than 1px';
			}
			if (values.height < 1) {
				errors.height = 'Variant height cannot be less than 1px';
			}
			if (values.number < 1) {
				errors.number = 'Number of artboards cannot be less than 1';
			}
			return errors;
		},
	});

	const getArtboardRectangle = (artboard: Artboard) => {
		return new fabric.Rect({
			left: 0,
			top: 0,
			width: artboard.width,
			height: artboard.height,
			fill: '#fff',
			hoverCursor: 'default',
			selectable: false,
			data: {
				type: 'artboard',
				id: artboard.id,
			},
		});
	};

	const addNewArtboard = (artboard: Omit<Artboard, 'id'>) => {
		const validationResult = newArtboardForm.validate();
		if (validationResult.hasErrors) {
			console.log('Errors in new artboard form', validationResult.errors);
			return;
		}

		if (!canvas) {
			throw new Error('Canvas is not defined');
		}

		const id = generateId();
		const newArtboard: Artboard = { ...artboard, id };

		canvas.clear();
		const artboardRect = getArtboardRectangle(newArtboard);
		canvas.add(artboardRect);
		// Save the state of the canvas
		const json = canvas.toJSON(FABRIC_JSON_ALLOWED_KEYS);

		if (!json) {
			throw new Error('Could not get canvas json');
		}

		dispatch(addArtboard({ artboard: newArtboard, state: json }));
		newArtboardForm.reset();
		onClose();
	};

	return (
		<Modal
			opened={opened}
			onClose={() => {
				newArtboardForm.reset();
				onClose();
			}}
			title="Create new variant"
			classNames={{
				content: modalClasses.content,
				title: modalClasses.title,
			}}
		>
			<Stack spacing={'lg'}>
				<TextInput
					label="Variant name"
					placeholder="Variant 1"
					required
					classNames={{ label: modalClasses.label }}
					{...newArtboardForm.getInputProps('name')}
					onKeyDown={getHotkeyHandler([['enter', () => addNewArtboard(newArtboardForm.values)]])}
					data-autofocus
				/>
				<Group grow>
					<NumberInput
						label="Width"
						placeholder="500"
						required
						classNames={{ label: modalClasses.label }}
						{...newArtboardForm.getInputProps('width')}
					/>
					<NumberInput
						label="Height"
						placeholder="500"
						required
						classNames={{ label: modalClasses.label }}
						{...newArtboardForm.getInputProps('height')}
					/>
				</Group>
				{/* <NumberInput
					label="Number of artboards"
					placeholder="1"
					required
					classNames={{ label: modalClasses.label }}
					{...newArtboardForm.getInputProps('number')}
					min={1}
					max={1000}
				/> */}
				<Button
					variant="light"
					size="sm"
					fullWidth
					mt={'md'}
					onClick={() => {
						addNewArtboard(newArtboardForm.values);
					}}
				>
					{newArtboardForm.values.number > 1
						? `Create ${newArtboardForm.values.number} variant`
						: `Create variant`}
				</Button>
			</Stack>
		</Modal>
	);
};

export default NewArtboardModal;
