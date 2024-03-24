import { ActionIcon, Group, Stack, useMantineTheme } from '@mantine/core';
import {
	IconAlignBoxBottomCenter,
	IconAlignBoxBottomCenterFilled,
	IconAlignBoxCenterMiddle,
	IconAlignBoxCenterMiddleFilled,
	IconAlignBoxLeftBottom,
	IconAlignBoxLeftBottomFilled,
	IconAlignBoxLeftMiddle,
	IconAlignBoxLeftMiddleFilled,
	IconAlignBoxLeftTop,
	IconAlignBoxLeftTopFilled,
	IconAlignBoxRightBottom,
	IconAlignBoxRightBottomFilled,
	IconAlignBoxRightMiddle,
	IconAlignBoxRightMiddleFilled,
	IconAlignBoxRightTop,
	IconAlignBoxRightTopFilled,
	IconAlignBoxTopCenter,
	IconAlignBoxTopCenterFilled,
} from '@tabler/icons-react';
import { fabric } from 'fabric';
import React from 'react';
import SectionTitle from '../../components/SectionTitle';
import { ObjectPosition } from '../fabricContainer/types';

interface Props {
	currentSelectedElements: fabric.Object[];
	canvas: fabric.Canvas;
}

const TextLayout: React.FC<Props> = ({ currentSelectedElements, canvas }) => {
	const [layoutPosition, setLayoutPosition] = React.useState<ObjectPosition | null>(null);
	const theme = useMantineTheme();

	const alignElement = (position: ObjectPosition) => {
		const container = currentSelectedElements[0] as fabric.ImageContainer;
		container.setObjectPosition(position);
		setLayoutPosition(position);
		canvas.renderAll();
	};

	return (
		<Stack>
			<SectionTitle>Layout</SectionTitle>
			<Group>
				<ActionIcon
					onClick={() => alignElement('top-left')}
					color={layoutPosition === 'top-left' ? theme.colors.violet[5] : 'gray'}
				>
					{layoutPosition === 'top-left' ? <IconAlignBoxLeftTopFilled /> : <IconAlignBoxLeftTop />}
				</ActionIcon>
				<ActionIcon
					onClick={() => alignElement('top-center')}
					color={layoutPosition === 'top-center' ? theme.colors.violet[5] : 'gray'}
				>
					{layoutPosition === 'top-center' ? <IconAlignBoxTopCenterFilled /> : <IconAlignBoxTopCenter />}
				</ActionIcon>
				<ActionIcon
					onClick={() => alignElement('top-right')}
					color={layoutPosition === 'top-right' ? theme.colors.violet[5] : 'gray'}
				>
					{layoutPosition === 'top-right' ? <IconAlignBoxRightTopFilled /> : <IconAlignBoxRightTop />}
				</ActionIcon>
			</Group>
			<Group>
				<ActionIcon
					onClick={() => alignElement('center-left')}
					color={layoutPosition === 'center-left' ? theme.colors.violet[5] : 'gray'}
				>
					{layoutPosition === 'center-left' ? <IconAlignBoxLeftMiddleFilled /> : <IconAlignBoxLeftMiddle />}
				</ActionIcon>
				<ActionIcon
					onClick={() => alignElement('center')}
					color={layoutPosition === 'center' ? theme.colors.violet[5] : 'gray'}
				>
					{layoutPosition === 'center' ? <IconAlignBoxCenterMiddleFilled /> : <IconAlignBoxCenterMiddle />}
				</ActionIcon>
				<ActionIcon
					onClick={() => alignElement('center-right')}
					color={layoutPosition === 'center-right' ? theme.colors.violet[5] : 'gray'}
				>
					{layoutPosition === 'center-right' ? (
						<IconAlignBoxRightMiddleFilled />
					) : (
						<IconAlignBoxRightMiddle />
					)}
				</ActionIcon>
			</Group>
			<Group>
				<ActionIcon
					onClick={() => alignElement('bottom-left')}
					color={layoutPosition === 'bottom-left' ? theme.colors.violet[5] : 'gray'}
				>
					{layoutPosition === 'bottom-left' ? <IconAlignBoxLeftBottomFilled /> : <IconAlignBoxLeftBottom />}
				</ActionIcon>
				<ActionIcon
					onClick={() => alignElement('bottom-center')}
					color={layoutPosition === 'bottom-center' ? theme.colors.violet[5] : 'gray'}
				>
					{layoutPosition === 'bottom-center' ? (
						<IconAlignBoxBottomCenterFilled />
					) : (
						<IconAlignBoxBottomCenter />
					)}
				</ActionIcon>
				<ActionIcon
					onClick={() => alignElement('bottom-right')}
					color={layoutPosition === 'bottom-right' ? theme.colors.violet[5] : 'gray'}
				>
					{layoutPosition === 'bottom-right' ? (
						<IconAlignBoxRightBottomFilled />
					) : (
						<IconAlignBoxRightBottom />
					)}
				</ActionIcon>
			</Group>
		</Stack>
	);
};

export default TextLayout;
