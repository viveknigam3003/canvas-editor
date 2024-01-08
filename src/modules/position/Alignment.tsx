import { ActionIcon, Flex, Stack, Tooltip } from '@mantine/core';
import { useHotkeys } from '@mantine/hooks';
import {
	IconLayoutAlignBottom,
	IconLayoutAlignCenter,
	IconLayoutAlignLeft,
	IconLayoutAlignMiddle,
	IconLayoutAlignRight,
	IconLayoutAlignTop,
} from '@tabler/icons-react';
import SectionTitle from '../../components/SectionTitle';
import { getAltKey } from '../../modules/utils/keyboard';
import { Artboard } from '../../types';
import { alignElementToRect } from './helpers';

type PanelProps = {
	canvas: fabric.Canvas;
	currentSelectedElements: fabric.Object[];
	activeArtboard: Artboard;
};

const AlignmentPanel = ({ canvas, currentSelectedElements, activeArtboard }: PanelProps) => {
	//TODO: fix this
	useHotkeys([
		[
			'alt+a',
			e => {
				e.preventDefault();
				alignElementToRect(currentSelectedElements, activeArtboard.id, 'left', canvas);
			},
		],
		[
			'alt+d',
			e => {
				e.preventDefault();
				alignElementToRect(currentSelectedElements, activeArtboard.id, 'right', canvas);
			},
		],
		[
			'alt+h',
			e => {
				e.preventDefault();
				alignElementToRect(currentSelectedElements, activeArtboard.id, 'center', canvas);
			},
		],
		[
			'alt+w',
			e => {
				e.preventDefault();
				alignElementToRect(currentSelectedElements, activeArtboard.id, 'top', canvas);
			},
		],
		[
			'alt+s',
			e => {
				e.preventDefault();
				alignElementToRect(currentSelectedElements, activeArtboard.id, 'bottom', canvas);
			},
		],
		[
			'alt+v',
			e => {
				e.preventDefault();
				alignElementToRect(currentSelectedElements, activeArtboard.id, 'middle', canvas);
			},
		],
	]);

	return (
		<Stack>
			<SectionTitle>Alignment</SectionTitle>
			<Flex gap={16}>
				<Tooltip label={`Align Left (${getAltKey()} + A)`}>
					<ActionIcon
						onClick={() => alignElementToRect(currentSelectedElements, activeArtboard.id, 'left', canvas)}
					>
						<IconLayoutAlignLeft />
					</ActionIcon>
				</Tooltip>
				<Tooltip label={`Align Center (${getAltKey()} + H)`}>
					<ActionIcon
						onClick={() => alignElementToRect(currentSelectedElements, activeArtboard.id, 'center', canvas)}
					>
						<IconLayoutAlignMiddle />{' '}
					</ActionIcon>
				</Tooltip>
				<Tooltip label={`Align Right (${getAltKey()} + D)`}>
					<ActionIcon
						onClick={() => alignElementToRect(currentSelectedElements, activeArtboard.id, 'right', canvas)}
					>
						<IconLayoutAlignRight />
					</ActionIcon>
				</Tooltip>
				<Tooltip label={`Align Top (${getAltKey()} + W)`}>
					<ActionIcon
						onClick={() => alignElementToRect(currentSelectedElements, activeArtboard.id, 'top', canvas)}
					>
						<IconLayoutAlignTop />
					</ActionIcon>
				</Tooltip>
				<Tooltip label={`Align Middle (${getAltKey()} + V)`}>
					<ActionIcon
						onClick={() => alignElementToRect(currentSelectedElements, activeArtboard.id, 'middle', canvas)}
					>
						<IconLayoutAlignCenter />
					</ActionIcon>
				</Tooltip>
				<Tooltip label={`Align Bottom (${getAltKey()} + S)`}>
					<ActionIcon
						onClick={() => alignElementToRect(currentSelectedElements, activeArtboard.id, 'bottom', canvas)}
					>
						<IconLayoutAlignBottom />
					</ActionIcon>
				</Tooltip>
			</Flex>
		</Stack>
	);
};

export default AlignmentPanel;
