import { fabric } from 'fabric';
import { generateId } from '../../utils';

export const getVideoElement = (url: string) => {
	const videoE = document.createElement('video');
	videoE.muted = true;
	videoE.crossOrigin = 'anonymous';
	const source = document.createElement('source');
	source.src = url;
	source.type = 'video/mp4';
	videoE.appendChild(source);
	return videoE;
};

export const getElementScale = (element: fabric.Object, artboardRef: any): number => {
	// Calculate the scale needed to fit the image inside the artboard with 20% padding
	const artboardWidth = artboardRef.current?.width;
	const artboardHeight = artboardRef.current?.height;
	if (!artboardWidth || !artboardHeight) {
		return 1;
	}
	const elementWidth = element.width;
	const elementHeight = element.height;

	if (!elementWidth || !elementHeight) {
		return 1;
	}

	const widthScale = (artboardWidth * 0.8) / elementWidth;
	const heightScale = (artboardHeight * 0.8) / elementHeight;

	const scale = Math.min(widthScale, heightScale);

	return scale;
};

export const getScaledPosition = (artboardRef: any): { left: number; top: number } => {
	if (!artboardRef.current) {
		throw new Error('No artboard ref found');
	}

	const left = artboardRef.current.left;
	const top = artboardRef.current.top;
	const width = artboardRef.current.width;
	const height = artboardRef.current.height;

	// calculate the center of the artboard
	const centerX = left + width / 2;
	const centerY = top + height / 2;

	return {
		left: centerX,
		top: centerY,
	};
};

export const addVideoToCanvas = async (
	src: string,
	canvas: fabric.Canvas,
	{ artboardRef }: { artboardRef: any },
): Promise<fabric.Image> => {
	return new Promise((resolve, reject) => {
		console.log('Loading video');
		const videoE = getVideoElement(src);
		const { left, top } = getScaledPosition(artboardRef);

		videoE.addEventListener('loadedmetadata', () => {
			videoE.width = videoE.videoWidth;
			videoE.height = videoE.videoHeight;
			const existingVideoObject = canvas.getObjects().find(obj => obj.data?.src === src);

			if (existingVideoObject) {
				console.log('Existing video object found');
				videoE.currentTime = 0.01; // This may be unnecessary unless you're trying to bypass a browser quirk.
				(existingVideoObject as fabric.Image).setElement(videoE);
				resolve(existingVideoObject as fabric.Image);
				return;
			}

			const video = new fabric.Image(videoE, {
				left,
				top,
				scaleX: artboardRef.scaleX,
				scaleY: artboardRef.scaleY,
				crossOrigin: 'anonymous',
				data: {
					type: 'video',
					src,
					id: generateId(),
				},
			});
			canvas.add(video);
			resolve(video);
		});

		videoE.addEventListener('error', e => {
			console.error('Error loading video', e);
			reject(new Error('Error loading video'));
		});

		videoE.load(); // Start loading the video
	});
};
