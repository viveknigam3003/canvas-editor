import { Kbd, Text } from '@mantine/core';
import { parseShortcutKey } from './helpers';

interface ShortcutKeysProps {
	keyString: string;
}

const ShortcutKeys = ({ keyString }: ShortcutKeysProps) => {
	if (!keyString) return null;
	const keys = keyString.split('+');

	const parsedKeys = keys.map(key => <Kbd key={key}>{parseShortcutKey(key)}</Kbd>);

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
