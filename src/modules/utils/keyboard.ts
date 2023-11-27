export const getModKey = () => {
	if (navigator.platform.indexOf('Mac') === -1) {
		return 'Ctrl';
	} else {
		return '⌘';
	}
};

export const getAltKey = () => {
	if (navigator.platform.indexOf('Mac') === -1) {
		return 'Alt';
	} else {
		return '⌥';
	}
};
