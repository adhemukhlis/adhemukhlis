import path from 'node:path'
import pdfmake from 'pdfmake'

import type { TDocumentDefinitions, TFontDictionary } from 'pdfmake/interfaces'

const fontDir = path.join(process.cwd(), 'public', '_assets', 'fonts')

const fonts: TFontDictionary = {
	NotoSerif: {
		normal: path.join(fontDir, 'NotoSerif-Regular.ttf'),
		bold: path.join(fontDir, 'NotoSerif-Bold.ttf'),
		italics: path.join(fontDir, 'NotoSerif-Italic.ttf'),
		bolditalics: path.join(fontDir, 'NotoSerif-BoldItalic.ttf'),
	},
}

// Configure pdfmake policies and fonts once when the module is imported
pdfmake.setLocalAccessPolicy((filePath: string) => filePath.startsWith(fontDir))
pdfmake.setUrlAccessPolicy(() => false)
pdfmake.setFonts(fonts)

/**
 * Generates a PDF from a document definition and returns the buffer directly as a Uint8Array.
 *
 * @param documentDefinition - The pdfmake document structure.
 * @returns A promise resolving to the PDF content as a Uint8Array.
 */
export async function createPdf(documentDefinition: TDocumentDefinitions): Promise<Uint8Array> {
	const buffer = await pdfmake.createPdf(documentDefinition).getBuffer()

	return new Uint8Array(buffer)
}
