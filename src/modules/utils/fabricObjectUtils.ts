import { RULER_ELEMENTS, RULER_LINES } from '../ruler';

// filters snapLine type and snapping ignore objects
const isSnappingExclude = (obj: FabricObject) => obj?.data?.type !== 'snapLine' && !obj?.data?.ignoreSnapping;

// filters all elements related to ruler except ruler lines
const isRulerElementsExclude = (obj: FabricObject) => !Object.values(RULER_ELEMENTS).includes(obj?.data?.type);

// filters all ruler lines
const isRulerLineExclude = (obj: FabricObject) => !Object.values(RULER_LINES).includes(obj?.data?.type);

const isLayerPanelExclude = (obj: FabricObject) =>
	isRulerElementsExclude(obj) && isRulerLineExclude(obj) && isSnappingExclude(obj);

const isExportExclude = (obj: FabricObject) =>
	isRulerElementsExclude(obj) && isRulerLineExclude(obj) && isSnappingExclude(obj);

const isSaveExclude = (obj: FabricObject) => !obj?.data?.isSaveExclude;

export const filterSnappingExcludes = (arr: FabricObject[] | undefined) => {
	if (!arr) return [];
	return arr.filter(isSnappingExclude);
};

export const filterRulerExcludes = (arr: FabricObject[] | undefined) => {
	if (!arr) return [];
	return arr.filter(isRulerElementsExclude);
};

export const filterSaveExcludes = (arr: FabricObject[] | undefined) => {
	if (!arr) return [];
	const res = arr.filter(isSaveExclude);
	return res;
};

export const filterLayerPanelExcludes = (arr: FabricObject[] | undefined) => {
	if (!arr) return [];
	return arr.filter(isLayerPanelExclude);
};

export const filterExportExcludes = (arr: FabricObject[] | undefined) => {
	if (!arr) return [];
	return arr.filter(isExportExclude);
};
