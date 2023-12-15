import { Button, Group, Modal, Radio, Stack, Text } from '@mantine/core';
import { useState } from 'react';
import { useQueryParam } from './hooks';
import { useModalStyles } from '../../styles/modal';

const ColorSpaceSwitch = ({ open, onClose, recreateCanvas }: any) => {
	// const [colorSpaceModalOpened, { open: openColorSpaceModal, close: closeColorSpaceModal }] = useDisclosure();
	const { classes: modalClasses } = useModalStyles();
	const [colorSpaceQuery, setColorSpaceQuery] = useQueryParam('colorSpace', 'srgb');
	const [colorSpace, setColorSpace] = useState(() => colorSpaceQuery);

	return (
		<>
			<Modal
				opened={open}
				onClose={() => {
					onClose();
				}}
				title="Color Space"
				classNames={{
					content: modalClasses.content,
					title: modalClasses.title,
				}}
			>
				<Stack spacing={'lg'}>
					<Radio.Group
						name="color-space"
						value={colorSpace}
						label="Preferred color profile"
						onChange={value => {
							setColorSpace(value);
						}}
					>
						<Group mt="xs">
							<Radio value="srgb" label="sRGB" />
							<Radio value="display-p3" label="Display P3" />
						</Group>
					</Radio.Group>
					<Text size={14} className={modalClasses.subtext}>
						{colorSpace === 'display-p3'
							? "Best for Apple devices, Display P3 has a broader color spectrum—but isn't recommended for web design."
							: 'sRGB is best when designing for a variety of devices, but has a smaller color spectrum than Display P3.'}
					</Text>
					<Stack align="center" spacing={4}>
						<Button
							size="sm"
							fullWidth
							mt={'md'}
							onClick={() => {
								setColorSpaceQuery(colorSpace);
								recreateCanvas();
								onClose();
							}}
						>
							Apply color space
						</Button>
						<Text size={14} className={modalClasses.subtext}>
							Applying the color space will reload the page.
						</Text>
					</Stack>
				</Stack>
			</Modal>
		</>
	);
};

export default ColorSpaceSwitch;
