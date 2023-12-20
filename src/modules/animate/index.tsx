import { Button, Group, NumberInput, Popover, Slider, Stack, Text, createStyles } from '@mantine/core';
import { fabric } from 'fabric';
import React, { useEffect } from 'react';
import SectionTitle from '../../components/SectionTitle';
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
}

const MAX_DURATION = 60 * 1000;

const Animation: React.FC<AnimationProps> = ({ currentSelectedElements, saveArtboardChanges, canvas }) => {
	const { classes } = useStyles();
	const [keyframes, setKeyframes] = React.useState<Keyframe[]>([]);
	const [hasChanges, setHasChanges] = React.useState<boolean>(false);
	const [duration, setDuration] = React.useState<number>(5000);
	const [fps, setFps] = React.useState<number>(60);
	const [isPlaying, setIsPlaying] = React.useState<boolean>(false);
	const [timemark, setTimemark] = React.useState<number>(0);

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
}));
