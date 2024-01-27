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

export const getArtboardDimensions = (
	canvas: fabric.Canvas | null,
	artboardId: string,
): { width: number; height: number } => {
	const artboard = getArtboardObject(canvas, artboardId);

	const width = artboard.width;
	const height = artboard.height;

	if (width === undefined || height === undefined) {
		throw new Error('Artboard dimensions not found');
	}

	return {
		width,
		height,
	};
};

export const getArtboardPosition = (
	canvas: fabric.Canvas | null,
	artboardId: string,
): { left: number; top: number } => {
	const artboard = getArtboardObject(canvas, artboardId);

	const left = artboard.left;
	const top = artboard.top;

	if (left === undefined || top === undefined || left === null || top === null) {
		throw new Error('Artboard position not found');
	}

	return {
		left,
		top,
	};
};

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
