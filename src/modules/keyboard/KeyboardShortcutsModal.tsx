import { Box, Modal, Stack, Table, Text, clsx, createStyles } from '@mantine/core';
import { useLocalStorage } from '@mantine/hooks';
import { useEffect, useState } from 'react';
import SectionTitle from '../../components/SectionTitle';
import { useModalStyles } from '../../styles/modal';
import { getAltKey, getModKey } from '../utils/keyboard';
import ShortcutKeys from './ShortcutKeys';
import { KeyCodeMap } from './keycodemap';
import { DefaultKeyboardShortcuts, UserKeyMap, UserShortcutMap } from './shortcutMap';
import { getActionForKeystring, parseKeyString, validateKeyCode } from './helpers';

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
	errorMessageContainer: {
		height: 20,
	},
}));

interface KeyboardShortcutsModalProps {
	open: boolean;
	onClose: () => void;
}

const KeyboardShortcutsModal = ({ open, onClose }: KeyboardShortcutsModalProps) => {
	const { classes } = useStyles();
	const { classes: modalClasses } = useModalStyles();
	const [keyboardShortcuts, setKeyboardShortcuts] = useLocalStorage<UserKeyMap>({
		defaultValue: UserShortcutMap,
		key: 'keyboard-shortcuts',
	});
	const [selectedShortcut, setSelectedShortcut] = useState<string | null>(null);
	const [recordedShortcut, setRecordedShortcut] = useState<string[]>([]);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const recordShortcut = (e: React.MouseEvent<HTMLTableRowElement, MouseEvent>, shortcut: string) => {
		e.preventDefault();
		setErrorMessage(null);
		// If already recording, set to null
		if (selectedShortcut === shortcut) {
			if (recordedShortcut.length === 0) {
				setSelectedShortcut(null);
				return;
			}

			const errorMessage = validateShortcut(recordedShortcut);
			if (!errorMessage) {
				setKeyboardShortcuts(prev => ({ ...prev, [shortcut]: recordedShortcut.join('+') }));
			}
			setErrorMessage(errorMessage);
			setSelectedShortcut(null);
			return;
		}

		setRecordedShortcut([]);
		setSelectedShortcut(shortcut);
	};

	const sanitiseKeyString = (keys: string[]) => {
		// Remove any duplicates
		const uniqueKeys = Array.from(new Set(keys));

		// If there is a mod key, it should be the first key
		// If there is an alt key, it should be the second key
		// If there is a shift key, it should be the third key
		// Otherwise, the order doesn't matter
		const modKey = uniqueKeys.find(
			key => key.toLowerCase() === 'mod' || key.toLowerCase() === 'meta' || key.toLowerCase() === 'ctrl',
		);
		const altKey = uniqueKeys.find(key => key.toLowerCase() === 'alt');
		const shiftKey = uniqueKeys.find(key => key.toLowerCase() === 'shift');

		const sortedKeys = [];
		if (modKey) sortedKeys.push(modKey);
		if (altKey) sortedKeys.push(altKey);
		if (shiftKey) sortedKeys.push(shiftKey);
		uniqueKeys.forEach(key => {
			if (['mod', 'ctrl', 'meta', 'alt', 'shift'].includes(key.toLowerCase())) return;

			sortedKeys.push(key);
		});

		// Without a modifier key, there cannot be more than 1 key
		if (!(modKey || altKey || shiftKey) && sortedKeys.length > 1) {
			return [sortedKeys[sortedKeys.length - 1]];
		}

		return sortedKeys;
	};

	const validateShortcut = (shortcut: string[]): string | null => {
		const modKey = shortcut.find(
			key => key.toLowerCase() === 'mod' || key.toLowerCase() === 'meta' || key.toLowerCase() === 'ctrl',
		);
		const altKey = shortcut.find(key => key.toLowerCase() === 'alt');
		const shiftKey = shortcut.find(key => key.toLowerCase() === 'shift');

		// 1. The shortcut should not be empty
		if (shortcut.length === 0) return 'ERROR: Shortcut cannot be empty';

		// Sanitise the shortcut (remove duplicates, sort mod, alt, shift keys)
		const santisedShortcut = sanitiseKeyString(shortcut)
			.map(key => {
				if (key.toLowerCase() === 'meta' || key.toLowerCase() === 'ctrl') {
					return 'mod';
				}
				return key.toLowerCase();
			})
			.join('+');

		// 2. The shortcut should not be a system shortcut
		console.log(santisedShortcut);
		const systemShortcut = Object.values(DefaultKeyboardShortcuts)
			.map(s => s.toLowerCase())
			.includes(santisedShortcut);
		if (systemShortcut)
			return `ERROR: Shortcut cannot be a system shortcut. ${parseKeyString(
				santisedShortcut,
			)} is being used by '${getActionForKeystring(santisedShortcut)}'`;

		// 3. The shortcut should not be a duplicate of another shortcut
		const duplicateShortcut = Object.values(keyboardShortcuts)
			.map(s => s.toLowerCase())
			.includes(santisedShortcut);
		if (duplicateShortcut)
			return `ERROR: Duplicate shortcut recorded. ${parseKeyString(
				santisedShortcut,
			)} is being used by '${getActionForKeystring(santisedShortcut)}'`;

		// 4. The shortcut should always have another key if it has a mod key (ctrl, alt, shift, meta)
		if (modKey && shortcut.length === 1) return `ERROR: Shortcut cannot be just ${getModKey()}`;
		if (altKey && shortcut.length === 1) return `ERROR: Shortcut cannot be just ${getAltKey()}`;
		if (shiftKey && shortcut.length === 1) return `ERROR: Shortcut cannot be just SHIFT`;

		// 5. The shortcut should always have another key if it has a mod key (ctrl, alt, shift, meta)
		const otherKeys = shortcut.filter(key => !['mod', 'ctrl', 'meta', 'alt', 'shift'].includes(key.toLowerCase()));
		if (modKey || altKey || shiftKey) {
			if (otherKeys.length === 0) return `ERROR: Shortcut cannot be just modifier keys`;
		}

		return null;
	};

	useEffect(() => {
		const downHandler = (e: KeyboardEvent) => {
			if (!selectedShortcut) return;
			e.preventDefault();

			const code = e.code;
			const isValidKey = validateKeyCode(code);

			// If the key is not valid, do nothing
			if (!isValidKey) {
				setErrorMessage(`Invalid key for shortcut`);
				return;
			}
			// Get the key string from the code
			const keystring = KeyCodeMap[code as keyof typeof KeyCodeMap];
			if (!keystring) return;

			// If recording, add the key to the recorded shortcut
			if (selectedShortcut) {
				setRecordedShortcut(prev => sanitiseKeyString([...prev, keystring]));
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

	// Set errorMessage to null after 3 seconds
	useEffect(() => {
		if (errorMessage) {
			const timeout = setTimeout(() => {
				setErrorMessage(null);
			}, 3000);
			return () => clearTimeout(timeout);
		}
	}, [errorMessage]);

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
				<Stack spacing={24}>
					<Stack spacing={8}>
						<Stack spacing={4}>
							<SectionTitle>User customizable shortcuts</SectionTitle>
							<Text className={classes.subtext}>
								To change a shortcut, click the shortcut and press the new key combination. The new
								shortcut will be saved automatically.
							</Text>
						</Stack>
						<Box className={classes.errorMessageContainer}>
							{errorMessage && (
								<Text color="red" size={12} weight={500}>
									{errorMessage}
								</Text>
							)}
						</Box>
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
					<Stack spacing={8}>
						<Stack spacing={4}>
							<SectionTitle>System shortcuts</SectionTitle>
							<Text className={classes.subtext}>
								Keyboard shortcuts that cannot be changed. You cannot set a user shortcut to any of
								these keys.
							</Text>
						</Stack>
						<Table>
							<thead>
								<tr>
									<th>Action</th>
									<th>Shortcut</th>
								</tr>
							</thead>
							<Box component="tbody">
								{Object.entries(DefaultKeyboardShortcuts).map(([shortcut, keyString], index) => (
									<tr key={`${index}-${shortcut}`} className={classes.row}>
										<td>
											<Text>{shortcut}</Text>
										</td>
										<td style={{ width: 300 }}>
											<ShortcutKeys keyString={keyString} />
										</td>
									</tr>
								))}
							</Box>
						</Table>
					</Stack>
				</Stack>
			</Modal>
		</>
	);
};

export default KeyboardShortcutsModal;
