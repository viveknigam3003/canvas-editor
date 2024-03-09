import {
	ActionIcon,
	Box,
	Button,
	Flex,
	Group,
	Stack,
	Text,
	Tooltip,
	createStyles,
	useMantineTheme,
} from '@mantine/core';
import { getHotkeyHandler, useDisclosure, useHotkeys, useLocalStorage } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
	IconCircleCheck,
	IconCopy,
	IconDeviceFloppy,
	IconDownload,
	IconPlus,
	IconPuzzle,
	IconTrash,
} from '@tabler/icons-react';
import { fabric } from 'fabric';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Panel from './components/Panel';
import SectionTitle from './components/SectionTitle';
import { FABRIC_JSON_ALLOWED_KEYS } from './constants';
import { useQueryParam } from './hooks';
import {
	appStart,
	setActiveArtboard,
	setArtboards,
	setSelectedArtboards,
	updateActiveArtboardLayers,
	setZoomLevel,
} from './modules/app/actions';
import NewArtboardModal from './modules/artboard/NewArtboardModal';
import { getArtboardDimensions, getArtboardPosition } from './modules/artboard/helpers';
import { redo, undo } from './modules/history/actions';
import { addVideoToCanvas } from './modules/image/helpers';
import { getKeyboardShortcuts } from './modules/keyboard/helpers';
import LayerList from './modules/layers/List';
import AddMenu from './modules/menu/AddMenu';
import MiscMenu from './modules/menu/MiscMenu';
import { SmartObject } from './modules/reflection/helpers';
import {
	RULER_LINES,
	addNewRulerLine,
	adjustRulerBackgroundPosition,
	adjustRulerLinesPosition,
	deleteRulerLineForArtboard,
	deleteRulerLines,
	initializeRuler,
	removeRuler,
	removeRulerOnMoveMarker,
	renderRulerAxisBackground,
	renderRulerOnMoveMarker,
	renderRulerStepMarkers,
	updateRulerLineInStorage,
} from './modules/ruler';
import SettingsMenu from './modules/settings';

import { filterExportExcludes, filterSaveExcludes } from './modules/utils/fabricObjectUtils';
import ZoomMenu from './modules/zoom';
import store from './store';
import { RootState } from './store/rootReducer';
import { Artboard, FixedArray, colorSpaceType, guidesRefType } from './types';
import { generateId } from './utils';
// lazy load demo json
import workflows from './data/workflows.json';
import WorkflowComponent from './modules/workflows';
import { FabricGuide } from './modules/snapping/fabricGuide';

store.dispatch(appStart());

(window as any).switchVideo = () => {
	const isVideoEnabled = JSON.parse(localStorage.getItem('video') || 'false');
	localStorage.setItem('video', JSON.stringify(!isVideoEnabled));
	return 'Video is ' + (isVideoEnabled ? 'disabled' : 'enabled');
};

(window as any).hardReset = () => {
	localStorage.setItem('artboards', JSON.stringify([]));
	window.location.reload();
};

(window as any).loadDemo = async () => {
	const demoJson = await import('./data/demo.json');
	localStorage.setItem('artboards', JSON.stringify(demoJson.default));
	window.location.reload();
};

