import type { ContentColumns, ContentText, ContentUnorderedList, TDocumentDefinitions } from 'pdfmake/interfaces'

const CM = 28.35 as const

const disclaimerText =
	'This document is a dummy file created solely for development and testing purposes. All content contained herein does not represent actual data and holds no legal validity. Please do not use this document for any official or operational purposes.'

const pageBreakText =
	'This is the second page of the dummy document. It is created to test multi-page rendering, navigation controls, page numbers, and custom zoom features across different viewport layouts.'

const heading: ContentText = {
	text: 'DUMMY DOCUMENT',
	alignment: 'center',
	bold: true,
	fontSize: 24,
}

const sectionTitle: ContentText = {
	text: 'Title Example',
	bold: true,
	fontSize: 16,
	margin: [0, 72, 0, 0],
}

const sectionTitlePageBreak: ContentText = {
	text: 'Page Break Example',
	bold: true,
	fontSize: 16,
	margin: [0, 0, 0, 0],
}

const bodyText = (text: string): ContentText => ({
	text,
	fontSize: 12,
	lineHeight: 1.5,
	margin: [0, 10, 0, 0],
})

const bulletList: ContentColumns = {
	columns: [
		{ width: 20, text: '' },
		{
			ul: ['Dummy Document', 'Development Purpose', 'Do not use in real operational cases'],
			fontSize: 12,
			margin: [0, 0, 0, 0],
		} satisfies ContentUnorderedList,
	],
}

export const docDefinition = (): TDocumentDefinitions => {
	const dateStamp: ContentText = {
		text: new Date().toLocaleDateString('en-US', {
			day: '2-digit',
			month: 'long',
			year: 'numeric',
		}),
		alignment: 'center',
	}

	return {
		compress: true,
		version: '1.7',
		displayTitle: true,
		permissions: {
			printing: 'highResolution',
			modifying: false,
			copying: false,
			annotating: false,
			fillingForms: false,
			contentAccessibility: false,
			documentAssembly: false,
		},
		pageSize: 'A4',
		pageMargins: [2 * CM, 2 * CM, 2 * CM, 2 * CM],
		info: {
			title: 'DUMMY DOCUMENT',
			author: '',
			subject: '',
			keywords: '',
			creator: '',
			producer: '',
		},
		content: [
			heading,
			dateStamp,
			sectionTitle,
			bodyText(disclaimerText),
			bulletList,
			bodyText(disclaimerText),
			{ text: '', pageBreak: 'before' },
			sectionTitlePageBreak,
			bodyText(pageBreakText),
		],
		defaultStyle: {
			font: 'NotoSerif',
			color: '#000',
			fontSize: 10,
			columnGap: 16,
		},
	}
}
