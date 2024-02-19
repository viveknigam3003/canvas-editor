/**
 * Generates a random ID
 * @returns Returns a random ID string
 */
export const generateId = () => {
	return Math.random().toString(36).substring(2, 9);
};

/**
 * Calculate the multiplier to scale the canvas to 4K resolution
 * @param width Width of the canvas
 * @param height Height of the canvas
 * @returns Multiplier to scale the canvas to 4K resolution
 */
export const getMultiplierFor4K = (width?: number, height?: number): number => {
	// Assuming the canvas is not already 4K, calculate the multiplier needed
	// to scale the current canvas size up to 4K resolution
	const maxWidth = 3840; // for UHD 4K width
	const maxHeight = 2160; // for UHD 4K height
	const widthMultiplier = maxWidth / (width || 1);
	const heightMultiplier = maxHeight / (height || 1);

	// Use the smaller multiplier to ensure the entire canvas fits into the 4K resolution
	return Math.min(widthMultiplier, heightMultiplier);
};
