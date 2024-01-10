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

		if (object.data?.type === 'reflection') {
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
			if (object.objects) {
				Object.values(object.objects).forEach((element: any) => {
					processObject(element, groupId);
				});
			} else if (object._objects) {
				Object.values(object._objects).forEach((element: any) => {
					processObject(element, groupId);
				});
			}
		}
	}

	Object.values(objects).forEach(object => {
		processObject(object, 0);
	});
	return layers;
}
