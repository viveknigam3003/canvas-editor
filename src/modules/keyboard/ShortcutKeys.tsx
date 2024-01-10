import { Kbd, Text } from '@mantine/core';
import { getAltKey, getModKey } from '../utils/keyboard';

interface ShortcutKeysProps {
	keyString: string;
}

const ShortcutKeys = ({ keyString }: ShortcutKeysProps) => {
	if (!keyString) return null;
	const keys = keyString.split('+');

	const parsedKeys = keys.map(key => {
		if (key === 'mod' || key.toLowerCase() === 'meta' || key.toLowerCase() === 'ctrl') {
			return <Kbd key={key}>{getModKey()}</Kbd>;
		}
		if (key.toLowerCase() === 'alt') {
			return <Kbd key={key}>{getAltKey()}</Kbd>;
		}
		return <Kbd key={key}>{key.toUpperCase()}</Kbd>;
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

export default ShortcutKeys;
