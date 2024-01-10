export type UserKeyMap = {
	[key in UserKeyboardShortcut]: string;
};

export enum UserKeyboardShortcut {
	showSidebar = 'Show sidebar',
	toggleRuler = 'Toggle ruler',
	toggleColorMode = 'Toggle color mode',
	debug = 'Debug',

	alignLeft = 'Align left',
	alignRight = 'Align right',
	alignTop = 'Align top',
	alignBottom = 'Align bottom',
	alignCenter = 'Align center',
	alignMiddle = 'Align middle',
}

export const UserShortcutMap: UserKeyMap = {
	[UserKeyboardShortcut.showSidebar]: 'mod+.',
	[UserKeyboardShortcut.toggleRuler]: 'alt+r',
	[UserKeyboardShortcut.toggleColorMode]: 'alt+l',
	[UserKeyboardShortcut.debug]: 'alt+shift+D',

	[UserKeyboardShortcut.alignLeft]: 'alt+a',
	[UserKeyboardShortcut.alignRight]: 'alt+d',
	[UserKeyboardShortcut.alignTop]: 'alt+w',
	[UserKeyboardShortcut.alignBottom]: 'alt+s',
	[UserKeyboardShortcut.alignCenter]: 'alt+v',
	[UserKeyboardShortcut.alignMiddle]: 'alt+h',
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

	moveUp = 'Move up',
	moveDown = 'Move down',
	moveLeft = 'Move left',
	moveRight = 'Move right',

	moveUpFast = 'Move up fast',
	moveDownFast = 'Move down fast',
	moveLeftFast = 'Move left fast',
	moveRightFast = 'Move right fast',
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
	[SystemKeyboardShortcut.deleteElement]: 'backspace',

	[SystemKeyboardShortcut.addTextElement]: 't',
	[SystemKeyboardShortcut.addImageElement]: 'i',
	[SystemKeyboardShortcut.addRectangleElement]: 'r',

	[SystemKeyboardShortcut.groupElements]: 'mod+g',
	[SystemKeyboardShortcut.ungroupElements]: 'mod+shift+g',

	[SystemKeyboardShortcut.moveUp]: 'arrowup',
	[SystemKeyboardShortcut.moveDown]: 'arrowdown',
	[SystemKeyboardShortcut.moveLeft]: 'arrowleft',
	[SystemKeyboardShortcut.moveRight]: 'arrowright',

	[SystemKeyboardShortcut.moveUpFast]: 'alt+ArrowUp',
	[SystemKeyboardShortcut.moveDownFast]: 'alt+arrowdown',
	[SystemKeyboardShortcut.moveLeftFast]: 'alt+arrowleft',
	[SystemKeyboardShortcut.moveRightFast]: 'alt+arrowright',
};
