import { KeyCodeMap } from './keycodemap';

export const validateKeyCode = (code: string) => {
	// The key should be present in the KeyCodeMap
	return Object.keys(KeyCodeMap).includes(code);
};
