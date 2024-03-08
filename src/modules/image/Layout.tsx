import { ActionIcon, Button, Group, NumberInput, Stack, useMantineTheme } from '@mantine/core';
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
import React, { useEffect } from 'react';
import SectionTitle from '../../components/SectionTitle';
import { ObjectPosition } from '../fabricContainer/ObjectContainer';

interface Props {
	currentSelectedElements: fabric.Object[];
	canvas: fabric.Canvas;
}

const Layout: React.FC<Props> = ({ currentSelectedElements, canvas }) => {
	const [zoomValue, setZoomValue] = React.useState(0);
	const [layoutPosition, setLayoutPosition] = React.useState<ObjectPosition | null>(null);
	const theme = useMantineTheme();

	// const getCurrentLayoutPosition = () => {
	// 	const container = currentSelectedElements[0] as fabric.ImageContainer;
	// 	const object = container.getObject();
	// 	if (object.originX === 'left' && object.originY === 'top') {
	// 		return 'top-left';
	// 	} else if (object.originX === 'center' && object.originY === 'top') {
	// 		return 'top-center';
	// 	} else if (object.originX === 'right' && object.originY === 'top') {
	// 		return 'top-right';
	// 	} else if (object.originX === 'left' && object.originY === 'center') {
	// 		return 'center-left';
	// 	} else if (object.originX === 'center' && object.originY === 'center') {
	// 		return 'center';
	// 	} else if (object.originX === 'right' && object.originY === 'center') {
	// 		return 'center-right';
	// 	} else if (object.originX === 'left' && object.originY === 'bottom') {
	// 		return 'bottom-left';
	// 	} else if (object.originX === 'center' && object.originY === 'bottom') {
	// 		return 'bottom-center';
	// 	} else if (object.originX === 'right' && object.originY === 'bottom') {
	// 		return 'bottom-right';
	// 	} else {
	// 		return null;
	// 	}
	// };

	useEffect(() => {
		// Get the scale of the image from inside the group
		const container = currentSelectedElements[0] as fabric.ImageContainer;
		const scale = container.getObject().scaleX;
		if (scale) {
			setZoomValue(scale * 100);
			const layoutPosition = container.containerProperties.objectPosition;
			if (layoutPosition) {
				setLayoutPosition(layoutPosition);
			}
		}
	}, [currentSelectedElements]);

	const updateZoomValue = (value: number) => {
		setZoomValue(value);
		// Update the scale of the image inside the group
		(currentSelectedElements[0] as fabric.ImageContainer).getObject().scale(value / 100);
		canvas.renderAll();
	};

	const resetElementZoom = () => {
		const container = currentSelectedElements[0] as fabric.ImageContainer;
		const object = container.getObject();

		const isWide = object.width! / object.height! > container.width! / container.height!;
		if (isWide) {
			object.scaleToHeight(container.height!);
			setZoomValue(object.scaleY! * 100);
		} else {
			object.scaleToWidth(container.width!);
			setZoomValue(object.scaleX! * 100);
		}
		canvas.renderAll();
	};

	const alignElement = (position: ObjectPosition) => {
		const container = currentSelectedElements[0] as fabric.ImageContainer;
		container.setObjectPosition(position);
		setLayoutPosition(position);
		canvas.renderAll();
	};

	const fitImageInContainer = () => {
		// Fit the image in container maintaining the aspect ratio
		const container = currentSelectedElements[0] as fabric.ImageContainer;
		container.fitImageToContainer();
		setZoomValue(container.getObject().scaleX! * 100);
		canvas.renderAll();
	};

	return (
		<Stack>
			<SectionTitle>Zoom</SectionTitle>
			<NumberInput
				min={1}
				max={100}
				step={0.1}
				precision={1}
				value={zoomValue}
				onChange={updateZoomValue}
				stepHoldDelay={100}
				stepHoldInterval={50}
			/>
			<Button onClick={resetElementZoom}>Fill image in container</Button>
			<Button onClick={fitImageInContainer}>Fit in container</Button>
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

export default Layout;
