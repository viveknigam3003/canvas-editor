export type KeyMap = {
	[key in KeyboardShortcut]: string;
};

export enum KeyboardShortcut {
	showSidebar = 'Show Sidebar',
	toggleRuler = 'Toggle Ruler',
	toggleColorMode = 'Toggle Color Mode',
}

export const KeyboardShortcutMap: KeyMap = {
	[KeyboardShortcut.showSidebar]: 'mod+.',
	[KeyboardShortcut.toggleRuler]: 'alt+r',
	[KeyboardShortcut.toggleColorMode]: 'alt+l',
};
