import { Box, Button, Group, Modal, Stack, Radio, Tooltip } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useModalStyles, useQueryParam } from '../hooks';
import { useState } from 'react';

const ColorSpaceSwitch = ({ recreateCanvas }: any) => {
	const [colorSpaceModalOpened, { open: openColorSpaceModal, close: closeColorSpaceModal }] = useDisclosure();

	const { classes: modalClasses } = useModalStyles();
	const [colorSpaceQuery, setColorSpaceQuery] = useQueryParam('colorSpace', 'srgb');
	const [colorSpace, setColorSpace] = useState(() => colorSpaceQuery);
	const getDisplayValue = () => {
		if (colorSpaceQuery === 'display-p3') {
			return 'P3';
		}
		return 'SRGB';
	};
	return (
		<Box>
			<Tooltip label="change color space">
				<Button variant="gradient" onClick={openColorSpaceModal}>
					{getDisplayValue()}
				</Button>
			</Tooltip>
			<Modal
				opened={colorSpaceModalOpened}
				onClose={() => {
					closeColorSpaceModal();
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
						label="Choose a color space"
						onChange={value => {
							setColorSpace(value);
						}}
					>
						<Group mt="xs">
							<Radio value="display-p3" label="P3" />
							<Radio value="srgb" label="sRGB" />
						</Group>
					</Radio.Group>
					<Group grow>
						<Button
							size="sm"
							fullWidth
							mt={'md'}
							onClick={() => {
								setColorSpaceQuery(colorSpace);
								recreateCanvas();
								closeColorSpaceModal();
							}}
						>
							Ok
						</Button>
					</Group>
					This will reload the page
				</Stack>
			</Modal>
		</Box>
	);
};

export default ColorSpaceSwitch;
