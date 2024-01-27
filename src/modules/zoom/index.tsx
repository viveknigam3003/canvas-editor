import { Box, Button, Menu, Text } from '@mantine/core';
import { IconFocusCentered, IconZoomIn, IconZoomOut, IconZoomReset } from '@tabler/icons-react';
import React from 'react';
import { useMenuStyles } from '../../styles/menu';
import { getKeyboardShortcuts, parseKeyString } from '../keyboard/helpers';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/rootReducer';

interface Props {
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
	/**
	 * Zoom value setter
	 */
	zoomToFit: () => void;
}

const ZoomMenu: React.FC<Props> = ({ zoomIn, zoomOut, zoomReset, zoomToFit }) => {
	const zoom = useSelector((state: RootState) => state.app.zoomLevel);
	const { classes } = useMenuStyles();
	const zoomPercentage = Math.round(zoom * 100);
	const keyboardShortcuts = getKeyboardShortcuts();

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
						rightSection={<Text size={11}>{parseKeyString(keyboardShortcuts['Zoom in'])}</Text>}
						onClick={() => zoomIn()}
					>
						Zoom in
					</Menu.Item>
					<Menu.Item
						className={classes.item}
						icon={<IconZoomOut size={14} />}
						closeMenuOnClick={false}
						rightSection={<Text size={11}>{parseKeyString(keyboardShortcuts['Zoom out'])}</Text>}
						onClick={() => zoomOut()}
					>
						Zoom out
					</Menu.Item>
					<Menu.Item
						className={classes.item}
						icon={<IconZoomReset size={14} />}
						closeMenuOnClick={false}
						rightSection={<Text size={11}>{parseKeyString(keyboardShortcuts['Reset zoom'])}</Text>}
						onClick={() => zoomReset()}
					>
						Reset zoom
					</Menu.Item>
					<Menu.Divider />
					<Menu.Item
						className={classes.item}
						icon={<IconFocusCentered size={14} />}
						closeMenuOnClick={false}
						rightSection={<Text size={11}>{parseKeyString(keyboardShortcuts['Zoom to fit'])}</Text>}
						onClick={() => zoomToFit()}
					>
						Zoom to fit canvas
					</Menu.Item>
				</Menu.Dropdown>
			</Menu>
		</Box>
	);
};

export default ZoomMenu;
