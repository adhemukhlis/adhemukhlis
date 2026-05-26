'use client'

import dynamic from 'next/dynamic'

const PdfViewer = dynamic(() => import('./PdfViewer'), {
	ssr: false,
	loading: () => (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				width: '100vw',
				height: '100vh',
				backgroundColor: '#f8fafc',
				color: '#64748b',
				fontFamily: 'system-ui, -apple-system, sans-serif',
			}}>
			<div
				style={{
					width: '3rem',
					height: '3rem',
					border: '4px solid #e2e8f0',
					borderTop: '4px solid #6366f1',
					borderRadius: '50%',
					animation: 'spin 1s linear infinite',
				}}
			/>
			<style>{`
				@keyframes spin {
					0% { transform: rotate(0deg); }
					100% { transform: rotate(360deg); }
				}
			`}</style>
			<div
				style={{
					marginTop: '1rem',
					fontSize: '1rem',
					fontWeight: 500,
					letterSpacing: '-0.025em',
				}}>
				Initializing PDF Engine...
			</div>
		</div>
	),
})

const Page = () => {
	return <PdfViewer />
}

export default Page
