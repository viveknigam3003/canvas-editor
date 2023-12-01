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
	const fabricObjects: { [key: string]: any } = {};
	const childLayers: { [key: string]: layer[] } = {};

	layers.forEach(layer => {
		// Create a copy of the layer data
		const fabricObject = { ...layer.data, objects: [] };

		if (layer.parent === 0) {
			fabricObjects[layer.id] = fabricObject;
		} else {
			if (!fabricObjects[layer.parent]) {
				if (!childLayers[layer.parent]) {
					childLayers[layer.parent] = [];
				}
				childLayers[layer.parent].push(layer);
				return;
			}

			fabricObjects[layer.parent].objects.push(fabricObject);
		}

		if (childLayers[layer.id]) {
			childLayers[layer.id].forEach(childLayer => {
				fabricObject.objects.push({ ...childLayer.data, objects: [] });
			});
			delete childLayers[layer.id];
		}
	});
	console.log('objects', fabricObjects);
	return fabricObjects;
}
