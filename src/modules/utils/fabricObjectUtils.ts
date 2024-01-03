import { RULER_ELEMENTS, RULER_LINES } from '../ruler';

const isSnappingExclude = (obj: fabric.Object) => !obj?.data?.isSnappingLine && !obj?.data?.ignoreSnapping;

const isRulerElementsExclude = (obj: fabric.Object) => !Object.values(RULER_ELEMENTS).includes(obj?.data?.type);

const isRulerLineExclude = (obj: fabric.Object) => !Object.values(RULER_LINES).includes(obj?.data?.type);

const isLayerPanelExclude = (obj: fabric.Object) =>
	isRulerElementsExclude(obj) && isRulerLineExclude(obj) && isSnappingExclude(obj);

const isExportExclude = (obj: fabric.Object) =>
	isRulerElementsExclude(obj) && isRulerLineExclude(obj) && isSnappingExclude(obj);

const isSaveExclude = (obj: fabric.Object) =>
	isSnappingExclude(obj) && isRulerElementsExclude(obj) && isRulerLineExclude(obj);

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
