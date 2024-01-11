import { Artboard } from '../../types';

const isFontLoadingApiSupported = () => {
	return 'fonts' in document;
};

// Function to load a font using the Font Loading API
async function loadFontWithApi(fontFamily: string): Promise<void> {
	try {
		await document.fonts.load(`1em ${fontFamily}`);
	} catch (err) {
		console.error(`Error loading font ${fontFamily} with Font Loading API:`, err);
	}
}

const extractUniqueFonts = (artboardTexts: fabric.Textbox[]) => {
	const fonts = new Set<string>();

	artboardTexts.forEach(textItem => {
		if (textItem.data) {
			if (typeof textItem.data.boldFont === 'string') {
				fonts.add(textItem.data.boldFont);
			}
			if (typeof textItem.data.font === 'string') {
				fonts.add(textItem.data.font);
			}
		}
		if (textItem.fontFamily) {
			fonts.add(textItem.fontFamily);
		}
	});

	return fonts;
};

async function loadFontWithObserver(fontFamily: string): Promise<void> {
	const observer = new FontFaceObserver(fontFamily);
	try {
		return await observer.load();
	} catch (err) {
		console.error(`Error loading font ${fontFamily} with FontFaceObserver:`, err);
	}
}

export const loadFontsFromArtboards = async (artboards: Artboard[]) => {
	const artboardTexts = artboards
		.map(artboard => artboard.state?.objects)
		.flat()
		.filter(item => item.type === 'textbox');

	const uniqueFonts = extractUniqueFonts(artboardTexts);
	const fontLoaders = Array.from(uniqueFonts).map(fontFamily => {
		return isFontLoadingApiSupported() ? loadFontWithApi(fontFamily) : loadFontWithObserver(fontFamily);
	});

	await Promise.all(fontLoaders);
};
