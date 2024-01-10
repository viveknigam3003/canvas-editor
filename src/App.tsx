import {
	ActionIcon,
	Box,
	Button,
	Center,
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
import { IconCircleCheck, IconCopy, IconDeviceFloppy, IconDownload, IconPlus, IconTrash } from '@tabler/icons-react';
import { fabric } from 'fabric';
import FontFaceObserver from 'fontfaceobserver';
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
} from './modules/app/actions';
import NewArtboardModal from './modules/artboard/NewArtboardModal';
import { redo, undo } from './modules/history/actions';
import { addVideoToCanvas } from './modules/image/helpers';
import LayerList from './modules/layers/List';
import AddMenu from './modules/menu/AddMenu';
import MiscMenu from './modules/menu/MiscMenu';
import { SmartObject } from './modules/reflection/helpers';
import {
	RULER_LINES,
	addNewRulerLine,
	adjustRulerBackgroundPosition,
	adjustRulerLinesPosition,
	initializeRuler,
	removeRuler,
	removeRulerOnMoveMarker,
	renderRulerAxisBackground,
	renderRulerOnMoveMarker,
	deleteRulerLines,
	updateRulerLineInStorage,
	renderRulerStepMarkers,
	deleteRulerLineForArtboard,
} from './modules/ruler';
import SettingsMenu from './modules/settings';
import { createSnappingLines, snapToObject } from './modules/snapping';
import { filterExportExcludes, filterSaveExcludes, filterSnappingExcludes } from './modules/utils/fabricObjectUtils';
import ZoomMenu from './modules/zoom';
import store from './store';
import { RootState } from './store/rootReducer';
import { Artboard, FixedArray, colorSpaceType, guidesRefType, snappingObjectType } from './types';
import { generateId, getMultiplierFor4K } from './utils';
import { getArtboardDimensions, getArtboardPosition } from './modules/artboard/helpers';

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
		overflowY: 'auto',
		paddingBottom: '2rem',
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
	const [zoomLevel, setZoomLevel] = useState(1);
	const [canvasScrollPoints, setCanvasScrollPoints] = useState(0);
	const canvasRef = useRef<fabric.Canvas | null>(null);
	const canvasContainerRef = useRef<HTMLDivElement | null>(null);
	const [showAll, setShowAll] = useState(false);
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
	const [isSpacePressed, setIsSpacePressed] = useState(false);
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
			width: window.innerWidth - 600,
			height: window.innerHeight - 60,
			backgroundColor: '#e9ecef',
			colorSpace: colorSpace as colorSpaceType,
		});
		// Handle element selection TODO: add more element type and handle it
		canvasRef.current?.on('selection:created', function (event) {
			const activeObjects = canvasRef?.current?.getActiveObjects() || [];
			const filteredObjects = activeObjects.filter(item => !Object.values(RULER_LINES).includes(item.data?.type));
			if (filteredObjects?.length > 1) {
				//TODO: comeback and fix this
			} else if (filteredObjects?.length === 1) {
				canvasRef.current?.setActiveObject(activeObjects?.[0]);
			}
			setCurrentSelectedElements(event.selected as fabric.Object[]);
		});
		canvasRef.current?.on('selection:updated', function (event) {
			event?.deselected
				?.filter(item => Object.values(RULER_LINES).includes(item.data?.type))
				.forEach(item => {
					item.set({ stroke: '#000', fill: '#000' });
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
					item.set({ stroke: '#000', fill: '#000' });
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
		snapToObject(
			target as snappingObjectType,
			filterSnappingExcludes(canvasRef.current?.getObjects()) as snappingObjectType[],
			guidesRef,
			canvasRef,
			Number(snapDistance),
		);
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
		setZoomLevel(canvasRef.current?.getZoom() || 1);
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

		if (!artboardLeftAdjustment || !artboardTopAdjustment) {
			return;
		}
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
			const multiplier = getMultiplierFor4K(artboardDimensions.width, artboardDimensions.height);
			const config = {
				format: 'png',
				multiplier,
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
		});

		activeObjects.forEach(object => {
			canvas.remove(object);
		});

		canvas.add(group);
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

		setZoomLevel(canvasRef.current?.getZoom() || zoom);
		if (showRuler) {
			renderRuler();
		}
	};

	const zoomIn = () => {
		const zoom = canvasRef.current?.getZoom();
		if (zoom) {
			zoomFromCenter(zoom + 0.1);
			setZoomLevel(canvasRef.current?.getZoom() || zoom + 0.1);
		}
		if (showRuler) {
			renderRuler();
		}
	};

	const zoomOut = () => {
		const zoom = canvasRef.current?.getZoom();
		if (zoom) {
			zoomFromCenter(zoom - 0.1);
			setZoomLevel(canvasRef.current?.getZoom() || zoom - 0.1);
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
			canvas.add(cloned);
			canvas.renderAll();
			dispatch(updateActiveArtboardLayers(canvas.getObjects()));
			saveArtboardChanges();
		});
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
			console.log('Loaded from JSON');
			zoomToFit();

			// create a style sheet
			const artboardTexts = canvas.getObjects().filter(item => item.type === 'textbox');
			// take all texts and then loop over. Read data property inside and get font from it
			const fontPromises = artboardTexts?.map((item: any) => {
				const textItem = item as fabric.Text;

				if (
					textItem.data &&
					typeof textItem.data.boldFont === 'string' &&
					typeof textItem.fontFamily === 'string'
				) {
					const boldFont = textItem.data.boldFont;
					console.log('boldFont', boldFont, textItem.fontFamily);
					const style = document.createElement('style');

					style.appendChild(document.createTextNode(boldFont));
					document.head.appendChild(style);

					const observer = new FontFaceObserver(textItem.fontFamily || '');

					// load the font
					return observer.load().catch(err => {
						console.log('Bold Font is not available', err);
					});
				}
				if (
					textItem.data &&
					typeof textItem.data.font === 'string' &&
					typeof textItem.fontFamily === 'string'
				) {
					const font = textItem.data.font;
					console.debug('font', font, textItem.fontFamily);
					const style = document.createElement('style');

					style.appendChild(document.createTextNode(font));
					document.head.appendChild(style);

					const observer = new FontFaceObserver(textItem.fontFamily || '');

					// load the font
					return observer.load().catch(err => {
						console.log('Font is not available', err);
					});
				}
			});

			// Wait for all the fonts to load
			if (fontPromises) {
				await Promise.all(fontPromises);
			}

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

			guidesRef.current = createSnappingLines(canvasRef);
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
		if (showRuler) {
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
				setZoomLevel(zoom);
				if (showRuler) {
					renderRuler();
				}
				const pan = canvas.viewportTransform as FixedArray<number, 6>;
				setCanvasScrollPoints(pan[4] + pan[5]);
				canvas.requestRenderAll();
			} else {
				const pan = canvas.viewportTransform as FixedArray<number, 6> | undefined;
				if (!pan) {
					return;
				}
				pan[4] -= e.deltaX;
				pan[5] -= e.deltaY;
				if (showRuler) {
					renderRuler();
				}
				setCanvasScrollPoints(pan[4] + pan[5]);
				canvas.requestRenderAll();
			}
		};

		canvas.on('mouse:wheel', handleZoomAndPan);

		return () => {
			canvas.off('mouse:wheel', handleZoomAndPan);
		};
	}, [activeArtboard?.height, activeArtboard?.width, showRuler]);

	// Update canvas size when viewport size changes
	useEffect(() => {
		const handleResize = () => {
			canvasRef.current?.setDimensions({
				width: window.innerWidth,
				height: window.innerHeight - 60,
			});
			if (showRuler) {
				renderRuler();
			}
		};

		window.addEventListener('resize', handleResize);

		return () => {
			window.removeEventListener('resize', handleResize);
		};
	}, [showRuler]);

	// this is hack to reset snapping lines when zoom level changes or scroll changes,ideal solution will be move this to handlePan function and change the snapping lines based on the scroll and zoom level
	useEffect(() => {
		guidesRef.current = createSnappingLines(canvasRef);
	}, [zoomLevel, canvasScrollPoints]);
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
			'mod+shift+z',
			() => {
				if (redoable) {
					canvasRef.current?.discardActiveObject();
					dispatch(redo());
				}
			},
		],
		[
			'mod+z',
			() => {
				if (undoable) {
					canvasRef.current?.discardActiveObject();
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
					message: 'Phoenix Editor automatically saves your changes',
					icon: <IconCircleCheck size={20} />,
					color: 'green',
					autoClose: 1500,
				});
			},
		],
		[
			'mod+=',
			(event: KeyboardEvent) => {
				event.preventDefault();
				zoomIn();
			},
		],
		[
			'mod+-',
			(event: KeyboardEvent) => {
				event.preventDefault();
				zoomOut();
			},
		],
		[
			'mod+0',
			(event: KeyboardEvent) => {
				event.preventDefault();
				resetZoom();
			},
		],
		[
			'mod+/',
			(event: KeyboardEvent) => {
				event.preventDefault();
				zoomToFit();
			},
		],
		[
			'mod+g',
			(event: KeyboardEvent) => {
				event.preventDefault();
				createGroup();
			},
		],
		[
			'mod+shift+g',
			(event: KeyboardEvent) => {
				event.preventDefault();
				ungroup();
			},
		],
		[
			'backspace',
			(event: KeyboardEvent) => {
				event.preventDefault();
				deleteElement();
			},
		],
		[
			'mod+d',
			(event: KeyboardEvent) => {
				event.preventDefault();
				duplicateElement();
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
					return theme.colors.violet[1];
				}
				return theme.colors.violet[2];
			}

			return theme.colors.violet[1];
		}

		if (isArtboardSelected) {
			if (activeElement && !isElementInCurrentArtboard) {
				return theme.colors.gray[2];
			}

			return theme.colors.violet[1];
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
					<ZoomMenu
						zoom={zoomLevel}
						zoomIn={zoomIn}
						zoomOut={zoomOut}
						zoomReset={resetZoom}
						zoomToFit={zoomToFit}
					/>
					<Button size="xs" leftIcon={<IconDownload size={14} />} variant="light" onClick={exportArtboard}>
						Export
					</Button>
				</Group>
			</Box>
			<Flex className={classes.shell}>
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
									<SectionTitle>Artboards ({artboards.length})</SectionTitle>
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
													<Text size={12} color="gray">
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

						<Stack spacing={16} sx={{ padding: '0.5rem 1rem' }}>
							<Stack spacing={8}>
								<LayerList canvas={canvasRef.current} />
							</Stack>
						</Stack>
					</Box>
				) : null}
				<Center className={classes.center} ref={canvasContainerRef}>
					<canvas className={classes.canvas} id="canvas" />
				</Center>
				{showSidebar ? (
					<Box className={classes.right}>
						{canvasRef.current && currentSelectedElements && (
							<Panel
								canvas={canvasRef.current}
								currentSelectedElements={currentSelectedElements}
								saveArtboardChanges={saveArtboardChanges}
								activeArtboard={activeArtboard}
							/>
						)}
					</Box>
				) : null}
			</Flex>
			<NewArtboardModal
				opened={isNewArtboardModalOpen}
				onClose={closeNewArtboardModal}
				canvas={canvasRef.current}
			/>
		</Box>
	);
}

export default App;
