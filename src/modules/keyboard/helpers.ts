import { getAltKey, getModKey } from '../utils/keyboard';
import { KeyCodeMap } from './keycodemap';
import { DefaultKeyboardShortcuts, SystemKeyboardShortcut, UserKeyboardShortcut, UserShortcutMap } from './shortcutMap';

type KeyMap = {
	[key in SystemKeyboardShortcut | UserKeyboardShortcut]: string;
};

export const validateKeyCode = (code: string) => {
	// The key should be present in the KeyCodeMap
	return Object.keys(KeyCodeMap).includes(code);
};

export const getKeyboardShortcuts = (): KeyMap => {
	const userShortcuts = JSON.parse(localStorage.getItem('keyboard-shortcuts') || '{}') || UserShortcutMap;
	const systemShortcuts = DefaultKeyboardShortcuts;

	return { ...systemShortcuts, ...userShortcuts };
};

export const getActionForKeystring = (keystring: string): string => {
	const shortcuts = getKeyboardShortcuts();
	const action = Object.keys(shortcuts).find(action => shortcuts[action as keyof typeof shortcuts] === keystring);
	return action || '';
};

export const parseShortcutKey = (key: string): string => {
	if (key === 'mod' || key.toLowerCase() === 'meta' || key.toLowerCase() === 'ctrl') {
		return getModKey();
	}
	if (key.toLowerCase() === 'alt') {
		return getAltKey();
	}

	if (key.toLowerCase() === 'shift') {
		return '⇧ Shift';
	}

	if (key.toLowerCase() === 'enter') {
		return 'Enter ↵';
	}

	if (key === ' ') return 'Space';

	if (key === 'left' || key === 'ArrowLeft') {
		return '←';
	}

	if (key === 'right' || key === 'ArrowRight') {
		return '→';
	}

	if (key === 'up' || key === 'ArrowUp') {
		return '↑';
	}

	if (key === 'down' || key === 'ArrowDown') {
		return '↓';
	}

	return key.toUpperCase();
};

export const parseKeyString = (keystring: string): string => {
	const keys = keystring.split('+');
	return keys.map(parseShortcutKey).join(' + ');
};
