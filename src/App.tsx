import {
	ActionIcon,
	Box,
	Button,
	Center,
	Flex,
	Group,
	Modal,
	NumberInput,
	Stack,
	Text,
	TextInput,
	Tooltip,
	createStyles,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure, useHotkeys } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
	IconBoxModel2,
	IconCircleCheck,
	IconDeviceFloppy,
	IconDownload,
	IconFileDownload,
	IconPlus,
} from '@tabler/icons-react';
import axios from 'axios';
import { fabric } from 'fabric';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AddMenu from './components/AddMenu';
import MiscMenu from './components/MiscMenu';
import Panel from './components/Panel';
import SettingsMenu from './components/SettingsMenu';
import { useModalStyles, useQueryParam } from './hooks';
import { appStart, setArtboards } from './modules/app/actions';
import { redo, undo } from './modules/history/actions';
import store from './store';
import { RootState } from './store/rootReducer';
import { Artboard, colorSpaceType } from './types';

const generateId = () => {
	return Math.random().toString(36).substr(2, 9);
};

store.dispatch(appStart());

function App() {
	const dispatch = useDispatch();
	const artboards = useSelector((state: RootState) => state.app.artboards);
	const { classes } = useStyles();
	const [showSidebar, setShowSidebar] = useState(true);
	const [colorSpace] = useQueryParam('colorSpace', 'srgb');
	//TODO: Ak maybe use saga here for scalability and take effect on undo/redo?
	const [currentSelectedElement, setCurrentSelectedElement] = useState<fabric.Object[] | null>(null);
	const { classes: modalClasses } = useModalStyles();
	const [opened, { open, close }] = useDisclosure();
	const newArtboardForm = useForm<Omit<Artboard, 'id'> & { number: number }>({
		initialValues: {
			name: '',
			width: 500,
			height: 500,
			number: 1,
		},
		validate: values => {
			const errors: Record<string, string> = {};
			if (values.name.trim().length === 0) {
				errors.name = 'Artboard name cannot be empty';
			}
			if (values.width < 1) {
				errors.width = 'Artboard width cannot be less than 1px';
			}
			if (values.height < 1) {
				errors.height = 'Artboard height cannot be less than 1px';
			}
			if (values.number < 1) {
				errors.number = 'Number of artboards cannot be less than 1';
			}
			return errors;
		},
	});

	const [selectedArtboard, setSelectedArtboard] = useState<Artboard | null>(null);
	const [isDownloading, setIsDownloading] = useState(false);
	const canvasRef = useRef<fabric.Canvas | null>(null);
	const artboardRef = useRef<fabric.Rect | null>(null);
	const canvasContainerRef = useRef<HTMLDivElement | null>(null);
	const [isCreatingArboards, setIsCreatingArtboards] = useState(false);
	const [showAll, setShowAll] = useState(false);

	useEffect(() => {
		if (artboards?.[0]) {
			setSelectedArtboard(artboards?.[0]);
		}
	}, []);

	const undoable = useSelector((state: RootState) => state.history.undoable);
	const redoable = useSelector((state: RootState) => state.history.redoable);

	useEffect(() => {
		canvasRef.current = new fabric.Canvas('canvas', {
			// create a canvas with clientWidth and clientHeight
			width: window.innerWidth - 600,
			height: window.innerHeight - 60,
			backgroundColor: '#e9ecef',
			colorSpace: colorSpace as colorSpaceType,
		});

		// Handle element selection TODO: add more element type and handle it
		canvasRef.current?.on('selection:created', function (event) {
			setCurrentSelectedElement(event.selected as fabric.Object[]);
		});
		canvasRef.current?.on('selection:updated', function (event) {
			setCurrentSelectedElement(event.selected as fabric.Object[]);
		});
		canvasRef.current?.on('selection:cleared', function () {
			setCurrentSelectedElement(null);
		});

		return () => {
			canvasRef.current?.dispose();
		};
	}, []);

	const recreateCanvas = () => {
		//reload window
		saveArtboardChanges();
		window.location.reload();
	};

	useEffect(() => {
		if (selectedArtboard) {
			// Load state if it exists
			if (selectedArtboard.state) {
				canvasRef.current?.loadFromJSON(selectedArtboard.state, () => {
					canvasRef.current?.renderAll();
					// change artboard ref
					const artboard = canvasRef.current?.getObjects().find(item => item.data.type === 'artboard');
					if (artboard) {
						artboardRef.current = artboard as fabric.Rect;
					}
				});
			}
		}
	}, [selectedArtboard]);

	// Update canvas size when viewport size changes
	useEffect(() => {
		const handleResize = () => {
			canvasRef.current?.setDimensions({
				width: window.innerWidth,
				height: window.innerHeight - 60,
			});
		};

		window.addEventListener('resize', handleResize);

		return () => {
			window.removeEventListener('resize', handleResize);
		};
	}, []);

	const resetZoom = () => {
		canvasRef.current?.setZoom(1);
		// Place the canvas in the center of the screen
		centerBoardToCanvas(artboardRef);
	};

	const centerBoardToCanvas = (artboardRef: React.MutableRefObject<fabric.Rect | null>) => {
		const artboardLeft = artboardRef.current?.left;
		const artboardTop = artboardRef.current?.top;
		const artboardWidth = artboardRef.current?.width;
		const artboardHeight = artboardRef.current?.height;
		const canvasWidth = canvasRef.current?.width;
		const canvasHeight = canvasRef.current?.height;

		if (!artboardLeft || !artboardTop || !artboardWidth || !artboardHeight || !canvasWidth || !canvasHeight) {
			return;
		}

		const left = (canvasWidth - artboardWidth) / 2 - artboardLeft;
		const top = (canvasHeight - artboardHeight) / 2 - artboardTop;

		canvasRef.current?.absolutePan({
			x: left,
			y: top,
		});
	};

	const createSingleArtboard = (artboard: Omit<Artboard, 'id'>, index: number) => {
		const id = generateId();
		const newArtboard: Artboard = {
			...artboard,
			name: `${artboard.name} ${index + 1}`,
			id,
		};

		const artboardRect = new fabric.Rect({
			left: (window.innerWidth - 600) / 2 - artboard.width / 2,
			top: (window.innerHeight - 60) / 2 - artboard.height / 2,
			width: artboard.width,
			height: artboard.height,
			fill: '#fff',
			selectable: false,
			data: {
				type: 'artboard',
				id,
			},
		});

		const offScreenCanvas = new fabric.Canvas('offscreen', {
			width: window.innerWidth - 600,
			height: window.innerHeight - 60,
			backgroundColor: '#e9ecef',
			imageSmoothingEnabled: false,
			colorSpace: colorSpace as colorSpaceType,
		});

		offScreenCanvas.add(artboardRect);
		const json = offScreenCanvas.toJSON(['data', 'selectable']);
		offScreenCanvas.dispose();
		return {
			...newArtboard,
			state: json,
		};
	};

	const addNewArtboard = (artboard: Omit<Artboard, 'id'>) => {
		const validationResult = newArtboardForm.validate();
		if (validationResult.hasErrors) {
			console.log('Errors in new artboard form', validationResult.errors);
			return;
		}
		const id = generateId();
		const newArtboard: Artboard = { ...artboard, id };
		setSelectedArtboard(newArtboard);

		canvasRef.current?.clear();
		const artboardRect = new fabric.Rect({
			left: (window.innerWidth - 600) / 2 - artboard.width / 2,
			top: (window.innerHeight - 60) / 2 - artboard.height / 2,
			width: artboard.width,
			height: artboard.height,
			fill: '#fff',
			selectable: false,
			data: {
				type: 'artboard',
				id,
			},
		});

		canvasRef.current?.add(artboardRect);
		artboardRef.current = artboardRect;
		// Save the state of the canvas
		const json = canvasRef.current?.toJSON(['data', 'selectable']);
		const updatedArtboards = [
			...artboards,
			{
				...newArtboard,
				state: json,
			},
		];
		dispatch(setArtboards(updatedArtboards));
		newArtboardForm.reset();
		close();
	};

	const createMultipleArtboards = (artboard: Omit<Artboard, 'id'>, n: number) => {
		setIsCreatingArtboards(true);
		// Use the addNewArtboard function to create multiple artboards
		const allArtboards = [];
		for (let i = 0; i < n; i++) {
			const newArtboard = createSingleArtboard(artboard, i);
			allArtboards.push(newArtboard);
		}

		// Update the artboards state
		const updatedArtboards = [...artboards, ...allArtboards];
		dispatch(setArtboards(updatedArtboards));
		newArtboardForm.reset();
		setSelectedArtboard(allArtboards[0]);
		setIsCreatingArtboards(false);
		close();
	};

	const updateSelectedArtboard = (artboard: Artboard) => {
		if (selectedArtboard?.id === artboard.id) {
			return;
		}

		// clear the canvas of selected artboard
		canvasRef.current?.clear();
		setSelectedArtboard(artboard);
	};

	const exportAllArtboards = async () => {
		try {
			// Download all artboards as zip from backend
			setIsDownloading(true);
			const res = await axios.post(
				'http://localhost:5000/api/download',
				{ artboards, origin: window.location.origin },
				{
					responseType: 'blob',
				},
			);

			if (!res.data) {
				throw new Error('Response data is undefined');
			}

			const url = window.URL.createObjectURL(new Blob([res.data]));
			const link = document.createElement('a');
			link.href = url;
			link.setAttribute('download', 'artboards.zip');
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			console.log(res.data);
		} catch (error) {
			console.log(error);
		} finally {
			setIsDownloading(false);
		}
	};

	const exportArtboard = () => {
		const artboardLeftAdjustment = canvasRef.current?.getObjects().find(item => item.data.type === 'artboard')
			?.left;
		const artboardTopAdjustment = canvasRef.current?.getObjects().find(item => item.data.type === 'artboard')?.top;

		if (!artboardLeftAdjustment || !artboardTopAdjustment) {
			return;
		}

		// Now we need to create a new canvas and add the artboard to it
		const offscreenCanvas = new fabric.Canvas('print', {
			width: artboardRef.current?.width,
			height: artboardRef.current?.height,
			colorSpace: colorSpace as colorSpaceType,
		});

		const stateJSON = canvasRef.current?.toJSON(['data', 'selectable']);

		const adjustedStateJSONObjects = stateJSON?.objects?.map((item: any) => {
			return {
				...item,
				left: item.left - artboardLeftAdjustment,
				top: item.top - artboardTopAdjustment,
			};
		});
		const adjustedStateJSON = {
			...stateJSON,
			objects: adjustedStateJSONObjects,
		};

		offscreenCanvas.loadFromJSON(adjustedStateJSON, () => {
			offscreenCanvas.renderAll();
			console.log('Offscreen canvas = ', offscreenCanvas.toJSON(['data', 'selectable']));

			const multiplier = getMultiplierFor4K(artboardRef.current?.width, artboardRef.current?.height);

			const config = {
				format: 'png',
				multiplier,
			};

			// render the offscreen canvas to a dataURL
			const dataURL = offscreenCanvas.toDataURL(config);

			const link = document.createElement('a');
			if (dataURL) {
				link.href = dataURL;
				link.download = 'canvas_4k.png';
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
			}
		});
	};

	const getMultiplierFor4K = (width?: number, height?: number): number => {
		// Assuming the canvas is not already 4K, calculate the multiplier needed
		// to scale the current canvas size up to 4K resolution
		const maxWidth = 3840; // for UHD 4K width
		const maxHeight = 2160; // for UHD 4K height
		const widthMultiplier = maxWidth / (width || 1);
		const heightMultiplier = maxHeight / (height || 1);

		// Use the smaller multiplier to ensure the entire canvas fits into the 4K resolution
		return Math.min(widthMultiplier, heightMultiplier);
	};

	const saveArtboardChanges = () => {
		if (!selectedArtboard) {
			return;
		}

		const json = canvasRef.current?.toJSON(['data', 'selectable']);
		const updatedArtboards = artboards.map(item => {
			if (item.id === selectedArtboard.id) {
				return {
					...item,
					state: json,
				};
			}
			return item;
		});
		dispatch(setArtboards(updatedArtboards));
	};

	const getMaxMinZoomLevel = (dimensions: { width: number; height: number }) => {
		const { width, height } = dimensions;

		if (width >= 10000 || height >= 10000) {
			return {
				minZoom: 0.01,
				maxZoom: 5,
			};
		}

		if (width >= 5000 || height >= 5000) {
			return {
				minZoom: 0.025,
				maxZoom: 10,
			};
		}

		if (width >= 2000 || height >= 2000) {
			return {
				minZoom: 0.1,
				maxZoom: 20,
			};
		}

		return {
			minZoom: 0.1,
			maxZoom: 10,
		};
	};

	// Handle the undo and redo actions to update artboards
	useEffect(() => {
		if (!selectedArtboard) {
			return;
		}

		const currentArtboardState = artboards.find(item => item.id === selectedArtboard.id);

		if (!currentArtboardState) {
			return;
		}

		const json = currentArtboardState.state;
		canvasRef.current?.loadFromJSON(json, () => {
			canvasRef.current?.renderAll();
		});
	}, [selectedArtboard, artboards]);

	// Handle dragging of canvas with mouse down and alt key pressed
	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) {
			return;
		}

		const handlePan = (opt: any) => {
			// Handle panning based on deltaX and deltaY but prevent zooming
			const e = opt.e;
			e.preventDefault();
			if (e.ctrlKey || e.metaKey) {
				const delta = opt.e.deltaY;
				let zoom = canvas.getZoom();
				zoom *= 0.99 ** delta;

				const { minZoom, maxZoom } = getMaxMinZoomLevel({
					width: selectedArtboard?.width || 1,
					height: selectedArtboard?.height || 1,
				});

				if (zoom > maxZoom) zoom = maxZoom;
				if (zoom < minZoom) zoom = minZoom;
				if (!zoom || isNaN(zoom)) {
					zoom = minZoom;
				}
				canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
			} else {
				const vpt = canvas.viewportTransform;
				if (!vpt) {
					return;
				}

				vpt[4] -= e.deltaX;
				vpt[5] -= e.deltaY;
				canvas.requestRenderAll();
			}
		};

		canvas.on('mouse:wheel', handlePan);

		return () => {
			canvas.off('mouse:wheel', handlePan);
		};
	}, [selectedArtboard?.height, selectedArtboard?.width]);

	useHotkeys([
		[
			'mod+shift+z',
			() => {
				if (redoable) {
					dispatch(redo());
				}
			},
		],
		[
			'mod+z',
			() => {
				if (undoable) {
					dispatch(undo());
				}
			},
		],
		[
			'mod+s',
			e => {
				e.preventDefault();
				saveArtboardChanges();
				notifications.show({
					title: 'Changes saved',
					message: 'Artboard changes saved successfully',
					icon: <IconCircleCheck size={20} />,
					color: 'green',
					autoClose: 1500,
				});
			},
		],
	]);

	return (
		<Box className={classes.root}>
			<Box className={classes.header} px={16}>
				<Flex gap={16} justify={'center'} align={'center'}>
					<Flex justify={'center'} align={'center'} mih={64}>
						{/* <img src="/logo.png" alt="logo" width={64} height={64} /> */}
						<Text className={classes.logo}>Phoenix Editor</Text>
					</Flex>
					<AddMenu artboardRef={artboardRef} selectedArtboard={selectedArtboard} canvasRef={canvasRef} />
					<MiscMenu
						artboards={artboards}
						artboardRef={artboardRef}
						selectedArtboard={selectedArtboard}
						canvasRef={canvasRef}
					/>
				</Flex>
				<Group>
					<SettingsMenu
						recreateCanvas={recreateCanvas}
						canvasRef={canvasRef}
						setShowSidebar={setShowSidebar}
					/>
					<Tooltip label="Save" openDelay={500}>
						<ActionIcon onClick={saveArtboardChanges} size={20}>
							<IconDeviceFloppy />
						</ActionIcon>
					</Tooltip>
					<Tooltip label="Reset zoom" openDelay={500}>
						<ActionIcon
							onClick={() => {
								resetZoom();
							}}
							title="Reset zoom"
							size={20}
						>
							<IconBoxModel2 />
						</ActionIcon>
					</Tooltip>
					<Button size="xs" leftIcon={<IconDownload size={14} />} variant="light" onClick={exportArtboard}>
						Export artboard
					</Button>
					<Button
						size="xs"
						leftIcon={<IconFileDownload size={14} />}
						variant="light"
						onClick={exportAllArtboards}
						loading={isDownloading}
						disabled={window.location.hostname.includes('vercel')}
					>
						Export all
					</Button>
				</Group>
			</Box>
			<Flex className={classes.shell}>
				{showSidebar ? (
					<Box className={classes.left}>
						<Stack spacing={0}>
							<Flex sx={{ padding: '0.5rem 1rem' }} align={'center'} justify={'space-between'}>
								<Flex align={'center'} justify={'space-between'} w={'100%'}>
									<Text weight={500} size={'sm'}>
										Artboards ({artboards.length})
									</Text>
									<Tooltip label="Create new artboard" openDelay={500}>
										<ActionIcon onClick={open} color="violet" size={16}>
											<IconPlus />
										</ActionIcon>
									</Tooltip>
								</Flex>
								<Box>
									{artboards.length >= 100 ? (
										<Button size="xs" variant="subtle" onClick={() => setShowAll(c => !c)}>
											{showAll ? 'Show less' : 'Show all'}
										</Button>
									) : null}
								</Box>
							</Flex>

							<Group sx={{ overflowY: 'auto', margin: 0, padding: 0, gap: 0 }}>
								{artboards.length > 0
									? (!showAll ? artboards.slice(0, 100) : artboards).map(artboard => (
											<Group
												key={artboard.id}
												className={classes.artboardButton}
												onClick={() => updateSelectedArtboard(artboard)}
											>
												<Text size={14}>{artboard.name}</Text>
												<Text size={12} color="gray">
													{artboard.width}x{artboard.height}
												</Text>
											</Group>
									  ))
									: null}
							</Group>
						</Stack>

						<Stack spacing={16}>
							<Text size={'sm'} weight={600} color="gray">
								Layers
							</Text>
							<Stack spacing={8}>
								{selectedArtboard?.state?.objects?.map((x: fabric.Object, index: number) => (
									<Text key={index}>{x.type}</Text>
								))}
							</Stack>
						</Stack>
					</Box>
				) : null}
				<Center className={classes.center} ref={canvasContainerRef}>
					<canvas id="canvas" />
				</Center>
				{showSidebar ? (
					<Box className={classes.right}>
						{canvasRef.current && currentSelectedElement && (
							<Panel
								artboardRef={artboardRef}
								canvas={canvasRef.current}
								currentSelectedElement={currentSelectedElement}
							/>
						)}
					</Box>
				) : null}
			</Flex>
			<Modal
				opened={opened}
				onClose={() => {
					newArtboardForm.reset();
					close();
				}}
				title="Create new artboard"
				classNames={{
					content: modalClasses.content,
					title: modalClasses.title,
				}}
			>
				<Stack spacing={'lg'}>
					<TextInput
						label="Artboard name"
						placeholder="Untitled artboard"
						required
						classNames={{ label: modalClasses.label }}
						{...newArtboardForm.getInputProps('name')}
					/>
					<Group grow>
						<NumberInput
							label="Width"
							placeholder="500"
							required
							classNames={{ label: modalClasses.label }}
							{...newArtboardForm.getInputProps('width')}
						/>
						<NumberInput
							label="Height"
							placeholder="500"
							required
							classNames={{ label: modalClasses.label }}
							{...newArtboardForm.getInputProps('height')}
						/>
					</Group>
					<NumberInput
						label="Number of artboards"
						placeholder="1"
						required
						classNames={{ label: modalClasses.label }}
						{...newArtboardForm.getInputProps('number')}
						min={1}
						max={1000}
					/>
					<Button
						variant="light"
						size="sm"
						fullWidth
						mt={'md'}
						loading={isCreatingArboards}
						onClick={() => {
							if (newArtboardForm.values.number > 1) {
								createMultipleArtboards(newArtboardForm.values, newArtboardForm.values.number);
								return;
							}

							addNewArtboard(newArtboardForm.values);
						}}
					>
						{newArtboardForm.values.number > 1
							? `Create ${newArtboardForm.values.number} artboards`
							: `Create artboard`}
					</Button>
				</Stack>
			</Modal>
		</Box>
	);
}

