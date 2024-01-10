import { KeyCodeMap } from './keycodemap';
import { DefaultKeyboardShortcuts, SystemKeyMap, UserKeyMap, UserShortcutMap } from './shortcutMap';

export const validateKeyCode = (code: string) => {
	// The key should be present in the KeyCodeMap
	return Object.keys(KeyCodeMap).includes(code);
};

export const getKeyboardShortcuts = (): UserKeyMap & SystemKeyMap => {
	const userShortcuts = JSON.parse(localStorage.getItem('keyboard-shortcuts') || '{}') || UserShortcutMap;
	const systemShortcuts = DefaultKeyboardShortcuts;

	return { ...systemShortcuts, ...userShortcuts };
};
