import { ActionIcon, Button, Divider, Group, NumberInput, Stack, useMantineTheme } from '@mantine/core';
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
import { ObjectFit, ObjectPosition } from '../fabricContainer/types';

interface Props {
	currentSelectedElements: fabric.Object[];
	canvas: fabric.Canvas;
}

const Layout: React.FC<Props> = ({ currentSelectedElements, canvas }) => {
	const [zoomValue, setZoomValue] = React.useState(0);
	const [layoutPosition, setLayoutPosition] = React.useState<ObjectPosition | null>(null);
	const [objectFit, setObjectFit] = React.useState<ObjectFit>('custom');
	const [border, setBorder] = React.useState({ width: 0, color: '#000' });
	const [borderRadius, setBorderRadius] = React.useState({ tl: 0, tr: 0, br: 0, bl: 0 });
	const theme = useMantineTheme();

	useEffect(() => {
		// Get the scale of the image from inside the group
		const container = currentSelectedElements[0] as fabric.ImageContainer;
		const scale = container.getObject().scaleX;
		if (scale) {
			setZoomValue(scale * 100);
			const layoutPosition = container.properties.objectPosition;
			if (layoutPosition) {
				setLayoutPosition(layoutPosition);
			}
			const fit = container.properties.objectFit;
			if (fit) {
				setObjectFit(fit);
			}
			const border = container.properties.border;
			if (border) {
				setBorder({ width: border.top, color: border.color });
			}
			const radius = container.properties.radius;
			if (radius) {
				setBorderRadius({ ...radius });
			}
		}
	}, [currentSelectedElements]);

	useEffect(() => {
		// When scale is not fitScale or fillScale, set custom
		const container = currentSelectedElements[0] as fabric.ImageContainer;
		const scale = container.getObject().scaleX;
		if (scale !== container.properties.fitScale && scale !== container.properties.fillScale) {
			setObjectFit('custom');
			container.setObjectFit('custom');
		}
	}, [(currentSelectedElements[0] as fabric.ImageContainer).getObject().scaleX]);

	const updateZoomValue = (value: number) => {
		setZoomValue(value);
		// Update the scale of the image inside the group
		(currentSelectedElements[0] as fabric.ImageContainer).getObject().scale(value / 100);
		canvas.renderAll();
	};

	const fillImageInContainer = () => {
		const container = currentSelectedElements[0] as fabric.ImageContainer;
		container.setObjectFit('fill');
		setZoomValue(container.properties.fillScale! * 100);
		setObjectFit('fill');
		canvas.renderAll();
	};

	const fitImageInContainer = () => {
		// Fit the image in container maintaining the aspect ratio
		const container = currentSelectedElements[0] as fabric.ImageContainer;
		container.setObjectFit('fit');
		setZoomValue(container.properties.fitScale! * 100);
		setObjectFit('fit');
		canvas.renderAll();
	};

	const alignElement = (position: ObjectPosition) => {
		const container = currentSelectedElements[0] as fabric.ImageContainer;
		container.setObjectPosition(position);
		setLayoutPosition(position);
		canvas.renderAll();
	};

	const handleBorderWidthChange = (value: number) => {
		setBorder({ ...border, width: value });
		const container = currentSelectedElements[0] as fabric.ImageContainer;
		container.setProperties({
			...container.properties,
			border: {
				...container.properties.border,
				top: value,
				left: value,
				right: value,
				bottom: value,
				color: '#000',
			},
		});
		canvas.renderAll();
	};

	const handleBorderRadiusChange = (value: number, position: 'tl' | 'tr' | 'br' | 'bl') => {
		const container = currentSelectedElements[0] as fabric.ImageContainer;
		const radius = { ...container.properties.radius, [position]: value };
		setBorderRadius(radius);
		container.setProperties({ ...container.properties, radius });
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
			<Button onClick={fillImageInContainer} variant={objectFit === 'fill' ? 'filled' : 'outline'}>
				Fill image in container
			</Button>
			<Button onClick={fitImageInContainer} variant={objectFit === 'fit' ? 'filled' : 'outline'}>
				Fit in container
			</Button>
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
			<Divider />
			<SectionTitle>Border</SectionTitle>
			<NumberInput
				label="Border width"
				min={0}
				max={100}
				step={1}
				precision={0}
				placeholder="Border width"
				size="xs"
				value={border.width}
				onChange={handleBorderWidthChange}
				stepHoldDelay={100}
				stepHoldInterval={50}
			/>
			<Group>
				<NumberInput
					w={'45%'}
					label="Top left"
					min={0}
					max={500}
					step={1}
					precision={0}
					placeholder="Top left"
					size="xs"
					value={borderRadius.tl}
					onChange={value => handleBorderRadiusChange(Number(value), 'tl')}
					stepHoldDelay={100}
					stepHoldInterval={50}
				/>
				<NumberInput
					w={'45%'}
					label="Top right"
					min={0}
					max={500}
					step={1}
					precision={0}
					placeholder="Top right"
					size="xs"
					value={borderRadius.tr}
					onChange={value => handleBorderRadiusChange(Number(value), 'tr')}
					stepHoldDelay={100}
					stepHoldInterval={50}
				/>
			</Group>
			<Group>
				<NumberInput
					w={'45%'}
					label="Bottom left"
					min={0}
					max={500}
					step={1}
					precision={0}
					placeholder="Bottom left"
					size="xs"
					value={borderRadius.bl}
					onChange={value => handleBorderRadiusChange(Number(value), 'bl')}
					stepHoldDelay={100}
					stepHoldInterval={50}
				/>
				<NumberInput
					w={'45%'}
					label="Bottom right"
					min={0}
					max={500}
					step={1}
					precision={0}
					placeholder="Bottom right"
					size="xs"
					value={borderRadius.br}
					onChange={value => handleBorderRadiusChange(Number(value), 'br')}
					stepHoldDelay={100}
					stepHoldInterval={50}
				/>
			</Group>
		</Stack>
	);
};

export default Layout;
