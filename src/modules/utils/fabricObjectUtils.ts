import { RULER_ELEMENTS, RULER_LINES } from '../ruler';

// filters snapLine type and snapping ignore objects
const isSnappingExclude = (obj: fabric.Object) => obj?.data?.type !== 'snapLine' && !obj?.data?.ignoreSnapping;

// filters all elements related to ruler except ruler lines
const isRulerElementsExclude = (obj: fabric.Object) => !Object.values(RULER_ELEMENTS).includes(obj?.data?.type);

// filters all ruler lines
const isRulerLineExclude = (obj: fabric.Object) => !Object.values(RULER_LINES).includes(obj?.data?.type);

const isLayerPanelExclude = (obj: fabric.Object) =>
	isRulerElementsExclude(obj) && isRulerLineExclude(obj) && isSnappingExclude(obj);

const isExportExclude = (obj: fabric.Object) =>
	isRulerElementsExclude(obj) && isRulerLineExclude(obj) && isSnappingExclude(obj);

const isSaveExclude = (obj: fabric.Object) => !obj?.data?.isSaveExclude;

export const filterSnappingExcludes = (arr: fabric.Object[] | undefined) => {
	if (!arr) return [];
	return arr.filter(isSnappingExclude);
};

export const filterRulerExcludes = (arr: fabric.Object[] | undefined) => {
	if (!arr) return [];
	return arr.filter(isRulerElementsExclude);
};

export const filterSaveExcludes = (arr: fabric.Object[] | undefined) => {
	if (!arr) return [];
	const res = arr.filter(isSaveExclude);
	return res;
};

export const filterLayerPanelExcludes = (arr: fabric.Object[] | undefined) => {
	if (!arr) return [];
	return arr.filter(isLayerPanelExclude);
};

export const filterExportExcludes = (arr: fabric.Object[] | undefined) => {
	if (!arr) return [];
	return arr.filter(isExportExclude);
};
