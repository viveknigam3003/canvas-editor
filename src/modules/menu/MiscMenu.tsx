import { ActionIcon, Group, Tooltip } from '@mantine/core';
import { IconArtboard } from '@tabler/icons-react';
import { fabric } from 'fabric';
import { useState } from 'react';
import { Artboard } from '../../types';
import { generateId } from '../../utils';

type MiscMenuProps = {
	artboardRef: React.RefObject<fabric.Rect>;
	selectedArtboard: Artboard | null;
	canvasRef: React.RefObject<fabric.Canvas>;
	artboards: Artboard[];
};
const RENDER_N = 2500;

export default function MiscMenu({ artboards, canvasRef }: MiscMenuProps) {
	const [isRendering, setRendering] = useState(false);

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
			setRendering(false);
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

		console.log('Total artboards = ', allArtboards.length);
		return allArtboards;
	};

	return (
		<Group>
			<Tooltip label="Simulate multiple artboards" openDelay={500}>
				<ActionIcon
					disabled={isRendering}
					onClick={() => {
						setRendering(true);
						const data = createBulkData();
						renderMultipleArtboards(data);
					}}
				>
					<IconArtboard size={14} />
				</ActionIcon>
			</Tooltip>
		</Group>
	);
}