const useStyles = createStyles(theme => ({
	root: {
		backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.colors.gray[2],
		width: '100vw',
		height: '100vh',
	},
	header: {
		backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.colors.gray[0],
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	logo: {
		fontSize: theme.fontSizes.md,
		fontWeight: 700,
		color: theme.colorScheme === 'dark' ? theme.colors.violet[5] : theme.colors.violet[7],
	},
	shellFull: {
		height: 'calc(100vh - 4rem)',
		display: 'grid',
	},
	shell: {
		display: 'grid',
		gridTemplateColumns: '300px 1fr 300px',
		height: 'calc(100vh - 4rem)',
	},
	left: {
		backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.colors.gray[0],
		borderTop: `1px solid ${theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]}`,
		width: 300,
		display: 'grid',
		gridTemplateRows: '50% 50%',
		height: '100%',
		overflowY: 'auto',
		paddingBlockEnd: '1rem',
	},
	right: {
		backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.colors.gray[0],
		borderTop: `1px solid ${theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]}`,
		width: 300,
		height: '100%',
		padding: '1rem',
		overflowY: 'auto',
		paddingBottom: '2rem',
	},
	center: {
		height: '100%',
		width: '100%',
		backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[2],
		// borderLeft: `1px solid ${theme.colors.gray[3]}`,
		// borderRight: `1px solid ${theme.colors.gray[3]}`,
	},
	artboardButton: {
		cursor: 'pointer',
		backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.colors.gray[0],
		padding: '0.5rem 1rem',
		transition: 'background-color 100ms ease',
		height: 40,
		width: '100%',
		userSelect: 'none',
		'&:hover': {
			backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[2],
		},
	},
	artboardListContainer: {
		'&:focus': {
			outline: 'none',
		},
	},
	canvas: {
		paddingTop: '2px',
	},
}));

function App() {
	const dispatch = useDispatch();
	const artboards = useSelector((state: RootState) => state.app.artboards);
	const activeArtboard = useSelector((state: RootState) => state.app.activeArtboard);
	const selectedArtboards = useSelector((state: RootState) => state.app.selectedArtboards);
	const [snapDistance, setSnapDistance] = useLocalStorage<string>({
		key: 'snapDistance',
		defaultValue: '2',
	});
	const [showPlugins, setShowPlugins] = useLocalStorage<string>({
		key: 'showPlugins',
		defaultValue: 'false',
	});
	const [showRuler, setShowRuler] = useState(true);
	const theme = useMantineTheme();
	const colorSchemeRef = useRef(theme.colorScheme);
	const { classes } = useStyles();
	const [showSidebar, setShowSidebar] = useState(true);
	const [colorSpace] = useQueryParam('colorSpace', 'srgb');
	const [autosaveChanges, setAutoSaveChanges] = useState(true);
	//TODO: Ak maybe use saga here for scalability and take effect on undo/redo?
	const [currentSelectedElements, setCurrentSelectedElements] = useState<fabric.Object[] | null>(null);
	const [isNewArtboardModalOpen, { open: openNewArtboardModal, close: closeNewArtboardModal }] = useDisclosure();
	const canvasRef = useRef<fabric.Canvas | null>(null);
	const canvasContainerRef = useRef<HTMLDivElement | null>(null);
	const [showAll, setShowAll] = useState(false);
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
	const [isSpacePressed, setIsSpacePressed] = useState(false);
	const [isWorkflowsPanelActive, setWorkflowsPanelActive] = useState(false);
	const guidesRef = useRef<guidesRefType>({
		left: null,
		top: null,
		right: null,
		bottom: null,
		centerX: null,
		centerY: null,
	});
	const undoable = useSelector((state: RootState) => state.history.undoable);
	const redoable = useSelector((state: RootState) => state.history.redoable);
	const keyboardShortcuts = getKeyboardShortcuts();

	useEffect(() => {
		if (canvasRef.current && colorSchemeRef.current !== theme.colorScheme) {
			adjustRulerBackgroundPosition(canvasRef, theme.colorScheme);
			renderRulerStepMarkers(canvasRef, theme.colorScheme);
		}
		colorSchemeRef.current = theme.colorScheme;
	}, [theme.colorScheme]);

	useEffect(() => {
		canvasRef.current = new fabric.Canvas('canvas', {
			// create a canvas with clientWidth and clientHeight
			backgroundColor: '#e9ecef',
			colorSpace: colorSpace as colorSpaceType,
		});
		// inject guides to canvas
		new FabricGuide(canvasRef.current);

		// Handle element selection TODO: add more element type and handle it
		canvasRef.current?.on('selection:created', function (event) {
			setCurrentSelectedElements(event.selected as fabric.Object[]);
		});
		canvasRef.current?.on('selection:updated', function (event) {
			event?.deselected
				?.filter(item => Object.values(RULER_LINES).includes(item.data?.type))
				.forEach(item => {
					item.set({ stroke: '#D92D20', fill: '#D92D20' });
				});
			removeRulerOnMoveMarker(canvasRef);
			setCurrentSelectedElements(arr => {
				if (!arr) {
					return null;
				}

				if (event?.e?.shiftKey) {
					// Once the selection is updated, if there is an element in the array, return it
					if (event.selected && event.selected.length > 0) {
						// Add the element to the array if it is not already in the array
						return [...arr, ...event.selected];
					}

					if (event.deselected && event.deselected.length > 0) {
						// Remove the element from the array if it is already in the array
						return arr.filter(item => !event.deselected?.includes(item));
					}
				}
				return event.selected as fabric.Object[];
				// Else if the element is in the desected array, remove it
			});
		});
		canvasRef.current?.on('selection:cleared', function (e) {
			removeRulerOnMoveMarker(canvasRef);
			e?.deselected
				?.filter(item => Object.values(RULER_LINES).includes(item.data?.type))
				.forEach(item => {
					item.set({ stroke: '#F97066', fill: '#F97066' });
					item.setCoords();
				});
			setCurrentSelectedElements(null);
		});

		return () => {
			canvasRef.current?.dispose();
		};
	}, []);

	useEffect(() => {
		if (canvasRef.current) {
			canvasRef.current.on('mouse:down', options => {
				addNewRulerLine(options, canvasRef, activeArtboard?.id as string);
			});
		}
		return () => {
			canvasRef.current?.off('mouse:down');
		};
	}, [canvasRef.current, activeArtboard]);

	useEffect(() => {
		fitCanvasContainer();
		if (showRuler) {
			renderRuler();
		}
	}, [showSidebar]);
	const filterRulerLines = (objects?: fabric.Object[]) => {
		console.log('objects', objects);
		if (!objects) {
			return [];
		}
		return objects.filter(item => Object.values(RULER_LINES).includes(item.data?.type));
	};
	const onMoveHandler = (options: fabric.IEvent) => {
		const target = options.target as fabric.Object;
		if (Object.values(RULER_LINES).includes(target.data?.type)) {
			renderRulerOnMoveMarker(target, canvasRef);
			return;
		}
	};

	const onModifiedHandler = () => {
		updateRulerLineInStorage(
			activeArtboard?.id as string,
			filterRulerLines(canvasRef.current?.toJSON(FABRIC_JSON_ALLOWED_KEYS).objects),
		);
		Object.entries(guidesRef.current).forEach(([, value]) => {
			value?.set({ opacity: 0 });
		});
	};

	useEffect(() => {
		if (canvasRef.current) {
			canvasRef.current.on('object:moving', onMoveHandler);
			canvasRef.current.on('object:modified', onModifiedHandler);
		}
		return () => {
			canvasRef.current?.off('object:moving', onMoveHandler);
			canvasRef.current?.off('object:modified', onModifiedHandler);
		};
	}, [canvasRef.current, snapDistance]);

	useEffect(() => {
		dispatch(updateActiveArtboardLayers(activeArtboard?.state?.objects || []));
	}, [activeArtboard, dispatch]);

	const recreateCanvas = () => {
		//reload window
		saveArtboardChanges();
		window.location.reload();
	};

	const resetZoom = () => {
		canvasRef.current?.setZoom(1);
		// Place the canvas in the center of the screen
		centerBoardToCanvas();
		dispatch(setZoomLevel(canvasRef.current?.getZoom() || 1));
		if (showRuler) {
			renderRuler();
		}
	};

	const centerBoardToCanvas = () => {
		const canvas = canvasRef.current;

		if (!canvas) {
			throw new Error('Canvas is not defined');
		}

		const artboard = canvas.getObjects().find(item => item.data?.type === 'artboard');

		if (!artboard) {
			throw new Error('Artboard is not defined');
		}

		// const object = canvas.getActiveObject();
		const objWidth = artboard.getScaledWidth();
		const objHeight = artboard.getScaledHeight();
		const zoom = canvas.getZoom();
		let panX = 0;
		let panY = 0;

		// WORKS - setViewportTransform
		if (artboard.aCoords) {
			panX = (canvas.getWidth() / zoom / 2 - artboard.aCoords.tl.x - objWidth / 2) * zoom;
			panY = (canvas.getHeight() / zoom / 2 - artboard.aCoords.tl.y - objHeight / 2) * zoom;
			canvas.setViewportTransform([zoom, 0, 0, zoom, panX, panY]);
		}
	};

	/**
	 * Update the selected artboards array and the active artboard
	 * @param e Mouse Event
	 * @param artboard Artboard object
	 */
	const updateSelectedArtboard = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, artboard: Artboard) => {
		e.stopPropagation();
		e.preventDefault();

		const currentArtboardIndex = artboards.findIndex(ab => ab.id === artboard.id);
		const isActiveArtboard = activeArtboard?.id === artboard.id;
		const isSelectedArtboard = selectedArtboards.includes(artboard.id);

		if (e.shiftKey) {
			if (isSelectedArtboard && !isActiveArtboard) {
				const arr = selectedArtboards.filter(item => item !== artboard.id);
				dispatch(setSelectedArtboards(arr));
			} else if (!isSelectedArtboard && !isActiveArtboard) {
				const lastActiveIndex = artboards.findIndex(ab => ab.id === activeArtboard?.id);
				// Determine the range of indexes to select
				const startIndex = Math.min(currentArtboardIndex, lastActiveIndex);
				const endIndex = Math.max(currentArtboardIndex, lastActiveIndex);
				// Select all artboards between the last active and the clicked one
				const newSelectedArtboards = artboards.slice(startIndex, endIndex + 1).map(ab => ab.id);
				dispatch(setSelectedArtboards(newSelectedArtboards));
			}
		} else if (e.metaKey || e.ctrlKey) {
			if (isSelectedArtboard && !isActiveArtboard) {
				const arr = selectedArtboards.filter(item => item !== artboard.id);
				dispatch(setSelectedArtboards(arr));
			} else if (!isSelectedArtboard && !isActiveArtboard) {
				const arr = [...selectedArtboards, artboard.id];
				dispatch(setSelectedArtboards(arr));
			}
		} else {
			if (isSelectedArtboard && !isActiveArtboard) {
				dispatch(setActiveArtboard(artboard));
			} else {
				dispatch(setActiveArtboard(artboard));
				dispatch(setSelectedArtboards([artboard.id]));
			}
		}
	};

	const exportArtboard = () => {
		const activeArtboardId = activeArtboard?.id;
		if (!activeArtboardId) {
			return;
		}
		const artboardPosition = getArtboardPosition(canvasRef.current, activeArtboardId);
		const artboardLeftAdjustment = artboardPosition.left;
		const artboardTopAdjustment = artboardPosition.top;
		const artboardDimensions = getArtboardDimensions(canvasRef.current, activeArtboardId);
		// Now we need to create a new canvas and add the artboard to it
		const offscreenCanvas = new fabric.Canvas('print', {
			width: artboardDimensions.width,
			height: artboardDimensions.height,
			colorSpace: colorSpace as colorSpaceType,
		});
		const stateJSON = canvasRef.current?.toJSON(FABRIC_JSON_ALLOWED_KEYS);
		const adjustedStateJSONObjects = stateJSON?.objects?.map((item: any) => {
			return {
				...item,
				left: item.left - artboardLeftAdjustment,
				top: item.top - artboardTopAdjustment,
			};
		});
		const adjustedStateJSON = {
			...stateJSON,
			objects: filterExportExcludes(adjustedStateJSONObjects),
		};
		offscreenCanvas.loadFromJSON(adjustedStateJSON, () => {
			offscreenCanvas.renderAll();
			const config = {
				format: 'png',
			};
			// render the offscreen canvas to a dataURL
			const dataURL = offscreenCanvas.toDataURL(config);
			const link = document.createElement('a');
			if (dataURL) {
				link.href = dataURL;
				link.download = `${activeArtboard.name}.png`;
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
			}
		});
	};

	// Take selected options in the selected artboard and when this function is called, group the selected elements
	const createGroup = () => {
		const canvas = canvasRef.current;
		if (!canvas) {
			return;
		}

		const activeObject = canvas.getActiveObject();
		if (!activeObject || activeObject.type !== 'activeSelection') {
			return;
		}

		// Cast activeObject to fabric.ActiveSelection
		const activeSelection = activeObject as fabric.ActiveSelection;

		const activeObjects = activeSelection.getObjects();
		const group = new fabric.Group(activeObjects, {
			left: activeSelection.left,
			top: activeSelection.top,
			data: { id: generateId(), type: 'group' },
		});

		activeObjects.forEach(object => {
			canvas.remove(object);
		});

		canvas.add(group);
		dispatch(updateActiveArtboardLayers(canvas.getObjects()));
		canvas.renderAll();
	};

	// ungroup function
	const ungroup = () => {
		const canvas = canvasRef.current;
		if (!canvas) {
			return;
		}

		const activeObject = canvas.getActiveObject();
		if (!activeObject || activeObject.type !== 'group') {
			return;
		}

		// Cast activeObject to fabric.Group
		const group = activeObject as fabric.Group;

		// Ungroup the objects
		const items = group._objects;
		group._restoreObjectsState();
		canvas.remove(group);
		for (let i = 0; i < items.length; i++) {
			canvas.add(items[i]);
		}
		dispatch(updateActiveArtboardLayers(canvas.getObjects()));
		canvas.renderAll();
	};

	const saveArtboardChanges = () => {
		if (!activeArtboard) {
			return;
		}

		const json = canvasRef.current?.toJSON(FABRIC_JSON_ALLOWED_KEYS);
		const updatedArtboards = artboards.map(item => {
			if (item.id === activeArtboard.id) {
				return {
					...item,
					state: {
						...json,
						objects: filterSaveExcludes(json?.objects),
					},
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

	const zoomFromCenter = (zoom: number) => {
		const canvas = canvasRef.current;
		if (!canvas) {
			return;
		}

		const { minZoom, maxZoom } = getMaxMinZoomLevel({
			width: activeArtboard?.width || 1,
			height: activeArtboard?.height || 1,
		});

		if (zoom > maxZoom) zoom = maxZoom;
		if (zoom < minZoom) zoom = minZoom;
		if (!zoom || isNaN(zoom)) {
			zoom = minZoom;
		}

		const center = canvas.getCenter();
		canvas.zoomToPoint(
			{
				x: center.left,
				y: center.top,
			},
			zoom,
		);
	};

	const renderRuler = () => {
		renderRulerAxisBackground(canvasRef, colorSchemeRef.current);
		adjustRulerBackgroundPosition(canvasRef, colorSchemeRef.current);
		renderRulerStepMarkers(canvasRef, colorSchemeRef.current);
		adjustRulerLinesPosition(canvasRef);
	};

	const zoomToFit = () => {
		const canvas = canvasRef.current;

		if (!canvas) {
			throw new Error('Canvas is not defined');
		}

		const artboard = canvas.getObjects().find(item => item.data?.type === 'artboard');

		if (!artboard) {
			throw new Error('Artboard is not defined');
		}

		// Canvas width and height depending on if the sidebar is open or not
		const canvasWidth = showSidebar ? window.innerWidth - 600 : window.innerWidth;
		const canvasHeight = canvas.getHeight();

		// Artboard width and height
		const artboardWidth = artboard.width;
		const artboardHeight = artboard.height;

		if (!artboardWidth || !artboardHeight) {
			throw new Error('Artboard width or height is not defined');
		}

		// Calculate the zoom level based on the canvas width and height with 20% padding
		const zoom = Math.min((canvasWidth * 0.8) / artboardWidth, (canvasHeight * 0.8) / artboardHeight);

		// const zoom = Math.min(canvasWidth / artboardWidth, canvasHeight / artboardHeight);

		// Zoom to the center of the canvas
		zoomFromCenter(zoom);
		centerBoardToCanvas();

		dispatch(setZoomLevel(canvasRef.current?.getZoom() || zoom));
		if (showRuler) {
			renderRuler();
		}
	};

	const zoomIn = () => {
		const zoom = canvasRef.current?.getZoom();
		if (zoom) {
			zoomFromCenter(zoom + 0.1);
			dispatch(setZoomLevel(canvasRef.current?.getZoom() || zoom + 0.1));
		}
		if (showRuler) {
			renderRuler();
		}
	};

	const zoomOut = () => {
		const zoom = canvasRef.current?.getZoom();
		if (zoom) {
			zoomFromCenter(zoom - 0.1);
			dispatch(setZoomLevel(canvasRef.current?.getZoom() || zoom - 0.1));
		}
		if (showRuler) {
			renderRuler();
		}
	};

	const deleteElement = () => {
		const canvas = canvasRef.current;
		if (!canvas) {
			return;
		}

		const activeObjects = canvas.getActiveObjects();
		if (!activeObjects.length) {
			return;
		}

		activeObjects.forEach(object => {
			canvas.remove(object);
		});
		deleteRulerLines(
			canvasRef,
			activeArtboard?.id as string,
			activeObjects.map(item => item.data?.id),
		);
		canvas.renderAll();
		dispatch(updateActiveArtboardLayers(canvas.getObjects()));
		saveArtboardChanges();
	};

	const duplicateElement = () => {
		const canvas = canvasRef.current;
		if (!canvas) {
			return;
		}

		const activeObjects = canvas.getActiveObjects();
		if (activeObjects.length > 1) {
			return;
		}

		activeObjects[0].clone((cloned: fabric.Object) => {
			const id = generateId();
			cloned.set({
				left: cloned.left! + 20,
				data: {
					...cloned.data,
					id,
				},
			});
			canvas.add(cloned);
			canvas.renderAll();
			dispatch(updateActiveArtboardLayers(canvas.getObjects()));
			saveArtboardChanges();
		}, FABRIC_JSON_ALLOWED_KEYS);
	};

	const getNextArtboardName = (artboards: Artboard[]) => {
		// Get the last artboard name
		const lastArtboardName = artboards[artboards.length - 1].name;

		// If there is no number at the end, return the name with 1 appended
		if (!/\d+$/.test(lastArtboardName)) {
			return `${lastArtboardName} 1`;
		}

		// Get the number at the end of the artboard name
		const lastArtboardNumber = parseInt(lastArtboardName.match(/\d+$/)![0]);

		// Return the name with the next number appended
		return `${lastArtboardName.replace(/\d+$/, '')}${lastArtboardNumber + 1}`;
	};

	const duplicateArtboard = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, artboardId: string) => {
		e.stopPropagation();
		const artboard = artboards.find(item => item.id === artboardId);
		if (!artboard) {
			return;
		}
		const id = generateId();
		const newState = JSON.parse(JSON.stringify(artboard.state));
		newState.objects = newState.objects.map((item: any) => {
			if (item.data?.type === 'artboard') {
				console.log('item', item);
				return {
					...item,
					data: {
						...item.data,
						id,
					},
				};
			}
			return item;
		});
		const newArtboard: Artboard = {
			...artboard,
			name: getNextArtboardName(artboards),
			id,
			state: newState,
		};

		const updatedArtboards = [...artboards, newArtboard];
		dispatch(setArtboards(updatedArtboards));
		if (selectedArtboards.length === 1) {
			dispatch(setActiveArtboard(newArtboard));
			setSelectedArtboards([newArtboard.id]);
		}
	};

	const deleteArtboard = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, artboardId: string) => {
		e.stopPropagation();
		const artboardIndex = artboards.findIndex(item => item.id === artboardId);
		const updatedArtboards = artboards.filter(item => item.id !== artboardId);
		dispatch(setArtboards(updatedArtboards));
		if (artboardIndex === 0) {
			dispatch(setActiveArtboard(updatedArtboards[0]));
		} else {
			dispatch(setActiveArtboard(updatedArtboards[artboardIndex - 1]));
		}
		deleteRulerLineForArtboard(artboardId);
		// Clear canvas if updatedArtboards is empty
		if (updatedArtboards.length === 0) {
			canvasRef.current?.clear();
		}
	};

	// Handle the undo and redo actions to update artboards
	useEffect(() => {
		if (!activeArtboard) {
			return;
		}

		const canvas = canvasRef.current;

		if (!canvas) {
			return;
		}

		const json = activeArtboard.state;

		if (!json) {
			return;
		}

		canvasRef.current?.loadFromJSON(json, async () => {
			zoomToFit();

			// Attach the reference for reflection object back to the parent object
			(canvas.getObjects() as SmartObject[]).forEach((obj: SmartObject) => {
				const reflection = canvasRef.current
					?.getObjects()
					.find(item => item.data?.type === 'reflection' && item.data.parent === obj.data?.id);
				const reflectionOverlay = canvasRef.current?.getObjects().find(item => {
					return item.data?.type === 'reflectionOverlay' && item.data.parent === obj.data?.id;
				});
				if (reflection) {
					obj.effects.reflection = reflection;
				}
				if (reflectionOverlay) {
					obj.effects.reflectionOverlay = reflectionOverlay;
				}
			});

			initializeRuler(canvasRef, colorSchemeRef.current, activeArtboard.id as string);
			if (showRuler) {
				renderRuler();
			}
			// Get the src of the video element and add it to the canvas
			const videoElements = canvasRef.current?.getObjects().filter(item => item.data?.type === 'video');
			if (videoElements?.length) {
				for (let i = 0; i < videoElements.length; i++) {
					await addVideoToCanvas(videoElements[i].data.src, canvasRef.current!);
				}
			}
			canvas.requestRenderAll();
		});
	}, [activeArtboard]);

	useEffect(() => {
		if (showRuler && activeArtboard?.id) {
			initializeRuler(canvasRef, colorSchemeRef.current, activeArtboard?.id as string);
		} else {
			removeRuler(canvasRef);
		}
	}, [showRuler, activeArtboard?.id]);

	// Handle spacebar press and release
	useEffect(() => {
		const handleSpacebarPress = (e: KeyboardEvent) => {
			if (e.key === ' ') {
				setIsSpacePressed(true);
			}
		};

		const handleSpacebarRelease = (e: KeyboardEvent) => {
			if (e.key === ' ') {
				setIsSpacePressed(false);
			}
		};

		window.addEventListener('keydown', handleSpacebarPress);
		window.addEventListener('keyup', handleSpacebarRelease);

		return () => {
			window.removeEventListener('keydown', handleSpacebarPress);

			window.removeEventListener('keyup', handleSpacebarRelease);
		};
	}, []);

	// Handle dragging of canvas with mouse down and spacebar pressed
	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) {
			return;
		}

		const whileSpacePressed = () => {
			if (isSpacePressed) {
				canvas.setCursor('grab');
				canvas.selection = false;
			}
		};

		let lastPosX: number | null = null;
		let lastPosY: number | null = null;

		const handleMouseDown = (opt: any) => {
			if (isSpacePressed) {
				const e = opt.e;
				lastPosX = e.clientX;
				lastPosY = e.clientY;
				canvas.setCursor('grab');
			}
		};

		const handleMouseMove = (opt: any) => {
			whileSpacePressed();
			if (isSpacePressed && lastPosX !== null && lastPosY !== null) {
				canvas.setCursor('grabbing');
				const e = opt.e;
				const deltaX = e.clientX - lastPosX;
				const deltaY = e.clientY - lastPosY;
				const pan = canvas.viewportTransform as FixedArray<number, 6>;
				if (pan) {
					pan[4] += deltaX;
					pan[5] += deltaY;
					canvas.requestRenderAll();
				}
				lastPosX = e.clientX;
				lastPosY = e.clientY;
				if (showRuler) {
					renderRuler();
				}
			}
		};

		const handleMouseUp = () => {
			lastPosX = null;
			lastPosY = null;
			canvas.setCursor(isSpacePressed ? 'grab' : 'default');
		};

		canvas.on('mouse:down', handleMouseDown);
		canvas.on('mouse:move', handleMouseMove);
		canvas.on('mouse:up', handleMouseUp);
		canvas.setCursor(isSpacePressed ? 'grab' : 'default');

		return () => {
			canvas.off('mouse:down', handleMouseDown);
			canvas.off('mouse:move', handleMouseMove);
			canvas.off('mouse:up', handleMouseUp);
		};
	}, [isSpacePressed, showRuler]);

	// Handle dragging of canvas with mouse down and alt key pressed
	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) {
			return;
		}

		const handleZoomAndPan = (opt: any) => {
			// Handle panning based on deltaX and deltaY but prevent zooming
			const e = opt.e;
			e.preventDefault();

			if (e.ctrlKey || e.metaKey) {
				const delta = opt.e.deltaY;
				let zoom = canvas.getZoom() as number;
				zoom *= 0.99 ** delta;
				const { minZoom, maxZoom } = getMaxMinZoomLevel({
					width: activeArtboard?.width || 1,
					height: activeArtboard?.height || 1,
				});
				if (zoom > maxZoom) zoom = maxZoom;
				if (zoom < minZoom) zoom = minZoom;
				if (!zoom || isNaN(zoom)) {
					zoom = minZoom;
				}
				canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
				dispatch(setZoomLevel(zoom));
				if (showRuler) {
					renderRuler();
				}
				canvas.requestRenderAll();
			} else {
				const pan = canvas.viewportTransform as FixedArray<number, 6> | undefined;
				if (!pan) {
					return;
				}
				pan[4] -= e.deltaX;
				pan[5] -= e.deltaY;
				canvas.setViewportTransform(pan);
				if (showRuler) {
					renderRuler();
				}
				canvas.requestRenderAll();
			}
		};

		canvas.on('mouse:wheel', handleZoomAndPan);

		return () => {
			canvas.off('mouse:wheel', handleZoomAndPan);
		};
	}, [activeArtboard?.height, activeArtboard?.width, showRuler]);

	function fitCanvasContainer() {
		const containerSize = {
			width: window.innerWidth - (showSidebar ? 600 : 0),
			height: canvasContainerRef.current?.offsetHeight,
		};
		canvasRef.current?.setHeight(containerSize.height as number);
		canvasRef.current?.setWidth(containerSize.width as number);
	}
	// Update canvas size when viewport size changes
	useEffect(() => {
		const handleResize = () => {
			fitCanvasContainer();
			if (showRuler) {
				renderRuler();
			}
		};

		window.addEventListener('resize', handleResize);

		return () => {
			window.removeEventListener('resize', handleResize);
		};
	}, [showRuler]);

	useEffect(() => {
		if (!autosaveChanges) {
			return;
		}

		const canvas = canvasRef.current;

		if (!canvas) {
			return;
		}

		// set hasUnsavedChanges to true with 2000ms debounce
		let timeout: NodeJS.Timeout;

		const handleCanvasObjectModification = () => {
			if (selectedArtboards.length > 1) {
				console.log('Multiple artboards selected, will apply bulk changes');
				return;
			}

			console.log('Object modified');
			timeout = setTimeout(() => {
				setHasUnsavedChanges(true);
			}, 2000);
		};

		canvas.on('object:modified', handleCanvasObjectModification);

		return () => {
			canvas.off('object:modified', handleCanvasObjectModification);
			clearTimeout(timeout);
		};
	}, [autosaveChanges, selectedArtboards]);

	useEffect(() => {
		if (!hasUnsavedChanges) {
			return;
		}

		saveArtboardChanges();
		setHasUnsavedChanges(false);
	}, [hasUnsavedChanges]);

	useHotkeys([
		[
			keyboardShortcuts.Redo,
			() => {
				if (redoable) {
					canvasRef.current?.discardActiveObject();
					dispatch(redo());
				}
			},
		],
		[
			keyboardShortcuts.Undo,
			() => {
				if (undoable) {
					canvasRef.current?.discardActiveObject();
					dispatch(undo());
				}
			},
		],
		[
			keyboardShortcuts['Save changes'],
			e => {
				e.preventDefault();
				saveArtboardChanges();
				notifications.show({
					title: 'Changes saved',
					message: 'Phoenix Editor automatically saves your changes',
					icon: <IconCircleCheck size={20} />,
					color: 'green',
					autoClose: 1500,
				});
			},
		],
		[
			keyboardShortcuts['Zoom in'],
			(event: KeyboardEvent) => {
				event.preventDefault();
				zoomIn();
			},
		],
		[
			keyboardShortcuts['Zoom out'],
			(event: KeyboardEvent) => {
				event.preventDefault();
				zoomOut();
			},
		],
		[
			keyboardShortcuts['Reset zoom'],
			(event: KeyboardEvent) => {
				event.preventDefault();
				resetZoom();
			},
		],
		[
			keyboardShortcuts['Zoom to fit'],
			(event: KeyboardEvent) => {
				event.preventDefault();
				zoomToFit();
			},
		],
		[
			keyboardShortcuts['Group elements'],
			(event: KeyboardEvent) => {
				event.preventDefault();
				createGroup();
			},
		],
		[
			keyboardShortcuts['Ungroup elements'],
			(event: KeyboardEvent) => {
				event.preventDefault();
				ungroup();
			},
		],
		[
			keyboardShortcuts['Delete element'],
			(event: KeyboardEvent) => {
				event.preventDefault();
				deleteElement();
			},
		],
		[
			keyboardShortcuts['Duplicate element'],
			(event: KeyboardEvent) => {
				event.preventDefault();
				duplicateElement();
			},
		],
		[
			'mod+1',
			async (event: KeyboardEvent) => {
				const mcd = await import('./data/mcd.json');
				event.preventDefault();
				dispatch(setArtboards(mcd.default));
			},
		],
		[
			'mod+2',
			(event: KeyboardEvent) => {
				event.preventDefault();
				localStorage.setItem('workflows', JSON.stringify(workflows));
			},
		],
		[
			'mod+3',
			(event: KeyboardEvent) => {
				event.preventDefault();
				setShowPlugins(c => (c === 'true' ? 'false' : 'true'));
			},
		],
	]);

	const getBackgroundColor = (artboard: Artboard) => {
		const isArtboardActive = activeArtboard?.id === artboard.id;
		const isArtboardSelected = selectedArtboards.includes(artboard.id);
		const activeElement = currentSelectedElements?.[0];

		const isElementInCurrentArtboard = artboard.state?.objects
			.map((item: any) => item.data?.id)
			.includes(activeElement?.data?.id);

		if (isArtboardActive) {
			if (isArtboardSelected) {
				if (selectedArtboards.length === 1) {
					return theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.violet[1];
				}
				return theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.violet[2];
			}

			return theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.violet[1];
		}

		if (isArtboardSelected) {
			if (activeElement && !isElementInCurrentArtboard) {
				return theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[2];
			}

			return theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.violet[1];
		}

		return 'transparent';
	};

	return (
		<Box className={classes.root}>
			<Box className={classes.header} px={16}>
				<Flex gap={16} justify={'center'} align={'center'}>
					<Flex justify={'center'} align={'center'} mih={64}>
						{/* <img src="/logo.png" alt="logo" width={64} height={64} /> */}
						<Text className={classes.logo}>Phoenix Editor</Text>
					</Flex>
					<AddMenu
						activeArtboard={activeArtboard}
						canvasRef={canvasRef}
						saveArtboardChanges={saveArtboardChanges}
					/>
					<MiscMenu artboards={artboards} canvasRef={canvasRef} />
				</Flex>
				<Group>
					<Tooltip label="Workflows" openDelay={200}>
						<ActionIcon
							variant={isWorkflowsPanelActive ? 'filled' : 'light'}
							color={'violet'}
							onClick={() => {
								setWorkflowsPanelActive(c => !c);
							}}
						>
							<IconPuzzle size={16} />
						</ActionIcon>
					</Tooltip>
					<SettingsMenu
						recreateCanvas={recreateCanvas}
						canvasRef={canvasRef}
						setShowSidebar={setShowSidebar}
						autosaveChanges={autosaveChanges}
						setAutoSaveChanges={setAutoSaveChanges}
						snapDistance={snapDistance}
						setSnapDistance={setSnapDistance}
						setShowRuler={setShowRuler}
					/>
					<Tooltip label="Save" openDelay={500}>
						<ActionIcon onClick={saveArtboardChanges} size={20}>
							<IconDeviceFloppy />
						</ActionIcon>
					</Tooltip>
					<ZoomMenu zoomIn={zoomIn} zoomOut={zoomOut} zoomReset={resetZoom} zoomToFit={zoomToFit} />
					<Button size="xs" leftIcon={<IconDownload size={14} />} variant="light" onClick={exportArtboard}>
						Export
					</Button>
				</Group>
			</Box>
			<Box className={showSidebar ? classes.shell : classes.shellFull}>
				{showSidebar ? (
					<Box className={classes.left}>
						<Stack
							spacing={0}
							tabIndex={1}
							onKeyDown={getHotkeyHandler([
								['escape', () => dispatch(setSelectedArtboards([activeArtboard?.id || '']))],
							])}
							className={classes.artboardListContainer}
						>
							<Flex sx={{ padding: '0.5rem 1rem' }} align={'center'} justify={'space-between'}>
								<Flex align={'center'} justify={'space-between'} w={'100%'}>
									<SectionTitle>Variants ({artboards.length})</SectionTitle>
									<Tooltip label="Create new artboard" openDelay={500}>
										<ActionIcon onClick={openNewArtboardModal} color="violet" size={16}>
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
												onClick={e => updateSelectedArtboard(e, artboard)}
												style={{
													backgroundColor: getBackgroundColor(artboard),
												}}
												align="center"
											>
												<Group w={'70%'}>
													<Text size={14}>{artboard.name}</Text>
													<Text
														size={12}
														color={
															theme.colorScheme === 'dark'
																? theme.colors.gray[5]
																: theme.colors.gray[6]
														}
													>
														{artboard.width}x{artboard.height}
													</Text>
												</Group>

												<Group
													spacing={'sm'}
													display={activeArtboard?.id === artboard.id ? 'flex' : 'none'}
												>
													<ActionIcon
														onClick={e => duplicateArtboard(e, artboard.id)}
														size={'sm'}
													>
														<IconCopy size={14} />
													</ActionIcon>
													<ActionIcon
														onClick={e => deleteArtboard(e, artboard.id)}
														size={'sm'}
													>
														<IconTrash size={14} />
													</ActionIcon>
												</Group>
											</Group>
										))
									: null}
							</Group>
						</Stack>

						<Stack spacing={16}>
							<Stack spacing={8}>
								<LayerList canvas={canvasRef.current} />
							</Stack>
						</Stack>
					</Box>
				) : null}
				<Box className={classes.center} ref={canvasContainerRef}>
					<canvas className={classes.canvas} id="canvas" />
				</Box>
				{showSidebar ? (
					<Box className={classes.right}>
						{isWorkflowsPanelActive ? (
							<WorkflowComponent
								showPlugins={showPlugins}
								canvas={canvasRef.current}
								currentSelectedElements={currentSelectedElements}
							/>
						) : (
							<>
								{canvasRef.current && currentSelectedElements && (
									<Panel
										canvas={canvasRef.current}
										currentSelectedElements={currentSelectedElements}
										saveArtboardChanges={saveArtboardChanges}
										activeArtboard={activeArtboard}
									/>
								)}
							</>
						)}
					</Box>
				) : null}
			</Box>
			<NewArtboardModal
				opened={isNewArtboardModalOpen}
				onClose={() => {
					zoomToFit();
					closeNewArtboardModal();
				}}
				canvas={canvasRef.current}
			/>
		</Box>
	);
}

export default App;
