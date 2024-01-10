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
	const userShortcuts = JSON.parse(localStorage.getItem('keyboard-shortcuts') || JSON.stringify(UserShortcutMap));
	const systemShortcuts = DefaultKeyboardShortcuts;

	return { ...systemShortcuts, ...userShortcuts };
};

export const getActionForKeystring = (keystring: string): string => {
	const shortcuts = getKeyboardShortcuts();
	const action = Object.keys(shortcuts).find(
		action => shortcuts[action as keyof typeof shortcuts].toLowerCase() === keystring.toLowerCase(),
	);
	return action || '';
};

export const parseShortcutKey = (key: string): string => {
	const _key = key.toLowerCase();
	if (['mod', 'meta', 'ctrl'].includes(_key)) {
		return getModKey();
	}
	if (_key === 'alt') {
		return getAltKey();
	}

	if (_key === 'shift') {
		return '⇧ Shift';
	}

	if (_key === 'enter') {
		return 'Enter ↵';
	}

	if (_key === ' ') return 'Space';

	if (_key === 'left' || _key === 'arrowleft') {
		return '←';
	}

	if (_key === 'right' || _key === 'arrowright') {
		return '→';
	}

	if (_key === 'up' || _key === 'arrowup') {
		return '↑';
	}

	if (_key === 'down' || _key === 'arrowdown') {
		return '↓';
	}

	return _key.toUpperCase();
};

export const parseKeyString = (keystring: string): string => {
	const keys = keystring.split('+');
	return keys.map(parseShortcutKey).join(' + ');
};
