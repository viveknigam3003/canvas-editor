/**
 * Get the artboard object from the canvas, given the artboard ID.
 * Artboard is a special object with data.type 'artboard' and data.id equal to the artboard ID
 * @param canvas Canvas object
 * @param artboardId Artboard ID
 * @returns A fabric.Rect object representing the artboard
 */
export const getArtboardObject = (canvas: fabric.Canvas | null, artboardId: string): fabric.Rect => {
	if (!canvas) {
		throw new Error('Canvas not found');
	}

	const artboard = canvas.getObjects().find(obj => obj.data?.type === 'artboard' && obj.data?.id === artboardId);

	if (!artboard) {
		throw new Error('Artboard not found');
	}

	return artboard;
};

/**
 * Get the width and height of the artboard
 * @param canvas Canvas object
 * @param artboardId Artboard ID
 * @returns Width and height of the artboard
 */
export const getArtboardDimensions = (
	canvas: fabric.Canvas | null,
	artboardId: string,
): { width: number; height: number } => {
	const artboard = getArtboardObject(canvas, artboardId);
	const width = artboard.width!;
	const height = artboard.height!;
	return {
		width,
		height,
	};
};

/**
 * Get the position of the artboard on the canvas
 * @param canvas Canvas object
 * @param artboardId Artboard ID
 * @returns Left and top position of the artboard (x and y coordinates of the top-left corner of the artboard)
 */
export const getArtboardPosition = (
	canvas: fabric.Canvas | null,
	artboardId: string,
): { left: number; top: number } => {
	const artboard = getArtboardObject(canvas, artboardId);
	const left = artboard.left!;
	const top = artboard.top!;
	return {
		left,
		top,
	};
};

/**
 * Get the center coordinates of the artboard
 * @param canvas Canvas object
 * @param artboardId Artboard ID
 * @returns Center coordinates of the artboard (x, y)
 */
export const getArtboardCenter = (canvas: fabric.Canvas | null, artboardId: string): { x: number; y: number } => {
	const { left, top } = getArtboardPosition(canvas, artboardId);
	const { width, height } = getArtboardDimensions(canvas, artboardId);

	const centerX = left + width / 2;
	const centerY = top + height / 2;

	return {
		x: centerX,
		y: centerY,
	};
};
