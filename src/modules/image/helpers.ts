import { fabric } from 'fabric';
import { generateId } from '../../utils';

export const getVideoElement = (url: string) => {
	const videoE = document.createElement('video');
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

	if (!left || !top || !width || !height) {
		throw new Error('Artboard dimensions not found');
	}

	// calculate the center of the artboard
	const centerX = left + width / 2;
	const centerY = top + height / 2;

	return {
		left: centerX,
		top: centerY,
	};
};

export const addVideoToCanvas = (
	src: string,
	canvas: fabric.Canvas,
	artboardRef: any,
	onComplete?: (video: fabric.Object) => void,
) => {
	const videoE = getVideoElement(src);
	const { left, top } = getScaledPosition(artboardRef);
	videoE.addEventListener('loadedmetadata', () => {
		videoE.width = videoE.videoWidth;
		videoE.height = videoE.videoHeight;
		console.log('loadedmetadata');
		const video = new fabric.Image(videoE, {
			left,
			top,
			width: videoE.videoWidth,
			height: videoE.videoHeight,
			crossOrigin: 'anonymous',
			data: {
				type: 'video',
				src: src,
				id: generateId(),
			},
		});
		console.log('Video = ', video);
		const scale = getElementScale(video, artboardRef);
		video.set({
			scaleX: scale,
			scaleY: scale,
		});
		canvas.add(video);
		if (onComplete) {
			onComplete(video);
		}
	});
};
