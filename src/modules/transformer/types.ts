export interface Variant {
	_id: string;
	status: 'draft' | 'published';
	createdBy: string;
	createdAt: string;
	updatedBy: string;
	updatedAt: string;
	isDeleted: boolean;
	thumbnail: string;
	metadata: Record<string, any>;
	shortid: string;
	creatives: Array<Creative>;
}

export interface Creative {
	id: string;
	width: number;
	height: number;
	displayNames: Array<string>;
	elements: Array<fabric.Object>;
	rulers: Array<fabric.Line>;
}
