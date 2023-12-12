import { fabric } from 'fabric';

export interface PhoenixObject extends fabric.Object {
	reflection?: fabric.Object | null;
}

export const createReflection = (original: PhoenixObject, canvas: fabric.Canvas) => {
	// Clone the original object to create the reflection
	original.clone((cloned: PhoenixObject) => {
		const reflection: PhoenixObject = cloned;
		reflection.set({
			// Set reflection properties
			top: original.top! + original.getScaledHeight() * 0.6,
			scaleY: 0 - original.scaleY!,
			opacity: 0.25,
			data: {
				type: 'reflection',
				parent: original.data.id,
			},
			selectable: false,
		});

		// Optionally add a gradient or other effects here

		// Add the reflection to the canvas and link it to the original
		canvas.add(reflection);
		original.reflection = reflection;
	});
};

export const updateReflection = (original: PhoenixObject, canvas: fabric.Canvas) => {
	// Set the reflection's position and angle to match the original
	if (original.reflection) {
		original.reflection.set({
			top: original.top! + original.getScaledHeight() * 0.6,
			left: original.left,
			angle: original.angle!,
			scaleX: original.scaleX,
			scaleY: -original.scaleY!,
			flipX: original.flipX,
			flipY: !original.flipY,
		});

		// Update the canvas display
		canvas.requestRenderAll();
	}
};
