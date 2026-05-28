'use client'

import dynamic from 'next/dynamic'

const PdfViewer = dynamic(() => import('./PdfViewer'), {
	ssr: false,
	loading: () => (
		<div className="loader">
			<div className="spinner" />
		</div>
	),
})

const Page = () => {
	return <PdfViewer src="/api/pdf/dummy" />
}

export default Page