export default App;

const useStyles = createStyles(theme => ({
	root: {
		backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.colors.gray[2],
		width: '100vw',
		height: '100vh',
		overflow: 'hidden',
	},
	header: {
		backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.colors.gray[0],
		borderBottom: `1px solid ${theme.colors.gray[3]}`,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	logo: {
		fontSize: theme.fontSizes.md,
		fontWeight: 700,
		color: theme.colors.violet[7],
	},
	// Create a system where the left and the right panels are on top of the center
	shell: {
		height: 'calc(100vh - 4rem)',
		position: 'relative',
	},
	left: {
		backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.colors.gray[0],
		borderRight: `1px solid ${theme.colors.gray[3]}`,
		width: 300,
		display: 'grid',
		gridTemplateRows: '50% 50%',
		height: '100%',
		zIndex: 1,
		position: 'absolute',
		left: 0,
		overflowY: 'auto',
		paddingBlockEnd: '1rem',
	},
	right: {
		backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.colors.gray[0],
		borderLeft: `1px solid ${theme.colors.gray[3]}`,
		zIndex: 1,
		position: 'absolute',
		right: 0,
		width: 300,
		height: '100%',
		padding: '1rem',
	},
	center: {
		backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[2],
		borderLeft: `1px solid ${theme.colors.gray[3]}`,
		borderRight: `1px solid ${theme.colors.gray[3]}`,
		flexGrow: 1,
		flexShrink: 1,
		zIndex: 0,
	},
	artboardButton: {
		cursor: 'pointer',
		backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.colors.gray[0],
		padding: '0.5rem 1rem',
		transition: 'background-color 100ms ease',
		height: 40,
		width: '100%',
		'&:hover': {
			backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[2],
		},
	},
}));
