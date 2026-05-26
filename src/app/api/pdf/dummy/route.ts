import { NextResponse } from 'next/server'

import { docDefinition } from './document'
import { createPdf } from '@/lib/pdf'

export async function GET(): Promise<NextResponse> {
	try {
		const pdfBuffer = await createPdf(docDefinition())

		return new NextResponse(Buffer.from(pdfBuffer), {
			status: 200,
			headers: {
				'Content-Type': 'application/pdf',
				'Content-Disposition': 'inline; filename="dummy.pdf"',
			},
		})
	} catch (error) {
		console.error('PDF generation failed:', error)

		return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 })
	}
}
