import { Button, Group, Popover, Slider, Stack, Text, createStyles } from '@mantine/core';
import { fabric } from 'fabric';
import React, { useEffect } from 'react';
import SectionTitle from '../../components/SectionTitle';
import { generateId } from '../../utils';

interface AnimationProps {
	canvas: fabric.Canvas;
	currentSelectedElements: fabric.Object[];
	saveArtboardChanges: () => void;
}

interface Keyframe {
	id: string;
	property: string;
	value: string | number;
	timeMark: number;
}

const DURATION_OF_VIDEO = 5 * 1000;

const Animation: React.FC<AnimationProps> = ({ currentSelectedElements, saveArtboardChanges, canvas }) => {
	const { classes } = useStyles();
	const [keyframes, setKeyframes] = React.useState<Keyframe[]>([]);
	const [hasChanges, setHasChanges] = React.useState<boolean>(false);
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

	function easeInOutCubic(x: number): number {
		return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
	}

	function interpolatePropertyValue(keyframes: Keyframe[], time: number, property: string): number | string {
		// Sort the keyframes based on timeMark
		const sortedKeyframes = keyframes
			.filter(kf => kf.property === property)
			.sort((a, b) => a.timeMark - b.timeMark);

		// Edge cases
		if (time <= sortedKeyframes[0].timeMark) {
			return sortedKeyframes[0].value;
		}
		if (time >= sortedKeyframes[sortedKeyframes.length - 1].timeMark) {
			return sortedKeyframes[sortedKeyframes.length - 1].value;
		}

		// Find the surrounding keyframes
		let prevKeyframe: Keyframe | null = null;
		let nextKeyframe: Keyframe | null = null;
		for (const kf of sortedKeyframes) {
			if (kf.timeMark <= time) {
				prevKeyframe = kf;
			} else {
				nextKeyframe = kf;
				break;
			}
		}

		if (prevKeyframe && nextKeyframe) {
			// Linear interpolation
			const timeDiff = nextKeyframe.timeMark - prevKeyframe.timeMark;
			const valueDiff =
				typeof prevKeyframe.value === 'number' && typeof nextKeyframe.value === 'number'
					? nextKeyframe.value - prevKeyframe.value
					: 0;
			const factor = easeInOutCubic((time - prevKeyframe.timeMark) / timeDiff);
			return typeof prevKeyframe.value === 'number'
				? prevKeyframe.value + valueDiff * factor
				: prevKeyframe.value;
		}

		return 'Error'; // Handle error or unexpected cases
	}

	const playAnimation = () => {
		const frameRate = 60;
		const frameDuration = 1000 / frameRate;
		let lastFrameTime = 0;
		const element = currentSelectedElements[0];
		if (!element) {
			return;
		}

		if (!keyframes.length) {
			return;
		}

		console.log(keyframes);

		const kf = [...keyframes].sort((a: Keyframe, b: Keyframe) => a.timeMark - b.timeMark);

		let t = 0;
		const animate = (currentTime: number) => {
			if (currentTime - lastFrameTime > frameDuration) {
				const value = interpolatePropertyValue(kf, t, 'left');
				element.set('left', value as number);
				canvas.renderAll();

				t = t + frameDuration / 1000;
				lastFrameTime = currentTime;
			}

			if (t < DURATION_OF_VIDEO / 1000) {
				requestAnimationFrame(animate);
			} else {
				console.log('done');
			}
		};

		requestAnimationFrame(animate);
	};

	return (
		<Stack>
			<SectionTitle>Animation</SectionTitle>
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
					<Button>{hasChanges ? 'Save keyframes' : 'Keyframes'}</Button>
				</Popover.Target>
				<Popover.Dropdown pb={'2rem'}>
					<Stack>
						<SectionTitle>Keyframe</SectionTitle>
						<Slider
							pt="xl"
							value={timemark}
							onChange={value => setTimemark(value as number)}
							step={0.01}
							min={0}
							max={DURATION_OF_VIDEO / 1000}
							precision={2}
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
			<Button onClick={playAnimation}>Play</Button>
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
