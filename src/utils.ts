interface layer {
	id: number | string;
	parent: number | string;
	text: string;
	droppable?: boolean | undefined;
	data?: any | undefined;
}

export function convertFabricObjectsToLayers(objects: { [key: string]: any }) {
	let elementId = 0;
	const layers: layer[] = [];

	function processObject(object: any, parentId: number) {
		if (!object) {
			return;
		}

		if (object.type === 'rect') {
			return;
		}

		layers.push({
			id: ++elementId,
			parent: parentId,
			droppable: object.type === 'group',
			text: object.type,
			data: object,
		});

		if (object.type === 'group') {
			const groupId = elementId;
			Object.values(object.objects).forEach((element: any) => {
				processObject(element, groupId);
			});
		}
	}

	Object.values(objects).forEach(object => {
		processObject(object, 0);
	});
	return layers;
}
export function convertLayersToFabricObjects(layers: layer[]) {
	const fabricObjects: { [key: number]: any } = {};
	const rootObjectIds: number[] = [];

	// First pass: create fabricObjects for all layers
	layers.forEach(layer => {
		fabricObjects[layer.id as number] = layer.data ? { ...layer.data, objects: [] } : { objects: [] };
		if (layer.parent === 0) {
			rootObjectIds.push(layer.id as number);
		}
	});

	// Second pass: build the nested structure
	layers.forEach(layer => {
		if (layer.parent !== 0) {
			fabricObjects[layer.parent as number].objects.push(fabricObjects[layer.id as number]);
		}
	});

	// Filter out the root objects
	const rootObjects = rootObjectIds.map(id => fabricObjects[id]);
	console.log('object', rootObjects);
	return rootObjects;
}
