import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { Button, Group, NumberInput, Popover, Progress, Slider, Stack, Text, createStyles } from '@mantine/core';
import { fabric } from 'fabric';
import React, { useEffect, useRef, useState } from 'react';
import SectionTitle from '../../components/SectionTitle';
import { FABRIC_JSON_ALLOWED_KEYS } from '../../constants';
import { generateId } from '../../utils';
import { getNearestFps, interpolatePropertyValue } from './helpers';
interface AnimationProps {
	canvas: fabric.Canvas;
	currentSelectedElements: fabric.Object[];
	saveArtboardChanges: () => void;
}

export interface Keyframe {
	id: string;
	property: string;
	value: string | number;
	timeMark: number;
	easing: string;
}

const MAX_DURATION = 60 * 1000;

const Animation: React.FC<AnimationProps> = ({ currentSelectedElements, saveArtboardChanges, canvas }) => {
	const { classes } = useStyles();
	const [keyframes, setKeyframes] = useState<Keyframe[]>([]);
	const [hasChanges, setHasChanges] = useState<boolean>(false);
	const [duration, setDuration] = useState<number>(3000);
	const [fps, setFps] = useState<number>(60);
	const [isPlaying, setIsPlaying] = useState<boolean>(false);
	const [timemark, setTimemark] = useState<number>(0);
	const [loaded, setLoaded] = useState(false);
	const [progress, setProgress] = useState({
		percent: 0,
		message: '',
		rendering: false,
	});

	const ffmpegRef = useRef(new FFmpeg());

	const loadFfmpeg = async () => {
		setLoaded(false);
		setProgress({
			percent: 0,
			message: 'Initialising encoder',
			rendering: true,
		});
		const baseURL = 'https://unpkg.com/@ffmpeg/core-mt@0.12.5/dist/esm';
		const ffmpeg = ffmpegRef.current;
		ffmpeg.on('log', ({ message }) => {
			console.log('ffmpeg log', message);
		});
		// toBlobURL is used to bypass CORS issue, urls with the same
		// domain can be used directly.
		const res = await ffmpeg.load({
			coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
			wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
			workerURL: await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, 'text/javascript'),
		});
		console.log('ffmpeg loaded', res);
		setLoaded(true);
	};

	useEffect(() => {
		const element = currentSelectedElements[0];
		if (!element) {
			return;
		}
		const { keyframes } = element.data;
		if (!keyframes) {
			return;
		}
		setKeyframes(keyframes);

		return () => {
			setKeyframes([]);
		};
	}, [currentSelectedElements]);

	const addKeyframe = () => {
		const element = currentSelectedElements[0];
		if (!element) {
			return;
		}

		const elementKeyframes = element.data.keyframes;
		if (!elementKeyframes) {
			element.set('data', {
				...element.data,
				keyframes: [],
			});
		}

		const newKeyframe: Keyframe = {
			id: generateId(),
			property: 'left',
			value: Math.round(element.left!),
			timeMark: timemark,
			easing: `easeInOutCubic`,
		};
		setKeyframes((prevKeyframes: Keyframe[]) => [...prevKeyframes, newKeyframe]);
		setHasChanges(true);
		element.set('data', {
			...element.data,
			keyframes: [...element.data.keyframes, newKeyframe],
		});
	};

	const removeKeyframe = (id: string) => {
		const element = currentSelectedElements[0];
		if (!element) {
			return;
		}

		const newKeyframes = keyframes.filter((keyframe: Keyframe) => keyframe.id !== id);
		setKeyframes(newKeyframes);
		setHasChanges(true);
		element.set('data', {
			...element.data,
			keyframes: newKeyframes,
		});
	};

	const playAnimation = () => {
		const frameRate = fps;
		const frameDuration = 1000 / frameRate;
		let lastFrameTime = 0;
		const element = currentSelectedElements[0];
		if (!element) {
			return;
		}

		if (!keyframes.length) {
			return;
		}

		const kf = [...keyframes].sort((a: Keyframe, b: Keyframe) => a.timeMark - b.timeMark);

		setIsPlaying(true);
		let t = 0;
		const animate = (currentTime: number) => {
			if (currentTime - lastFrameTime > frameDuration) {
				const value = interpolatePropertyValue(kf, t, 'left');
				element.set('left', value as number);
				canvas.renderAll();

				t = t + frameDuration / 1000;
				lastFrameTime = currentTime;
			}

			if (t < duration / 1000) {
				requestAnimationFrame(animate);
			} else {
				setIsPlaying(false);
				console.debug('animation end');
			}
		};

		requestAnimationFrame(animate);
	};

	const animateOffCanvas = (onAnimationComplete: (frameData: any[]) => void) => {
		const artboard = canvas.getObjects().find(obj => obj.data.type === 'artboard');
		if (!artboard) {
			throw new Error('Artboard not found');
		}
		const artboardLeftAdjustment = artboard.left;
		const artboardTopAdjustment = artboard.top;

		if (!artboardLeftAdjustment || !artboardTopAdjustment) {
			return;
		}

		const width = artboard.width!;
		const height = artboard.height!;

		console.log('width', width);
		console.log('height', height);

		const renderCanvas = new fabric.Canvas('render-canvas', {
			width,
			height,
			backgroundColor: '#000',
		});
		console.log('renderCanvas', renderCanvas);

		const stateJSON = canvas.toJSON(FABRIC_JSON_ALLOWED_KEYS);

		console.log('stateJSON', stateJSON);

		const adjustedStateJSONObjects = stateJSON?.objects?.map((item: any) => {
			return {
				...item,
				left: item.left - artboardLeftAdjustment,
				top: item.top - artboardTopAdjustment,
			};
		});

		const adjustedStateJSON = {
			...stateJSON,
			objects: adjustedStateJSONObjects,
		};

		renderCanvas.loadFromJSON(adjustedStateJSON, () => {
			renderCanvas.renderAll();
			console.log('renderCanvas loaded');

			const currentElement = currentSelectedElements[0];
			if (!currentElement) {
				throw new Error('Element not found');
			}
			const element = renderCanvas.getObjects().find(obj => obj.data.id === currentElement.data.id);
			if (!element) {
				throw new Error('Element not found');
			}

			const keyframes = element.data.keyframes;

			const frameRate = fps;
			const frameDuration = 1000 / frameRate;
			let lastFrameTime = 0;

			if (!keyframes.length) {
				throw new Error('No keyframes found');
			}

			const kf = [...keyframes].sort((a: Keyframe, b: Keyframe) => a.timeMark - b.timeMark);

			let t = 0;
			setProgress({
				percent: 0,
				message: 'Rendering',
				rendering: true,
			});
			const totalFrames = Math.round(duration / frameDuration);
			const frameData: any[] = [];
			const animate = (currentTime: number) => {
				if (currentTime - lastFrameTime > frameDuration) {
					const value = interpolatePropertyValue(kf, t, 'left');
					element.set('left', value as number);
					renderCanvas.renderAll();

					frameData.push(
						renderCanvas.toDataURL({
							format: 'png',
						}),
					);
					setProgress({
						percent: Math.round((frameData.length / totalFrames) * 100),
						message: `Rendering (${Math.round((frameData.length / totalFrames) * 100)}%)`,
						rendering: true,
					});
					t = t + frameDuration / 1000;
					lastFrameTime = currentTime;
				}

				if (t < duration / 1000) {
					requestAnimationFrame(animate);
				} else {
					console.debug('animation end');
					setProgress({
						percent: 100,
						message: 'Rendering complete',
						rendering: true,
					});
					onAnimationComplete(frameData);
				}
			};

			requestAnimationFrame(animate);
		});
	};

	const renderVideo = async () => {
		if (!loaded) {
			console.log('loading ffmpeg');
			await loadFfmpeg();
		}
		const ffmpeg = ffmpegRef.current;
		if (!ffmpeg) {
			console.log('ffmpeg not loaded');
			return;
		}

		animateOffCanvas(async (frameData: any[]) => {
			setProgress({
				percent: 100,
				message: 'Encoding video',
				rendering: true,
			});

			if (!frameData.length) {
				throw new Error('No frames captured');
			}

			for (let i = 0; i < frameData.length; i++) {
				ffmpeg.writeFile(`frame${i}.png`, await fetchFile(frameData[i]));
			}

			await ffmpeg.exec([
				'-framerate',
				`${fps}`,
				'-i',
				'frame%d.png',
				'-c:v',
				'libx264', // Video codec: H.264
				'-c:a',
				'aac', // Audio codec: AAC (even if there's no audio, specifying might help)
				'-pix_fmt',
				'yuv420p', // Pixel format compatible with QuickTime
				'out.mp4',
			]);
			const data = await ffmpeg.readFile('out.mp4');
			const url = URL.createObjectURL(new Blob([data], { type: 'video/mp4' }));
			setProgress({
				percent: 100,
				message: 'Download starting',
				rendering: true,
			});

			const a = document.createElement('a');
			a.href = url;
			a.download = 'animation.mp4';
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
			setProgress({
				percent: 100,
				message: 'Download complete',
				rendering: false,
			});
		});
	};

	return (
		<Stack>
			<SectionTitle>Animation</SectionTitle>
			<Button onClick={playAnimation} disabled={isPlaying}>
				{isPlaying ? 'Playing' : 'Play'}
			</Button>
			<Group grow>
				<NumberInput
					label="Duration (ms)"
					value={duration}
					onChange={value => setDuration(value as number)}
					step={100}
					min={0}
					max={MAX_DURATION}
					stepHoldDelay={500}
					stepHoldInterval={100}
				/>
				<NumberInput
					label="FPS"
					value={fps}
					onChange={value => setFps(getNearestFps(value as number))}
					step={1}
					min={8}
					max={60}
					stepHoldDelay={500}
					stepHoldInterval={100}
				/>
			</Group>

			<Popover
				position="left-end"
				withinPortal
				withArrow
				keepMounted
				closeOnClickOutside={false}
				closeOnEscape={false}
				onClose={() => {
					if (hasChanges) {
						saveArtboardChanges();
						setHasChanges(false);
					}
				}}
			>
				<Popover.Target>
					<Button variant="light">{hasChanges ? 'Save keyframes' : 'Keyframes'}</Button>
				</Popover.Target>
				<Popover.Dropdown pb={'2rem'}>
					<Stack>
						<SectionTitle>Keyframe</SectionTitle>
						<Slider
							pt="xl"
							value={timemark}
							onChange={value => setTimemark(value as number)}
							step={0.1}
							min={0}
							max={duration / 1000}
							precision={1}
							w={300}
							labelAlwaysOn
						/>
						<Button onClick={addKeyframe}>Add</Button>
						{keyframes.length ? (
							<Stack spacing={4}>
								{keyframes.map(keyframe => (
									<Group
										key={keyframe.id}
										onClick={() => removeKeyframe(keyframe.id)}
										className={classes.keyframe}
									>
										<Text style={{ fontWeight: 600 }} className={classes.keyframeText}>
											{keyframe.timeMark}s
										</Text>
										<Text className={classes.keyframeText}>{keyframe.property}</Text>
										<Text className={classes.keyframeText}>{keyframe.value}</Text>
									</Group>
								))}
							</Stack>
						) : null}
					</Stack>
				</Popover.Dropdown>
			</Popover>
			<Button onClick={renderVideo} loading={progress.rendering}>
				{progress.rendering ? 'Rendering' : 'Render video'}
			</Button>
			{progress.rendering ? (
				<Stack align="center" spacing={4}>
					<Progress value={progress.percent} animate w={'100%'} />
					<Text className={classes.progressMessage}>{progress.message}</Text>
				</Stack>
			) : null}
		</Stack>
	);
};

export default Animation;

const useStyles = createStyles(theme => ({
	keyframe: {
		fontSize: 12,
		fontFamily: 'monospace',
		'&:hover': {
			color: theme.colors.red[6],
			cursor: 'not-allowed',
		},
	},
	keyframeText: {
		fontWeight: 400,
	},
	progressMessage: {
		fontSize: 12,
		fontFamily: 'monospace',
	},
}));
