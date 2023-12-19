import { Button, Modal, NumberInput, Stack } from '@mantine/core';

import { useModalStyles } from '../../styles/modal';
import { useForm } from '@mantine/form';
import { useLocalStorage } from '@mantine/hooks';
import { useEffect } from 'react';

const SnapDistanceModal = ({ open, onClose }: any) => {
	const [snapDistance, setSnapDistance] = useLocalStorage<string>({
		key: 'snapDistance',
	});
	const { classes: modalClasses } = useModalStyles();
	const imageForm = useForm<{ snapDistance: number }>({
		validate: values => {
			const errors: Record<string, string> = {};
			if (!(values.snapDistance > 1 && values.snapDistance < 10)) {
				errors.snapDistance = 'Snap distance should be between 2 and 10';
			}
			return errors;
		},
	});
	useEffect(() => {
		imageForm.setFieldValue('snapDistance', Number(snapDistance));
	}, [snapDistance]);

	return (
		<>
			<Modal
				opened={open}
				onClose={() => {
					onClose();
				}}
				title="Change Snap Distance"
				classNames={{
					content: modalClasses.content,
					title: modalClasses.title,
				}}
			>
				<Stack spacing={'lg'}>
					<NumberInput
						defaultValue={2}
						placeholder="Snap Distance"
						label="Snap Distance"
						withAsterisk
						{...imageForm.getInputProps('snapDistance')}
					/>
					<Button
						onClick={() => {
							const validationResult = imageForm.validate();
							if (validationResult.hasErrors) {
								console.log('Errors in image form= ', validationResult.errors);
								return;
							}
							setSnapDistance(String(imageForm.values.snapDistance));
							onClose();
						}}
					>
						Save
					</Button>
				</Stack>
			</Modal>
		</>
	);
};

export default SnapDistanceModal;
