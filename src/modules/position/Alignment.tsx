import { ActionIcon, Box, Flex, Stack, Tooltip } from '@mantine/core';
import { useHotkeys } from '@mantine/hooks';
import {
	IconLayoutAlignBottom,
	IconLayoutAlignCenter,
	IconLayoutAlignLeft,
	IconLayoutAlignMiddle,
	IconLayoutAlignRight,
	IconLayoutAlignTop,
} from '@tabler/icons-react';
import { getAltKey } from '../../modules/utils/keyboard';
import { alignElementToRect } from './helpers';

type PanelProps = {
	canvas: fabric.Canvas;
	currentSelectedElements: fabric.Object[];
	artboardRef: React.RefObject<fabric.Rect>;
};

const AlignmentPanel = ({ canvas, currentSelectedElements, artboardRef }: PanelProps) => {
	//TODO: fix this
	const castedArtboardRef = artboardRef.current as fabric.Rect;
	useHotkeys([
		[
			'alt+a',
			e => {
				e.preventDefault();
				alignElementToRect(currentSelectedElements, castedArtboardRef, 'left', canvas);
			},
		],
		[
			'alt+d',
			e => {
				e.preventDefault();
				alignElementToRect(currentSelectedElements, castedArtboardRef, 'right', canvas);
			},
		],
		[
			'alt+h',
			e => {
				e.preventDefault();
				alignElementToRect(currentSelectedElements, castedArtboardRef, 'center', canvas);
			},
		],
		[
			'alt+w',
			e => {
				e.preventDefault();
				alignElementToRect(currentSelectedElements, castedArtboardRef, 'top', canvas);
			},
		],
		[
			'alt+s',
			e => {
				e.preventDefault();
				alignElementToRect(currentSelectedElements, castedArtboardRef, 'bottom', canvas);
			},
		],
		[
			'alt+v',
			e => {
				e.preventDefault();
				alignElementToRect(currentSelectedElements, castedArtboardRef, 'middle', canvas);
			},
		],
	]);

	return (
		<Stack>
			<Box>Alignment</Box>
			<Flex gap={16}>
				<Tooltip label={`Align Left (${getAltKey()} + A)`}>
					<ActionIcon
						onClick={() => alignElementToRect(currentSelectedElements, castedArtboardRef, 'left', canvas)}
					>
						<IconLayoutAlignLeft />
					</ActionIcon>
				</Tooltip>
				<Tooltip label={`Align Center (${getAltKey()} + H)`}>
					<ActionIcon
						onClick={() => alignElementToRect(currentSelectedElements, castedArtboardRef, 'center', canvas)}
					>
						<IconLayoutAlignMiddle />{' '}
					</ActionIcon>
				</Tooltip>
				<Tooltip label={`Align Right (${getAltKey()} + D)`}>
					<ActionIcon
						onClick={() => alignElementToRect(currentSelectedElements, castedArtboardRef, 'right', canvas)}
					>
						<IconLayoutAlignRight />
					</ActionIcon>
				</Tooltip>
				<Tooltip label={`Align Top (${getAltKey()} + W)`}>
					<ActionIcon
						onClick={() => alignElementToRect(currentSelectedElements, castedArtboardRef, 'top', canvas)}
					>
						<IconLayoutAlignTop />
					</ActionIcon>
				</Tooltip>
				<Tooltip label={`Align Middle (${getAltKey()} + V)`}>
					<ActionIcon
						onClick={() => alignElementToRect(currentSelectedElements, castedArtboardRef, 'middle', canvas)}
					>
						<IconLayoutAlignCenter />
					</ActionIcon>
				</Tooltip>
				<Tooltip label={`Align Bottom (${getAltKey()} + S)`}>
					<ActionIcon
						onClick={() => alignElementToRect(currentSelectedElements, castedArtboardRef, 'bottom', canvas)}
					>
						<IconLayoutAlignBottom />
					</ActionIcon>
				</Tooltip>
			</Flex>
		</Stack>
	);
};

export default AlignmentPanel;
