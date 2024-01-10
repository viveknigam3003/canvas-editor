import { ActionIcon, Group, Tooltip, useMantineTheme } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconArtboard, IconEye } from '@tabler/icons-react';
import { fabric } from 'fabric';
import { useEffect, useState } from 'react';
import { Artboard } from '../../types';
import { generateId } from '../../utils';

type MiscMenuProps = {
	canvasRef: React.RefObject<fabric.Canvas>;
	artboards: Artboard[];
};
const RENDER_N = 2500;

export default function MiscMenu({ artboards, canvasRef }: MiscMenuProps) {
	const theme = useMantineTheme();
	const [isPreviewing, setPreviewing] = useState(false);
	const [isSimulating, setSimulating] = useState(false);

	const renderMultipleArtboards = (artboards: Artboard[]) => {
		// Render all artboards on the canvas
		canvasRef.current?.clear();
		let topCursor = 0;
		let leftCursor = 0;
		const MARGIN = 50;

		const canvasState = [];

		for (let i = 0; i < artboards.length; i++) {
			const artboard = artboards[i];
			const width = artboard.width;
			const height = artboard.height;

			if (!width || !height) {
				continue;
			}

			// Just render the artboard on the canvas four on each row
			if (i % 10 === 0) {
				// Move the cursor to the next row
				topCursor += height + MARGIN;
				leftCursor = 0;
			} else {
				leftCursor += width + MARGIN;
			}

			const adjustedArtboard = {
				...artboard,
				state: {
					...artboard.state,
					objects: artboard.state?.objects.map((item: any) => {
						return {
							...item,
							left: item.left + leftCursor,
							top: item.top + topCursor,
							evented: false,
							selectable: false,
							objectCaching: true,
							data: {
								...item.data,
								ignoreSnapping: true,
							},
						};
					}),
				},
			};

			canvasState.push(...adjustedArtboard.state.objects);
		}

		const json = {
			objects: canvasState,
		};

		canvasRef.current?.loadFromJSON(json, () => {
			canvasRef.current?.renderAll();
			console.log('Performance', window.performance);

			const title = isPreviewing
				? `Previewing ${artboards.length} artboards`
				: `Rendered ${artboards.length / RENDER_N} artboards with ${RENDER_N} duplicates`;

			const message = 'Total artboards: ' + artboards.length;

			notifications.show({
				icon: <IconArtboard size={14} />,
				title,
				message,
				color: 'green',
				autoClose: 3000,
			});
		});
	};

	const createBulkData = () => {
		// With the current artboards, duplicate each artboard 10 times but with different IDs
		const allArtboards: Artboard[] = [];
		for (let i = 0; i < RENDER_N; i++) {
			for (let j = 0; j < artboards.length; j++) {
				const artboard = artboards[j];
				const newArtboard = {
					...artboard,
					id: generateId(),
				};
				allArtboards.push(newArtboard);
			}
		}

		return allArtboards;
	};

	useEffect(() => {
		if (isPreviewing && artboards.length > 0) {
			renderMultipleArtboards(artboards);
		}
	}, [isPreviewing, artboards]);

	useEffect(() => {
		if (isSimulating) {
			const data = createBulkData();
			renderMultipleArtboards(data);
		}
	}, [isSimulating]);

	return (
		<Group spacing={4}>
			<Tooltip label="Mulitple preview" openDelay={500}>
				<ActionIcon
					onClick={() => {
						setPreviewing(p => !p);
						setSimulating(false);
					}}
				>
					<IconEye
						size={14}
						color={theme.colorScheme === 'dark' ? theme.colors.gray[5] : theme.colors.gray[7]}
					/>
				</ActionIcon>
			</Tooltip>
			<Tooltip label="Simulate multiple artboards" openDelay={500}>
				<ActionIcon
					onClick={() => {
						setSimulating(p => !p);
						setPreviewing(false);
					}}
				>
					<IconArtboard
						size={14}
						color={theme.colorScheme === 'dark' ? theme.colors.gray[5] : theme.colors.gray[7]}
					/>
				</ActionIcon>
			</Tooltip>
		</Group>
	);
}
