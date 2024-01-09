import { Box, Kbd, Modal, Stack, Table, Text, clsx, createStyles } from '@mantine/core';
import { useLocalStorage } from '@mantine/hooks';
import { useEffect, useState } from 'react';
import { useModalStyles } from '../../styles/modal';
import { getAltKey, getModKey } from '../utils/keyboard';
import { KeyCodeMap } from './keycodemap';
import { KeyMap, KeyboardShortcutMap } from './shortcutMap';

const useStyles = createStyles(theme => ({
	row: {
		cursor: 'pointer',
		'&:hover': {
			backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
		},
	},
	recording: {
		// red outline blinking slowly
		outline: `2px solid ${theme.colors.red[5]}`,
		borderRadius: 4,
		'&:hover': {
			backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.red[1],
		},
		// Keyframes animation of red outline
	},
	subtext: {
		color: theme.colors.gray[6],
		fontSize: 12,
	},
}));

interface KeyboardShortcutsModalProps {
	open: boolean;
	onClose: () => void;
}

const ShortcutKeys = ({ keyString }: { keyString: string }) => {
	if (!keyString) return null;
	const keys = keyString.split('+');

	const parsedKeys = keys.map(key => {
		if (key === 'mod' || key.toLowerCase() === 'meta' || key.toLowerCase() === 'ctrl') {
			return <Kbd>{getModKey()}</Kbd>;
		}
		if (key.toLowerCase() === 'alt') {
			return <Kbd>{getAltKey()}</Kbd>;
		}
		return <Kbd>{key.toUpperCase()}</Kbd>;
	});

	// Insert a + between each key
	const parsedKeysWithPluses = [];
	for (let i = 0; i < parsedKeys.length; i++) {
		parsedKeysWithPluses.push(parsedKeys[i]);
		if (i !== parsedKeys.length - 1) {
			parsedKeysWithPluses.push(' + ');
		}
	}

	return <Text size={12}>{parsedKeysWithPluses}</Text>;
};

const KeyboardShortcutsModal = ({ open, onClose }: KeyboardShortcutsModalProps) => {
	const { classes } = useStyles();
	const { classes: modalClasses } = useModalStyles();
	const [keyboardShortcuts, setKeyboardShortcuts] = useLocalStorage<KeyMap>({
		defaultValue: KeyboardShortcutMap,
		key: 'keyboard-shortcuts',
	});
	const [selectedShortcut, setSelectedShortcut] = useState<string | null>(null);
	const [recordedShortcut, setRecordedShortcut] = useState<string[]>([]);

	const recordShortcut = (e: React.MouseEvent<HTMLTableRowElement, MouseEvent>, shortcut: string) => {
		console.log('shortcut', shortcut);
		// If already recording, set to null
		if (selectedShortcut === shortcut) {
			setSelectedShortcut(null);
			return;
		}
		setRecordedShortcut([]);
		setSelectedShortcut(shortcut);
	};

	useEffect(() => {
		if (recordedShortcut.length > 0 && selectedShortcut) {
			// Save the new shortcut
			setKeyboardShortcuts(prev => ({ ...prev, [selectedShortcut as string]: recordedShortcut.join('+') }));
		}
	}, [recordedShortcut, selectedShortcut]);

	useEffect(() => {
		console.log('recordedShortcut', recordedShortcut);
	}, [recordedShortcut]);

	useEffect(() => {
		const downHandler = (e: KeyboardEvent) => {
			if (!selectedShortcut) return;
			e.preventDefault();

			const code = e.code;

			// Get the key string from the code
			const keystring = KeyCodeMap[code as keyof typeof KeyCodeMap];
			if (!keystring) return;

			// If recording, add the key to the recorded shortcut
			if (selectedShortcut) {
				setRecordedShortcut(prev => Array.from(new Set([...prev, keystring])));
				return;
			}
		};

		window.addEventListener('keydown', downHandler);
		// window.addEventListener('keyup', upHandler);

		return () => {
			window.removeEventListener('keydown', downHandler);
			// window.removeEventListener('keyup', upHandler);
		};
	}, [selectedShortcut]);

	return (
		<>
			<Modal
				size={600}
				closeOnEscape={false}
				opened={open}
				onClose={() => {
					onClose();
				}}
				title="Keyboard Shortcuts"
				classNames={{
					content: modalClasses.content,
					title: modalClasses.title,
				}}
			>
				<Stack>
					<Text className={classes.subtext}>
						To change a shortcut, click the shortcut and press the new key combination. The new shortcut
						will be saved automatically. Only showing user-customizable shortcuts.
					</Text>
					<Table>
						<thead>
							<tr>
								<th>Action</th>
								<th>Shortcut</th>
							</tr>
						</thead>
						<Box component="tbody">
							{Object.entries(keyboardShortcuts).map(([shortcut, keyString], index) => (
								<tr
									key={`${index}-${shortcut}`}
									onClick={e => recordShortcut(e, shortcut)}
									className={
										selectedShortcut === shortcut
											? clsx(classes.recording, classes.row)
											: classes.row
									}
								>
									<td>
										<Text>{shortcut}</Text>
									</td>
									<td style={{ width: 300 }}>
										{selectedShortcut && selectedShortcut === shortcut ? (
											<ShortcutKeys keyString={recordedShortcut.join('+')} />
										) : (
											<ShortcutKeys keyString={keyString} />
										)}
									</td>
								</tr>
							))}
						</Box>
					</Table>
				</Stack>
			</Modal>
		</>
	);
};

export default KeyboardShortcutsModal;
