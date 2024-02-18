import { Artboard } from '../../types';

/**
 * Get updated artboards with the updated element properties in the selected artboards
 * @param elementId Element ID to be updated
 * @param properties Object with properties to be updated
 * @param data Additional data to be used for updating - artboards and selectedArtboards
 * @returns Array of updated artboards
 */
export const getBulkEditedArtboards = (
	elementId: string,
	properties: { [key: string]: any },
	data: {
		artboards: Artboard[];
		selectedArtboards: string[];
	},
): Artboard[] => {
	const { artboards, selectedArtboards } = data;
	return artboards.map(artboard => {
		// Check if the artboard has objects and find the element
		if (selectedArtboards.includes(artboard.id) && artboard.state?.objects) {
			const newObjects = artboard.state.objects.map((obj: fabric.Object) => {
				// Update the element that matches the ID
				if (obj.data && obj.data.id === elementId) {
					return Object.assign({}, obj, properties);
				}
				return obj; // Return other objects unchanged
			});

			// Return a new artboard object with updated state
			return { ...artboard, state: { ...artboard.state, objects: newObjects } };
		}
		return artboard; // Return artboards without state unchanged
	});
};
