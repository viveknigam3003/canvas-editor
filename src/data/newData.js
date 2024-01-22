export const capsuleStructure = {
	_id: 'capsule id',
	status: 'draft/published/...',
	createdBy: 'user id',
	createAt: 'timestamp',
	updateBy: 'user id',
	updatedAt: 'timestamp',
	isDeleted: false,
	thumbnail: 'url',
	metadata: {},
	shortid: 'shortid',
	artboards: [
		{
			id: 'string',
			size: {
				displayNames: [],
				width: 0,
				height: 0,
			},
			elements: [], // fabric.Object
			rulers: [],
		},
	],
};
