import { fabric as Fabric } from 'fabric';
import { generateId } from '../../utils';

export interface SmartObject extends fabric.Object {
	effects: { reflection?: fabric.Object | null; reflectionOverlay?: fabric.Rect | null };
}

export const createReflection = (original: SmartObject, canvas: fabric.Canvas) => {
	// Clone the original object to create the reflection
	original.clone((cloned: SmartObject) => {
		const reflection: SmartObject = cloned;
		reflection.set({
			// Set reflection properties
			top: original.top! + original.getScaledHeight(),
			scaleY: 0 - original.scaleY!,
			opacity: 0.5,
			data: {
				type: 'reflection',
				parent: original.data.id,
				id: generateId(),
				ignoreSnapping: true,
			},
			selectable: false,
			fill: new Fabric.Gradient({
				type: 'linear',
				coords: {
					x1: 0,
					y1: 0,
					x2: 0,
					y2: reflection.height, // Vertical gradient
				},
				colorStops: [
					{ offset: 0, color: 'rgba(0,0,0,0)' }, // Adjust color and opacity as needed
					{ offset: 1, color: 'rgba(0,0,0,0.8)' },
				],
			}),
		});

		// Add the reflection to the canvas and link it to the original
		canvas.add(reflection);
		original.set('effects', { ...original.effects, reflection });
		// set the z-index of the reflection to be just behind the original
		const objectIndex = canvas.getObjects().indexOf(original);
		canvas.moveTo(reflection, objectIndex);

		// If the object is an image, then we need to add a rectangle behind it to create the reflection
		if (original.type === 'image') {
			const reflectionOverlay = new Fabric.Rect({
				top: reflection.top!,
				left: reflection.left!,
				width: original.getScaledWidth(),
				height: original.getScaledHeight(),
				selectable: false,
				data: {
					type: 'reflectionOverlay',
					parent: original.data.id,
					id: generateId(),
					ignoreSnapping: true,
				},
				fill: new Fabric.Gradient({
					type: 'linear',
					coords: {
						x1: 0,
						y1: 0,
						x2: 0,
						y2: reflection.height, // Vertical gradient
					},
					colorStops: [
						{ offset: 0, color: 'rgba(255,255,255,0)' }, // Adjust color and opacity as needed
						{ offset: 0.5, color: 'rgba(255,255,255,1)' },
					],
				}),
			});

			// Add the rectangle to the canvas and link it to the original
			canvas.add(reflectionOverlay);
			original.set('effects', { ...original.effects, reflectionOverlay });
			const reflectionIndex = canvas.getObjects().indexOf(reflection);
			canvas.moveTo(reflectionOverlay, reflectionIndex + 1);
			canvas.requestRenderAll();
		}
	});
};

export const updateReflection = (original: SmartObject, canvas: fabric.Canvas) => {
	// Set the reflection's position and angle to match the original
	if (original.effects?.reflection) {
		const elementTop = original.top!;
		const elementLeft = original.left!;

		const sin = Math.sin(Fabric.util.degreesToRadians(original.angle!));
		const cos = Math.cos(Fabric.util.degreesToRadians(original.angle!));

		const height = original.getScaledHeight();
		const leftAdjustment = height * sin;
		const topAdjustment = height * cos;

		// Set reflection position
		original.effects?.reflection.set({
			top: elementTop + topAdjustment,
			left: elementLeft - leftAdjustment,
			angle: original.angle,
			scaleX: original.scaleX,
			scaleY: -original.scaleY!,
			flipX: original.flipX,
			flipY: !original.flipY,
		});

		if (original.effects?.reflectionOverlay) {
			console.log('updating reflection overlay');
			original.effects?.reflectionOverlay.set({
				top: original.effects.reflection.top!,
				left: original.effects.reflection.left!,
				angle: original.effects.reflection.angle,
				scaleX: original.effects.reflection.scaleX,
				scaleY: original.effects.reflection.scaleY!,
				flipX: original.effects.reflection.flipX,
				flipY: !original.effects.reflection.flipY,
				width: original.effects.reflection.width,
				height: original.effects.reflection.height,
			});
		}

		console.log('Reflection', original.effects?.reflection.toJSON(['data']));
		console.log('Reflection Overlay', original.effects?.reflectionOverlay?.toJSON(['data']));

		// Update the canvas display
		canvas.requestRenderAll();
	}
};
