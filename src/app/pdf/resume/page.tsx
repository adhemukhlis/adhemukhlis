'use client'

import dynamic from 'next/dynamic'

const PdfViewer = dynamic(() => import('@/components/PdfViewer'), {
	ssr: false,
	loading: () => (
		<div className="loader">
			<div className="spinner" />
		</div>
	),
})

const Page = () => {
	return <PdfViewer src="/api/pdf/resume" />
}

export default Page
