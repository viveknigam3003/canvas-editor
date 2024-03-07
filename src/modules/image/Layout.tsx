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
import { Group as FabricGroup } from 'fabric/fabric-impl';
import { fabric } from 'fabric';
import React, { useEffect } from 'react';
import SectionTitle from '../../components/SectionTitle';

interface Props {
	currentSelectedElements: fabric.Object[];
	canvas: fabric.Canvas;
}

type LayoutPositions =
	| 'center'
	| 'top-left'
	| 'top-center'
	| 'top-right'
	| 'center-left'
	| 'center-right'
	| 'bottom-left'
	| 'bottom-center'
	| 'bottom-right';

const Layout: React.FC<Props> = ({ currentSelectedElements, canvas }) => {
	const [zoomValue, setZoomValue] = React.useState(0);
	const [layoutPosition, setLayoutPosition] = React.useState<LayoutPositions | null>(null);
	const theme = useMantineTheme();

	const getCurrentLayoutPosition = () => {
		const element = currentSelectedElements[0] as FabricGroup;
		const subElement = element.getObjects()[0];
		if (subElement.originX === 'left' && subElement.originY === 'top') {
			return 'top-left';
		} else if (subElement.originX === 'center' && subElement.originY === 'top') {
			return 'top-center';
		} else if (subElement.originX === 'right' && subElement.originY === 'top') {
			return 'top-right';
		} else if (subElement.originX === 'left' && subElement.originY === 'center') {
			return 'center-left';
		} else if (subElement.originX === 'center' && subElement.originY === 'center') {
			return 'center';
		} else if (subElement.originX === 'right' && subElement.originY === 'center') {
			return 'center-right';
		} else if (subElement.originX === 'left' && subElement.originY === 'bottom') {
			return 'bottom-left';
		} else if (subElement.originX === 'center' && subElement.originY === 'bottom') {
			return 'bottom-center';
		} else if (subElement.originX === 'right' && subElement.originY === 'bottom') {
			return 'bottom-right';
		} else {
			return null;
		}
	};

	useEffect(() => {
		// Get the scale of the image from inside the group
		const scale = (currentSelectedElements[0] as FabricGroup).getObjects()[0].scaleX;
		if (scale) {
			setZoomValue(scale * 100);
			const layoutPosition = getCurrentLayoutPosition();
			if (layoutPosition) {
				setLayoutPosition(layoutPosition);
			}
		}
	}, [currentSelectedElements]);

	const updateZoomValue = (value: number) => {
		setZoomValue(value);
		// Update the scale of the image inside the group
		(currentSelectedElements[0] as FabricGroup).getObjects()[0].scale(value / 100);
		canvas.renderAll();
	};

	const resetElementZoom = () => {
		const element = currentSelectedElements[0] as FabricGroup;
		const subElement = element.getObjects()[0];

		const isWide = subElement.width! / subElement.height! > element.width! / element.height!;
		if (isWide) {
			subElement.scaleToHeight(element.height!);
			setZoomValue(subElement.scaleY! * 100);
		} else {
			subElement.scaleToWidth(element.width!);
			setZoomValue(subElement.scaleX! * 100);
		}
		canvas.renderAll();
	};

	const alignElementToTopLeft = () => {
		const element = currentSelectedElements[0] as FabricGroup;
		const subElement = element.getObjects()[0];
		subElement.set({
			left: -element.width! / 2,
			top: -element.height! / 2,
			originX: 'left',
			originY: 'top',
		});
		element.setCoords();
		setLayoutPosition('top-left');
		canvas.renderAll();
	};

	const alignElementToTopRight = () => {
		const element = currentSelectedElements[0] as FabricGroup;
		const subElement = element.getObjects()[0];
		subElement.set({
			left: element.width! / 2,
			top: -element.height! / 2,
			originX: 'right',
			originY: 'top',
		});
		element.setCoords();
		setLayoutPosition('top-right');
		canvas.renderAll();
	};

	const alignElementToBottomLeft = () => {
		const element = currentSelectedElements[0] as FabricGroup;
		const subElement = element.getObjects()[0];
		subElement.set({
			left: -element.width! / 2,
			top: element.height! / 2,
			originX: 'left',
			originY: 'bottom',
		});
		element.setCoords();
		setLayoutPosition('bottom-left');
		canvas.renderAll();
	};

	const alignElementToBottomRight = () => {
		const element = currentSelectedElements[0] as FabricGroup;
		const subElement = element.getObjects()[0];
		subElement.set({
			left: element.width! / 2,
			top: element.height! / 2,
			originX: 'right',
			originY: 'bottom',
		});
		element.setCoords();
		setLayoutPosition('bottom-right');
		canvas.renderAll();
	};

	const alignElementToTopCenter = () => {
		const element = currentSelectedElements[0] as FabricGroup;
		const subElement = element.getObjects()[0];
		subElement.set({
			left: 0,
			top: -element.height! / 2,
			originX: 'center',
			originY: 'top',
		});
		element.setCoords();
		setLayoutPosition('top-center');
		canvas.renderAll();
	};

	const alignElementToBottomCenter = () => {
		const element = currentSelectedElements[0] as FabricGroup;
		const subElement = element.getObjects()[0];
		subElement.set({
			left: 0,
			top: element.height! / 2,
			originX: 'center',
			originY: 'bottom',
		});
		element.setCoords();
		setLayoutPosition('bottom-center');
		canvas.renderAll();
	};

	const alignElementToCenterRight = () => {
		const element = currentSelectedElements[0] as FabricGroup;
		const subElement = element.getObjects()[0];
		subElement.set({
			left: element.width! / 2,
			top: 0,
			originX: 'right',
			originY: 'center',
		});
		element.setCoords();
		setLayoutPosition('center-right');
		canvas.renderAll();
	};

	const alignElementToCenterLeft = () => {
		const element = currentSelectedElements[0] as FabricGroup;
		const subElement = element.getObjects()[0];
		subElement.set({
			left: -element.width! / 2,
			top: 0,
			originX: 'left',
			originY: 'center',
		});
		element.setCoords();
		setLayoutPosition('center-left');
		canvas.renderAll();
	};

	const alignElementToCenter = () => {
		const element = currentSelectedElements[0] as FabricGroup;
		const subElement = element.getObjects()[0];
		subElement.set({
			left: 0,
			top: 0,
			originX: 'center',
			originY: 'center',
		});
		element.setCoords();
		setLayoutPosition('center');
		canvas.renderAll();
	};

	const fitImageInContainer = () => {
		// Fit the image in container maintaining the aspect ratio
		const element = currentSelectedElements[0] as FabricGroup;
		const subElement = element.getObjects()[0];

		// Calculate scale based on if the image is wider or taller than the container
		// If the image is wider than the container, scale it to fit the width
		// If the image is taller than the container, scale it to fit the height
		const isWide = subElement.width! / subElement.height! > element.width! / element.height!;
		const scale = isWide ? element.width! / subElement.width! : element.height! / subElement.height!;
		subElement.scale(scale);
		subElement.setCoords();
		setZoomValue(scale * 100);
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
					onClick={alignElementToTopLeft}
					color={layoutPosition === 'top-left' ? theme.colors.violet[5] : 'gray'}
				>
					{layoutPosition === 'top-left' ? <IconAlignBoxLeftTopFilled /> : <IconAlignBoxLeftTop />}
				</ActionIcon>
				<ActionIcon
					onClick={alignElementToTopCenter}
					color={layoutPosition === 'top-center' ? theme.colors.violet[5] : 'gray'}
				>
					{layoutPosition === 'top-center' ? <IconAlignBoxTopCenterFilled /> : <IconAlignBoxTopCenter />}
				</ActionIcon>
				<ActionIcon
					onClick={alignElementToTopRight}
					color={layoutPosition === 'top-right' ? theme.colors.violet[5] : 'gray'}
				>
					{layoutPosition === 'top-right' ? <IconAlignBoxRightTopFilled /> : <IconAlignBoxRightTop />}
				</ActionIcon>
			</Group>
			<Group>
				<ActionIcon
					onClick={alignElementToCenterLeft}
					color={layoutPosition === 'center-left' ? theme.colors.violet[5] : 'gray'}
				>
					{layoutPosition === 'center-left' ? <IconAlignBoxLeftMiddleFilled /> : <IconAlignBoxLeftMiddle />}
				</ActionIcon>
				<ActionIcon
					onClick={alignElementToCenter}
					color={layoutPosition === 'center' ? theme.colors.violet[5] : 'gray'}
				>
					{layoutPosition === 'center' ? <IconAlignBoxCenterMiddleFilled /> : <IconAlignBoxCenterMiddle />}
				</ActionIcon>
				<ActionIcon
					onClick={alignElementToCenterRight}
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
					onClick={alignElementToBottomLeft}
					color={layoutPosition === 'bottom-left' ? theme.colors.violet[5] : 'gray'}
				>
					{layoutPosition === 'bottom-left' ? <IconAlignBoxLeftBottomFilled /> : <IconAlignBoxLeftBottom />}
				</ActionIcon>
				<ActionIcon
					onClick={alignElementToBottomCenter}
					color={layoutPosition === 'bottom-center' ? theme.colors.violet[5] : 'gray'}
				>
					{layoutPosition === 'bottom-center' ? (
						<IconAlignBoxBottomCenterFilled />
					) : (
						<IconAlignBoxBottomCenter />
					)}
				</ActionIcon>
				<ActionIcon
					onClick={alignElementToBottomRight}
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
