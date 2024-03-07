/* eslint-disable @typescript-eslint/no-namespace */
import { fabric } from 'fabric';
import { generateId } from '../..';
import { Group as FabricGroup, Image as FabricImage } from 'fabric/fabric-impl';

declare module 'fabric' {
	namespace fabric {
		interface Imagebox extends FabricGroup {
			src?: string;
			loadImage(src: string): Promise<Imagebox>;
			renderImage(image: FabricImage): Promise<Imagebox>;
		}
	}
}
// import { IGroupOptions } from 'fabric/fabric-impl';

// export const Imagebox = fabric.util.createClass(fabric.Group, {
// 	type: 'imagebox',
// 	initialize: function (options: IGroupOptions) {
// 		this.callSuper('initialize', [], options);
// 	},
// 	loadImage: function (src: string) {
// 		// Return a promise that resolves when the image is loaded and processed
// 		return new Promise(resolve => {
// 			fabric.Image.fromURL(
// 				src,
// 				img => {
// 					const isWide = img.width! / img.height! > this.width / this.height;
// 					if (isWide) {
// 						img.scaleToWidth(this.width);
// 					} else {
// 						img.scaleToHeight(this.height);
// 					}
// 					img.set({
// 						originX: 'center',
// 						originY: 'center',
// 						data: { id: generateId() }, // Assuming this is a function that generates a unique ID
// 					});
// 					this.add(img);

// 					this.clipPath = new fabric.Rect({
// 						left: -this.width / 2,
// 						top: -this.height / 2,
// 						width: this.width,
// 						height: this.height,
// 					});
// 					this.set({
// 						width: this.width,
// 						height: this.height,
// 						src,
// 					});
// 					this.setCoords();
// 					resolve(this);
// 				},
// 				{ crossOrigin: 'anonymous' },
// 			);
// 		});
// 	},
// 	renderImage: function (image: fabric.Image) {
// 		// This function loads the image without altering its scale or properties
// 		return new Promise(resolve => {
// 			fabric.Image.fromURL(
// 				image.getSrc(),
// 				img => {
// 					img.set({
// 						originX: image.originX,
// 						originY: image.originY,
// 						left: image.left,
// 						top: image.top,
// 						angle: image.angle,
// 						scaleX: image.scaleX,
// 						scaleY: image.scaleY,
// 						data: image.data,
// 					});
// 					this.add(img);
// 					this.clipPath = new fabric.Rect({
// 						left: -this.width / 2,
// 						top: -this.height / 2,
// 						width: this.width,
// 						height: this.height,
// 					});
// 					this.setCoords();
// 					this.set('dirty', true);
// 					resolve(this);
// 				},
// 				{ crossOrigin: 'anonymous' },
// 			);
// 		});
// 	},
// 	toObject: function () {
// 		return fabric.util.object.extend(this.callSuper('toObject'), {
// 			data: this.data,
// 			src: this.src, // Assuming you store the image source URL in this property
// 		});
// 	},
// });

// Imagebox.fromObject = function (object: any, callback: any) {
// 	// The object parameter is the serialized object
// 	// Recreate the Imagebox instance based on this object
// 	const imagebox = new Imagebox({
// 		left: object.left,
// 		top: object.top,
// 		width: object.width,
// 		height: object.height,
// 		data: object.data,
// 		src: object.src,
// 	});

// 	fabric.util.enlivenObjects(
// 		[object.objects[0]],
// 		([image]: fabric.Object[]) => {
// 			imagebox.renderImage(image).then(() => {
// 				callback(imagebox);
// 			});
// 		},
// 		'fabric',
// 	);
// };

// // Register the Imagebox class with fabric
// // @ts-ignore
// fabric.Imagebox = Imagebox;
// // @ts-ignore
// fabric.Imagebox.fromObject = Imagebox.fromObject;

// fabric.Object._fromObject('Imagebox', Imagebox.fromObject);

interface ImageboxOptions extends fabric.IGroupOptions {
	src?: string; // Optional; depending on your logic, this could be required
}

interface SerializedImagebox extends fabric.Group {
	type: string;
	src: string;
	data: any; // Adjust to match the shape of your `data` object
	width: number;
	height: number;
	left?: number;
	top?: number;
	objects: fabric.Image[]; // Adjust to match the shape of the serialized objects
}

export const Imagebox = fabric.util.createClass(fabric.Group, {
	type: 'imagebox',
	initialize(options: ImageboxOptions) {
		this.callSuper('initialize', [], options);
		this.src = options.src;
	},
	async loadImage(src: string): Promise<fabric.Imagebox> {
		return new Promise(resolve => {
			fabric.Image.fromURL(
				src,
				img => {
					const isWide = img.width! / img.height! > this.width / this.height;
					if (isWide) {
						img.scaleToWidth(this.width);
					} else {
						img.scaleToHeight(this.height);
					}
					img.set({
						originX: 'center',
						originY: 'center',
						data: { id: generateId() },
					});
					this.add(img);

					this.clipPath = new fabric.Rect({
						left: -this.width / 2,
						top: -this.height / 2,
						width: this.width,
						height: this.height,
					});
					this.set({
						width: this.width,
						height: this.height,
						src,
					});
					this.setCoords();
					resolve(this);
				},
				{ crossOrigin: 'anonymous' },
			);
		});
	},
	async renderImage(image: fabric.Image): Promise<fabric.Imagebox> {
		const src = image.getSrc() || '';
		return new Promise(resolve => {
			fabric.Image.fromURL(
				src,
				img => {
					img.set({
						originX: image.originX,
						originY: image.originY,
						left: image.left,
						top: image.top,
						angle: image.angle,
						scaleX: image.scaleX,
						scaleY: image.scaleY,
						data: image.data,
						width: image.width,
						height: image.height,
					});
					this.add(img);

					this.clipPath = new fabric.Rect({
						left: -this.width / 2,
						top: -this.height / 2,
						width: this.width,
						height: this.height,
					});
					this.setCoords();
					this.set('dirty', true);
					resolve(this);
				},
				{ crossOrigin: 'anonymous' },
			);
		});
	},
	toObject(): SerializedImagebox {
		return fabric.util.object.extend(this.callSuper('toObject'), {
			src: this.src,
			data: this.data,
		});
	},
});

Imagebox.fromObject = (object: SerializedImagebox, callback: (imagebox: fabric.Group) => void) => {
	const imagebox = new Imagebox({
		left: object.left,
		top: object.top,
		...object,
	}) as fabric.Imagebox; // `as any` is used here to bypass TypeScript's strict typing temporarily

	if (object.src) {
		fabric.util.enlivenObjects(
			[object.objects[0]],
			([image]: fabric.Image[]) => {
				imagebox.renderImage(image).then(() => {
					callback(imagebox);
				});
			},
			'fabric',
		);
	} else {
		callback(imagebox);
	}
};

(fabric as any).Imagebox = Imagebox;
(fabric as any).Imagebox.fromObject = Imagebox.fromObject;

fabric.Object._fromObject('Imagebox', Imagebox.fromObject);
