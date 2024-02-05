export const keysInOption = [
	'id', //done
	'type', //done
	'text', //done
	'prefix', //don't know
	'charCount', // not used, this is different than char count on ui
	'modifyLength.headingTop', //done
	'modifyLength.headingBottom', //done
	'modifyLength.headingLeft', //done
	'modifyLength.headingRight', //done
	'styles.font', //done
	'styles.textColor', //done
	'styles.border', //TODO:
	'styles.textAlignment', //done
	'styles.textAlignmentVertical', //TODO:
	'styles.lineSpacing', //done
	'styles.fontStyle', // need to check
	'styles.textShadow', //done
	'styles.highlightColor',
	'styles.backgroundColor',
	'styles.padding.all', //done
	'styles.padding.left', //done
	'styles.padding.right', //done
	'styles.padding.top', //done
	'styles.padding.bottom', //done
	'styles.background', // done
	'styles.animation.fourth-out',
	'styles.animation.fourth',
	'styles.animation.third-out',
	'styles.animation.third',
	'styles.animation.second-out',
	'styles.animation.second',
	'styles.animation.first',
	'textColor', //done
	'overrides.1080x1080.padding.all', //done
	'overrides.1080x1080.padding.left', //done
	'overrides.1080x1080.padding.right', //done
	'overrides.1080x1080.padding.top', //done
	'overrides.1080x1080.padding.bottom', //done
	'overrides.1080x1080.modifyLength.headingTop', //done
	'overrides.1080x1080.modifyLength.headingBottom', //done
	'overrides.1080x1080.modifyLength.headingLeft', //done
	'overrides.1080x1080.modifyLength.headingRight', //done
	'overrides.1080x1080.modifyLength.rotateAngle', //done
	'overrides.1080x1080.breakParentGroup',
	'overrides.1080x1080.font', //done
	'overrides.1080x1080.backgroundColor.type', // not implemented
	'overrides.1080x1080.backgroundColor.colorStops.0.r', // not implemented
	'overrides.1080x1080.backgroundColor.colorStops.0.g', // not implemented
	'overrides.1080x1080.backgroundColor.colorStops.0.b', // not implemented
	'overrides.1080x1080.backgroundColor.colorStops.0.a', // not implemented
	'overrides.1080x1080.backgroundColor.colorStops.0.left', // not implemented
	'overrides.1080x1080.backgroundColor.colorStops.1.r', // not implemented
	'overrides.1080x1080.backgroundColor.colorStops.1.g', // not implemented
	'overrides.1080x1080.backgroundColor.colorStops.1.b', // not implemented
	'overrides.1080x1080.backgroundColor.colorStops.1.a', // not implemented
	'overrides.1080x1080.backgroundColor.colorStops.1.left', // not implemented
	'overrides.1080x1080.backgroundColor.angle', // not implemented
	'overrides.1200x628.padding.all', //done
	'overrides.1200x628.padding.left', //done
	'overrides.1200x628.padding.right', //done
	'overrides.1200x628.padding.top', //done
	'overrides.1200x628.padding.bottom', //done
	'overrides.1200x628.modifyLength.headingTop', //done
	'overrides.1200x628.modifyLength.headingBottom', //done
	'overrides.1200x628.modifyLength.headingLeft', //done
	'overrides.1200x628.modifyLength.headingRight', //done
	'overrides.1200x628.modifyLength.rotateAngle', //done
	'overrides.1200x628.breakParentGroup',
	'overrides.1200x628.font', //done
	'overrides.1200x628.backgroundColor.type',
	'overrides.1200x628.backgroundColor.colorStops.0.r', // not implemented
	'overrides.1200x628.backgroundColor.colorStops.0.g', // not implemented
	'overrides.1200x628.backgroundColor.colorStops.0.b', // not implemented
	'overrides.1200x628.backgroundColor.colorStops.0.a', // not implemented
	'overrides.1200x628.backgroundColor.colorStops.0.left', // not implemented
	'overrides.1200x628.backgroundColor.colorStops.1.r', // not implemented
	'overrides.1200x628.backgroundColor.colorStops.1.g', // not implemented
	'overrides.1200x628.backgroundColor.colorStops.1.b', // not implemented
	'overrides.1200x628.backgroundColor.colorStops.1.a', // not implemented
	'overrides.1200x628.backgroundColor.colorStops.1.left', // not implemented
	'overrides.1200x628.backgroundColor.angle', // not implemented
	'overrides.1200x628.fontStyle', //not needed
	'overrides.1200x628.textAlignment', //done
	'overrides.1200x628.textAlignmentVertical', // not implemented
	'overrides.1200x628.lineSpacing', //done
	'customFontSize',
	'textVideoEffect', //not needed
	'backgroundColor.type', // not implemented
	'backgroundColor.colorStops.0.r', // not implemented
	'backgroundColor.colorStops.0.g', // not implemented
	'backgroundColor.colorStops.0.b', // not implemented
	'backgroundColor.colorStops.0.a', // not implemented
	'backgroundColor.colorStops.0.left', // not implemented
	'backgroundColor.colorStops.1.r', // not implemented
	'backgroundColor.colorStops.1.g', // not implemented
	'backgroundColor.colorStops.1.b', // not implemented
	'backgroundColor.colorStops.1.a', // not implemented
	'backgroundColor.colorStops.1.left', // not implemented
	'backgroundColor.angle', // not implemented
	'textShadow', //done
	'isFixedTimeEnabled', //not needed
	'highlightColor', // not needed
	'fontStyle', //not needed
	'customElementId', //not needed
	'isText', // not needed i guess
	'styles.layerIndex',
	'textColor.type', //done
	'textColor.color', //done
	'overrides.1080x1080.layerIndex',
	'overrides.1080x1080.textRotation', //done
	'overrides.1080x1080.fontStyle', //not needed
	'overrides.1080x1080.customFontSize',
	'overrides.1080x1080.textColor.type', //done
	'overrides.1080x1080.textColor.color', //done
	'overrides.1200x628.layerIndex', //done
	'overrides.1200x628.textRotation', //done
	'overrides.1200x628.customFontSize', // will need to figure out from auto fit
	'overrides.1080x1080.capitalization', //done
	'overrides.1080x1080.textDecoration', //done
	'overrides.1080x1080.borderStyle.width', //done
	'overrides.1080x1080.borderStyle.style', // done for solid only, need to check for others
	'overrides.1080x1080.borderStyle.color', // done
	'overrides.1080x1080.borderRadius.all', // will implement later
	'overrides.1080x1080.borderRadius.topLeft', // will implement later
	'overrides.1080x1080.borderRadius.topRight', // will implement later
	'overrides.1080x1080.borderRadius.bottomLeft', // will implement later
	'overrides.1080x1080.borderRadius.bottomRight', // will implement later
	'overrides.1080x1080.textShadow.color.r', //done
	'overrides.1080x1080.textShadow.color.g', //done
	'overrides.1080x1080.textShadow.color.b', //done
	'overrides.1080x1080.textShadow.color.a', //done
	'overrides.1080x1080.textShadow.blur', //done
	'overrides.1080x1080.textShadow.vShadow', //done
	'overrides.1080x1080.textShadow.hShadow', //done
	'overrides.1080x1080.backgroundColor.color', //done
	'overrides.1200x628.capitalization', //done
	'overrides.1200x628.textDecoration', //done
	'overrides.1200x628.borderStyle.width', //done
	'overrides.1200x628.borderStyle.style', // done for solid only, need to check for others
	'overrides.1200x628.borderStyle.color', // done
	'overrides.1200x628.borderRadius.all', // will implement later
	'overrides.1200x628.borderRadius.topLeft', // will implement later
	'overrides.1200x628.borderRadius.topRight', // will implement later
	'overrides.1200x628.borderRadius.bottomLeft', // will implement later
	'overrides.1200x628.borderRadius.bottomRight', // will implement later
	'overrides.1200x628.textShadow.color.r', //done
	'overrides.1200x628.textShadow.color.g', //done
	'overrides.1200x628.textShadow.color.b', //done
	'overrides.1200x628.textShadow.color.a', //done
	'overrides.1200x628.textShadow.blur', //done
	'overrides.1200x628.textShadow.vShadow', //done
	'overrides.1200x628.textShadow.hShadow', //done
	'overrides.1200x628.backgroundColor.color', //done
	'backgroundColor.color', //done
	'elementType',
	'subType',
	'styles.imageShape',
	'styles.customCss.elementDomAppend',
	'url',
	'imageShape',
	'backgroundColor',
	'templateRules.helpText',
	'helpText',
	'overrides.1080x1080.svgInfo.pathData.0.0',
	'overrides.1080x1080.svgInfo.pathData.0.1.x',
	'overrides.1080x1080.svgInfo.pathData.0.1.y',
	'overrides.1080x1080.svgInfo.pathData.0.1.node',
	'overrides.1080x1080.svgInfo.pathData.1.0',
	'overrides.1080x1080.svgInfo.pathData.1.1.x',
	'overrides.1080x1080.svgInfo.pathData.1.1.y',
	'overrides.1080x1080.svgInfo.pathData.1.1.node',
	'overrides.1080x1080.svgInfo.pathData.2.0',
	'overrides.1080x1080.svgInfo.pathData.2.1.x',
	'overrides.1080x1080.svgInfo.pathData.2.1.y',
	'overrides.1080x1080.svgInfo.pathData.2.1.node',
	'overrides.1080x1080.svgInfo.pathData.3.0',
	'overrides.1080x1080.svgInfo.pathData.3.1.x',
	'overrides.1080x1080.svgInfo.pathData.3.1.y',
	'overrides.1080x1080.svgInfo.pathData.3.1.node',
	'overrides.1080x1080.svgInfo.pathData.4.0',
	'overrides.1080x1080.elementBgBlur',
	'overrides.1080x1080.shadow',
	'overrides.1080x1080.opacity',
	'overrides.1080x1080.textBlendMode',
	'overrides.1200x628.svgInfo.pathData.0.0',
	'overrides.1200x628.svgInfo.pathData.0.1.x',
	'overrides.1200x628.svgInfo.pathData.0.1.y',
	'overrides.1200x628.svgInfo.pathData.0.1.node',
	'overrides.1200x628.svgInfo.pathData.1.0',
	'overrides.1200x628.svgInfo.pathData.1.1.x',
	'overrides.1200x628.svgInfo.pathData.1.1.y',
	'overrides.1200x628.svgInfo.pathData.1.1.node',
	'overrides.1200x628.svgInfo.pathData.2.0',
	'overrides.1200x628.svgInfo.pathData.2.1.x',
	'overrides.1200x628.svgInfo.pathData.2.1.y',
	'overrides.1200x628.svgInfo.pathData.2.1.node',
	'overrides.1200x628.svgInfo.pathData.3.0',
	'overrides.1200x628.svgInfo.pathData.3.1.x',
	'overrides.1200x628.svgInfo.pathData.3.1.y',
	'overrides.1200x628.svgInfo.pathData.3.1.node',
	'overrides.1200x628.svgInfo.pathData.4.0',
	'overrides.1200x628.textColor.type', //done
	'overrides.1200x628.textColor.color', //done
	'overrides.1200x628.elementBgBlur',
	'overrides.1200x628.shadow',
	'overrides.1200x628.opacity',
	'overrides.1200x628.textBlendMode',
	'overrides.1200x628.imageShape',
	'textBlendMode',
	'overrides.1080x1080.imageShape',
	'overrides.1080x1080.objectPosition.horizontal',
	'overrides.1080x1080.objectPosition.vertical',
	'overrides.1080x1080.objectPositionScale',
	'overrides.1080x1080.colorInversion',
	'overrides.1200x628.objectPosition.horizontal',
	'overrides.1200x628.objectPosition.vertical',
	'overrides.1200x628.objectPositionScale',
	'overrides.1200x628.colorInversion',
	'svgString',
	'fullDuration',
	'objectPositionScale',
];
