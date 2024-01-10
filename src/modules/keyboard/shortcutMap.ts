export type KeyMap = {
	[key in KeyboardShortcut]: string;
};

export enum KeyboardShortcut {
	showSidebar = 'Show sidebar',
	toggleRuler = 'Toggle ruler',
	toggleColorMode = 'Toggle color mode',
}

export const KeyboardShortcutMap: KeyMap = {
	[KeyboardShortcut.showSidebar]: 'mod+.',
	[KeyboardShortcut.toggleRuler]: 'alt+r',
	[KeyboardShortcut.toggleColorMode]: 'alt+l',
};

export type SystemKeyMap = {
	[key in SystemKeyboardShortcut]: string;
};

export enum SystemKeyboardShortcut {
	undo = 'Undo',
	redo = 'Redo',
	save = 'Save changes',
	zoomIn = 'Zoom in',
	zoomOut = 'Zoom out',
	resetZoom = 'Reset zoom',
	zoomToFit = 'Zoom to fit',
	duplicateElement = 'Duplicate element',
	deleteElement = 'Delete element',
	addTextElement = 'Add text element',
	addImageElement = 'Add image element',
	addRectangleElement = 'Add rectangle element',
	groupElements = 'Group elements',
	ungroupElements = 'Ungroup elements',
	alignLeft = 'Align left',
	alignRight = 'Align right',
	alignTop = 'Align top',
	alignBottom = 'Align bottom',
	alignCenter = 'Align center',
	alignMiddle = 'Align middle',
}

export const DefaultKeyboardShortcuts: SystemKeyMap = {
	[SystemKeyboardShortcut.undo]: 'mod+z',
	[SystemKeyboardShortcut.redo]: 'mod+shift+z',
	[SystemKeyboardShortcut.save]: 'mod+s',
	[SystemKeyboardShortcut.zoomIn]: 'mod+=',
	[SystemKeyboardShortcut.zoomOut]: 'mod+-',
	[SystemKeyboardShortcut.resetZoom]: 'mod+0',
	[SystemKeyboardShortcut.zoomToFit]: 'mod+/',
	[SystemKeyboardShortcut.duplicateElement]: 'mod+d',
	[SystemKeyboardShortcut.deleteElement]: 'del',
	[SystemKeyboardShortcut.addTextElement]: 'T',
	[SystemKeyboardShortcut.addImageElement]: 'I',
	[SystemKeyboardShortcut.addRectangleElement]: 'R',
	[SystemKeyboardShortcut.groupElements]: 'mod+g',
	[SystemKeyboardShortcut.ungroupElements]: 'mod+shift+g',
	[SystemKeyboardShortcut.alignLeft]: 'alt+a',
	[SystemKeyboardShortcut.alignRight]: 'alt+d',
	[SystemKeyboardShortcut.alignTop]: 'alt+w',
	[SystemKeyboardShortcut.alignBottom]: 'alt+s',
	[SystemKeyboardShortcut.alignCenter]: 'alt+v',
	[SystemKeyboardShortcut.alignMiddle]: 'alt+h',
};
