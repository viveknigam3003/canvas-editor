import { Artboard } from '../../types';

export const getArtboardsFromIds = (artboards: Artboard[], selectedArtboards: string[]) => {
	// First find the element with the id in all artboards
	return selectedArtboards
		.map(artboardId => artboards.find(artboard => artboard.id === artboardId) ?? null)
		.filter(artboard => artboard !== null) as Artboard[];
};

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
			console.log('artboard updated', artboard.id);
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
