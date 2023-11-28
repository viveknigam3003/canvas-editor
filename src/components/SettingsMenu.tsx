import { ActionIcon, Box, Menu, Text, Tooltip, useMantineColorScheme } from '@mantine/core';
import { useDisclosure, useHotkeys } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
	IconBug,
	IconLayoutSidebarLeftCollapse,
	IconMoon,
	IconPalette,
	IconSettings,
	IconSun,
} from '@tabler/icons-react';
import { useMenuStyles } from '../hooks';
import { getAltKey, getModKey } from '../modules/utils/keyboard';
import ColorSpaceSwitch from './ColorSpaceSwitch';

interface Props {
	canvasRef: React.RefObject<fabric.Canvas>;
	recreateCanvas: () => void;
	setShowSidebar: React.Dispatch<React.SetStateAction<boolean>>;
}

const SettingsMenu: React.FC<Props> = ({ recreateCanvas, canvasRef, setShowSidebar }) => {
	const { classes } = useMenuStyles();
	const { colorScheme, toggleColorScheme } = useMantineColorScheme();
	const [colorSpaceModalOpened, { open: openColorSpaceModal, close: closeColorSpaceModal }] = useDisclosure();

	const debug = () => {
		console.log(canvasRef.current?.toJSON(['data', 'selectable']));
		notifications.show({
			icon: <IconBug size={14} />,
			title: 'Logged state',
			message: 'Check the console for the state of the canvas',
			color: 'orange',
			autoClose: 1000,
		});
	};

	const toggleUI = () => {
		setShowSidebar(c => !c);
		canvasRef.current?.setDimensions({
			width: window.innerWidth,
			height: window.innerHeight - 60,
		});
	};

	useHotkeys([
		[
			'alt+shift+D',
			(event: KeyboardEvent) => {
				event.preventDefault();
				debug();
			},
		],
		['mod+/', toggleUI],
		[
			'alt+L',
			(event: KeyboardEvent) => {
				event.preventDefault();
				toggleColorScheme();
			},
		],
	]);

	return (
		<Box>
			<Menu withArrow>
				<Menu.Target>
					<Tooltip label="Settings" openDelay={500}>
						<ActionIcon size={20} variant="subtle">
							<IconSettings />
						</ActionIcon>
					</Tooltip>
				</Menu.Target>

				<Menu.Dropdown className={classes.item} miw={250}>
					<Menu.Item icon={<IconPalette size={14} />} className={classes.item} onClick={openColorSpaceModal}>
						Switch color space
					</Menu.Item>
					<Menu.Item
						icon={<IconLayoutSidebarLeftCollapse size={14} />}
						className={classes.item}
						rightSection={<Text size={11}>{getModKey()} + /</Text>}
						onClick={() => toggleUI()}
					>
						Show/hide UI
					</Menu.Item>
					<Menu.Divider />
					<Menu.Item
						className={classes.item}
						icon={colorScheme === 'light' ? <IconMoon size={16} /> : <IconSun size={14} />}
						onClick={() => toggleColorScheme()}
						rightSection={<Text size={11}>{getAltKey()} + L</Text>}
					>
						Switch to {colorScheme === 'dark' ? 'light' : 'dark'} mode
					</Menu.Item>
					<Menu.Item
						className={classes.item}
						icon={<IconBug size={14} />}
						color="yellow"
						onClick={() => {
							debug();
						}}
						rightSection={<Text size={11}>{getAltKey()} + Shift + D</Text>}
					>
						Log state
					</Menu.Item>
				</Menu.Dropdown>
			</Menu>
			<ColorSpaceSwitch
				open={colorSpaceModalOpened}
				onClose={closeColorSpaceModal}
				recreateCanvas={recreateCanvas}
			/>
		</Box>
	);
};

export default SettingsMenu;
