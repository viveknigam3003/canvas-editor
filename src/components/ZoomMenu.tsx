import { Box, Button, Menu, Text } from '@mantine/core';
import { IconZoomIn, IconZoomOut, IconZoomReset } from '@tabler/icons-react';
import React from 'react';
import { useMenuStyles } from '../hooks';
import { getModKey } from '../modules/utils/keyboard';

interface Props {
	/**
	 * Zoom value
	 */
	zoom: number;
	/**
	 * Zoom value setter
	 */
	zoomIn: () => void;
	/**
	 * Zoom value setter
	 */
	zoomOut: () => void;
	/**
	 * Zoom value setter
	 */
	zoomReset: () => void;
}

const ZoomMenu: React.FC<Props> = ({ zoom, zoomIn, zoomOut, zoomReset }) => {
	const { classes } = useMenuStyles();
	const zoomPercentage = Math.round(zoom * 100);

	return (
		<Box>
			<Menu withArrow>
				<Menu.Target>
					<Button w={'6rem'} leftIcon={<IconZoomIn size={12} />} size="xs" variant="subtle">
						{zoomPercentage}%
					</Button>
				</Menu.Target>

				<Menu.Dropdown miw={200}>
					<Menu.Item
						className={classes.item}
						icon={<IconZoomIn size={14} />}
						closeMenuOnClick={false}
						rightSection={<Text size={11}>{getModKey()} +</Text>}
						onClick={() => zoomIn()}
					>
						Zoom in
					</Menu.Item>
					<Menu.Item
						className={classes.item}
						icon={<IconZoomOut size={14} />}
						closeMenuOnClick={false}
						rightSection={<Text size={11}>{getModKey()} -</Text>}
						onClick={() => zoomOut()}
					>
						Zoom out
					</Menu.Item>
					<Menu.Item
						className={classes.item}
						icon={<IconZoomReset size={14} />}
						closeMenuOnClick={false}
						rightSection={<Text size={11}>{getModKey()} 0</Text>}
						onClick={() => zoomReset()}
					>
						Reset zoom
					</Menu.Item>
				</Menu.Dropdown>
			</Menu>
		</Box>
	);
};

export default ZoomMenu;
