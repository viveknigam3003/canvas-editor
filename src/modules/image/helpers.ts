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

export const getElementScale = (element: fabric.Object, artboard: fabric.Rect): number => {
	// Calculate the scale needed to fit the image inside the artboard with 20% padding
	const artboardWidth = artboard.width;
	const artboardHeight = artboard.height;
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

export const getScaledPosition = (artboard: fabric.Rect): { left: number; top: number } => {
	if (!artboard) {
		throw new Error('Artboard not found');
	}

	const left = artboard.left!;
	const top = artboard.top!;
	const width = artboard.width!;
	const height = artboard.height!;

	// calculate the center of the artboard
	const centerX = left + width / 2;
	const centerY = top + height / 2;

	return {
		left: centerX,
		top: centerY,
	};
};

export const addVideoToCanvas = async (src: string, canvas: fabric.Canvas): Promise<fabric.Image> => {
	return new Promise((resolve, reject) => {
		console.log('Loading video');
		const artboard = canvas.getObjects().find(obj => obj.data?.type === 'artboard');

		if (!artboard) {
			reject(new Error('Artboard not found'));
			return;
		}

		const videoE = getVideoElement(src);
		const { left, top } = getScaledPosition(artboard);

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
				height: videoE.videoHeight,
				width: videoE.videoWidth,
				crossOrigin: 'anonymous',
				data: {
					type: 'video',
					src,
					id: generateId(),
				},
			});
			const scale = getElementScale(video, artboard);
			video.set({
				scaleX: scale,
				scaleY: scale,
			});
			videoE.currentTime = 0.01; // This may be unnecessary unless you're trying to bypass a browser quirk.
			canvas.add(video);
			console.log('Video added to canvas');
			resolve(video);
		});

		videoE.addEventListener('error', e => {
			console.error('Error loading video', e);
			reject(new Error('Error loading video'));
		});
	});
};
