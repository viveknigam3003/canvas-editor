import { Popover, ActionIcon, Grid, Box, createStyles, Tooltip, useMantineTheme } from '@mantine/core';
import { IconSquare } from '@tabler/icons-react';
import { fabric } from 'fabric';
import { shapesData } from './shapesPath';
import { useState } from 'react';
import { Artboard } from '../../types';
import { getArtboardCenter } from '../artboard/helpers';
import { generateId } from '../../utils';

const DEFAULT_SHAPE_COLOR = '#C4C4C4';

type shapeType = { path: string; stroke: string; strokeWidth: number; strokeLineCap?: string };

const useStyles = createStyles(() => ({
	shapeCell: {
		width: '100px',
		height: '100px',
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: '5px',
		cursor: 'pointer',
		border: '1px solid transparent',
		color: 'red',
		background: '#f4f4f4',
		padding: '0px',
		zoom: 0.45,
	},
	center: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
	},
}));

type ShapePopoverProps = {
	canvasRef: React.RefObject<fabric.Canvas>;
	activeArtboard: Artboard | null;
};
export default function ShapePopover({ canvasRef, activeArtboard }: ShapePopoverProps) {
	const theme = useMantineTheme();
	const [opened, setOpened] = useState(false);
	const { classes } = useStyles();
	const addShape = (shape: shapeType, name: string) => {
		if (!activeArtboard) {
			return;
		}
		const artboard = getArtboardCenter(canvasRef.current, activeArtboard.id);
		const { x: centerX, y: centerY } = artboard;
		const path = new fabric.Path(shape.path, {
			fill: DEFAULT_SHAPE_COLOR,
			scaleX: 2,
			scaleY: 2,
			left: centerX,
			top: centerY,
			...(shape.stroke
				? {
						strokeLineCap: shape.strokeLineCap,
						stroke: DEFAULT_SHAPE_COLOR,
						strokeWidth: shape.strokeWidth,
				  }
				: {}),
			data: {
				id: generateId(),
				type: 'shape',
				displayName: name,
			},
		});
		canvasRef.current?.add(path);
		canvasRef.current?.requestRenderAll();
		setOpened(false);
	};
	return (
		<Box>
			<Popover opened={opened} onChange={setOpened} width={300} position="bottom" withArrow shadow="md">
				<Popover.Target>
					<Tooltip hidden={opened} label="Add shape">
						<ActionIcon
							onClick={() => {
								setOpened(p => !p);
							}}
						>
							<IconSquare
								size={14}
								color={theme.colorScheme === 'dark' ? theme.colors.gray[5] : theme.colors.gray[7]}
							/>
						</ActionIcon>
					</Tooltip>
				</Popover.Target>
				<Popover.Dropdown>
					<Grid gutter="md">
						{Object.entries(shapesData).map(([name, shape], index) => {
							return (
								<Grid.Col
									className={classes.center}
									span={4}
									key={`${name}-${index}`}
									onClick={() => {
										addShape(shape as shapeType, name);
									}}
								>
									<Box className={classes.shapeCell}>
										<svg height={75} width={75} viewBox="0 0 50 50">
											<path
												d={shape.path}
												stroke={DEFAULT_SHAPE_COLOR}
												fill={DEFAULT_SHAPE_COLOR}
											/>
										</svg>
									</Box>
								</Grid.Col>
							);
						})}
					</Grid>
				</Popover.Dropdown>
			</Popover>
		</Box>
	);
}
