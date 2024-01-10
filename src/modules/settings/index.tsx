import { ActionIcon, Box, Checkbox, Menu, Text, Tooltip, useMantineColorScheme } from '@mantine/core';
import { useDisclosure, useHotkeys } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
	IconArrowBarToLeft,
	IconBug,
	IconKeyboard,
	IconLayoutSidebarLeftCollapse,
	IconMoon,
	IconPalette,
	IconRuler,
	IconSettings,
	IconSun,
} from '@tabler/icons-react';
import { FABRIC_JSON_ALLOWED_KEYS } from '../../constants';
import ColorSpaceSwitch from '../../modules/colorSpace';
import { useMenuStyles } from '../../styles/menu';
import KeyboardShortcutsModal from '../keyboard/KeyboardShortcutsModal';
import { getKeyboardShortcuts, parseKeyString } from '../keyboard/helpers';
import SnapDistanceModal from '../snapping/SnapDistanceModal';
import { filterSaveExcludes } from '../utils/fabricObjectUtils';

interface Props {
	canvasRef: React.RefObject<fabric.Canvas>;
	recreateCanvas: () => void;
	setShowSidebar: React.Dispatch<React.SetStateAction<boolean>>;
	autosaveChanges: boolean;
	setAutoSaveChanges: React.Dispatch<React.SetStateAction<boolean>>;
	snapDistance: string;
	setSnapDistance: React.Dispatch<React.SetStateAction<string>>;
	setShowRuler: React.Dispatch<React.SetStateAction<boolean>>;
}

const SettingsMenu: React.FC<Props> = ({
	recreateCanvas,
	canvasRef,
	setShowSidebar,
	setShowRuler,
	autosaveChanges,
	setAutoSaveChanges,
	snapDistance,
	setSnapDistance,
}) => {
	const { classes } = useMenuStyles();
	const { colorScheme, toggleColorScheme } = useMantineColorScheme();
	const [colorSpaceModalOpened, { open: openColorSpaceModal, close: closeColorSpaceModal }] = useDisclosure();
	const [snapDistanceModalOpened, { open: openSnapDistanceModal, close: closeSnapDistanceModal }] = useDisclosure();
	const [keyboardShortcutsModalOpened, { open: openKeyboardShortcutsModal, close: closeKeyboardShortcutsModal }] =
		useDisclosure();
	const keyboardShortcuts = getKeyboardShortcuts();

	const debug = () => {
		console.log('json=', canvasRef.current?.toJSON(FABRIC_JSON_ALLOWED_KEYS));
		console.log('fabric-objects=', filterSaveExcludes(canvasRef.current?.getObjects()));
		notifications.show({
			icon: <IconBug size={14} />,
			title: 'Logged state',
			message: 'Check the console for the state of the canvas',
			color: 'orange',
			autoClose: 1000,
		});
	};
	const toggleRuler = () => {
		setShowRuler(c => !c);
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
			keyboardShortcuts.Debug,
			(event: KeyboardEvent) => {
				event.preventDefault();
				debug();
			},
		],
		[
			keyboardShortcuts['Toggle ruler'],
			() => {
				console.log(keyboardShortcuts['Toggle ruler']);
				toggleRuler();
			},
		],
		[keyboardShortcuts['Show sidebar'], toggleUI],
		[
			keyboardShortcuts['Toggle color mode'],
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
						rightSection={<Text size={11}>{parseKeyString(keyboardShortcuts['Show sidebar'])}</Text>}
						onClick={() => toggleUI()}
					>
						Show/hide UI
					</Menu.Item>
					<Menu.Item
						icon={<IconRuler size={14} />}
						className={classes.item}
						rightSection={<Text size={11}>{parseKeyString(keyboardShortcuts['Toggle ruler'])}</Text>}
						onClick={() => toggleRuler()}
					>
						Show/hide Ruler
					</Menu.Item>
					<Menu.Item
						icon={<IconArrowBarToLeft size={14} />}
						className={classes.item}
						onClick={openSnapDistanceModal}
					>
						Snap Distance
					</Menu.Item>
					<Menu.Item className={classes.item} closeMenuOnClick={false}>
						<Checkbox
							size={'xs'}
							checked={autosaveChanges}
							onChange={() => setAutoSaveChanges(c => !c)}
							label="Autosave changes"
							color="green"
							styles={{
								label: {
									paddingLeft: '0.5rem',
								},
							}}
						/>
					</Menu.Item>
					<Menu.Divider />
					<Menu.Item
						className={classes.item}
						icon={colorScheme === 'light' ? <IconMoon size={16} /> : <IconSun size={14} />}
						onClick={() => toggleColorScheme()}
						rightSection={<Text size={11}>{parseKeyString(keyboardShortcuts['Toggle color mode'])}</Text>}
					>
						Switch to {colorScheme === 'dark' ? 'light' : 'dark'} mode
					</Menu.Item>
					<Menu.Item
						className={classes.item}
						icon={<IconKeyboard size={16} />}
						onClick={() => openKeyboardShortcutsModal()}
					>
						Keyboard shortcuts
					</Menu.Item>
					<Menu.Item
						className={classes.item}
						icon={<IconBug size={14} />}
						color="yellow"
						onClick={() => {
							debug();
						}}
						rightSection={<Text size={11}>{parseKeyString(keyboardShortcuts.Debug)}</Text>}
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
			<SnapDistanceModal
				open={snapDistanceModalOpened}
				onClose={closeSnapDistanceModal}
				snapDistance={snapDistance}
				setSnapDistance={setSnapDistance}
			/>
			<KeyboardShortcutsModal open={keyboardShortcutsModalOpened} onClose={closeKeyboardShortcutsModal} />
		</Box>
	);
};

export default SettingsMenu;
