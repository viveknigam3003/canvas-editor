import { Artboard } from '../../types';

// Function to extract font family names from TextItem
const extractGoogleFontFamilies = (artboardTexts: fabric.Textbox[]): Set<string> => {
	const googleFontFamilies = new Set<string>();

	artboardTexts.forEach(textItem => {
		if (textItem.data?.googleFont) {
			const match = textItem.data.googleFont.match(/font-family: (.*?);/);
			if (match) {
				googleFontFamilies.add(match[1].trim());
			}
		}
	});

	return googleFontFamilies;
};

// Function to load Google Fonts
async function loadGoogleFonts(fontFamilies: Set<string>): Promise<void> {
	const response = await fetch('/fonts.json');
	const fontsJson = await response.json();

	const styleElement = document.createElement('style');
	document.head.appendChild(styleElement);

	fontFamilies.forEach(fontFamily => {
		const font = fontsJson.items.find((item: any) => item.family === fontFamily);
		if (font) {
			// Construct @font-face rules for each variant
			Object.entries(font.files).forEach(([weight, url]) => {
				const fontFaceRule = `
			@font-face {
			  font-family: '${fontFamily}';
			  font-style: ${weight.includes('italic') ? 'italic' : 'normal'};
			  font-weight: ${weight.replace('italic', '')};
			  src: url('${url}') format('woff2');
			}
		  `;
				styleElement.appendChild(document.createTextNode(fontFaceRule));
			});
		}
	});
}

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

/**
 * Returns a promise that resolves when all fonts from the artboards are loaded
 * @param artboards Array of artboards to load fonts from
 */
export const loadFontsFromArtboards = async (artboards: Artboard[]) => {
	const artboardTexts = artboards
		.map(artboard => artboard.state?.objects)
		.flat()
		.filter(item => item.type === 'textbox');

	const uniqueFonts = extractUniqueFonts(artboardTexts);
	const googleFontFamilies = extractGoogleFontFamilies(artboardTexts);

	// Load Google Fonts
	await loadGoogleFonts(googleFontFamilies);

	// Load local fonts
	const fontLoaders = Array.from(uniqueFonts).map(fontFamily => {
		return isFontLoadingApiSupported() ? loadFontWithApi(fontFamily) : loadFontWithObserver(fontFamily);
	});

	await Promise.all(fontLoaders);
};
