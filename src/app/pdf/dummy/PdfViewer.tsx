'use client'

import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist'
import { useEffect, useRef, useState } from 'react'

import type { PDFDocumentProxy, RenderTask } from 'pdfjs-dist'

import './pdf-viewer.css'

// Set worker src using local public path
GlobalWorkerOptions.workerSrc = '/workers/pdf.worker.min.mjs'

export default function PdfViewer() {
	const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null)
	const [numPages, setNumPages] = useState<number>(0)
	const [currentPage, setCurrentPage] = useState<number>(1)
	const [scale, setScale] = useState<number>(1.0)
	const [loading, setLoading] = useState<boolean>(true)
	const [error, setError] = useState<string | null>(null)

	const workspaceRef = useRef<HTMLDivElement>(null)
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const renderTaskRef = useRef<RenderTask | null>(null)

	useEffect(() => {
		let isMounted = true

		const loadPdf = async () => {
			try {
				setLoading(true)
				setError(null)

				const response = await fetch('/api/pdf/dummy')

				if (!response.ok) {
					throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`)
				}

				const arrayBuffer = await response.arrayBuffer()

				if (!isMounted) {
					return
				}

				const loadingTask = getDocument({ data: arrayBuffer })
				const doc = await loadingTask.promise

				if (isMounted) {
					setPdfDoc(doc)
					setNumPages(doc.numPages)
					setLoading(false)
				}
			} catch (err: unknown) {
				const error = err as { message?: string }

				console.error('Error loading PDF:', err)

				if (isMounted) {
					setError(error.message || 'Failed to load PDF document')
					setLoading(false)
				}
			}
		}

		loadPdf()

		return () => {
			isMounted = false
		}
	}, [])

	useEffect(() => {
		if (!pdfDoc) {
			return
		}

		let isMounted = true

		const renderPage = async () => {
			try {
				const page = await pdfDoc.getPage(currentPage)

				if (!isMounted) {
					return
				}

				const viewport = page.getViewport({ scale })
				const canvas = canvasRef.current

				if (!canvas) {
					return
				}

				const context = canvas.getContext('2d')

				if (!context) {
					return
				}

				// High-DPI scaling rendering
				const dpr = window.devicePixelRatio || 1

				canvas.width = viewport.width * dpr
				canvas.height = viewport.height * dpr
				canvas.style.width = `${viewport.width}px`
				canvas.style.height = `${viewport.height}px`

				const renderContext = {
					canvasContext: context,
					viewport: viewport,
					transform: [dpr, 0, 0, dpr, 0, 0],
					canvas: canvas,
				}

				if (renderTaskRef.current) {
					renderTaskRef.current.cancel()
				}

				renderTaskRef.current = page.render(renderContext)
				await renderTaskRef.current.promise
			} catch (err: unknown) {
				const error = err as { name?: string; message?: string }

				if (error.name !== 'RenderingCancelledException') {
					console.error(`Error rendering page ${currentPage}:`, err)
				}
			}
		}

		renderPage()

		return () => {
			isMounted = false

			if (renderTaskRef.current) {
				renderTaskRef.current.cancel()
			}
		}
	}, [pdfDoc, currentPage, scale])

	return (
		<div className="pdf-viewer-container">
			{/* Minimalist Top Toolbar */}
			<div className="pdf-toolbar">
				{/* Page Navigation */}
				<div className="pdf-toolbar-section">
					<button
						type="button"
						className="pdf-btn"
						onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
						disabled={currentPage <= 1}
						title="Previous Page">
						<svg
							width="18"
							height="18"
							fill="none"
							stroke="currentColor"
							strokeWidth="2.5"
							viewBox="0 0 24 24">
							<path d="M15 19l-7-7 7-7" />
						</svg>
					</button>

					<span className="pdf-page-indicator">
						{currentPage} / {numPages || '—'}
					</span>

					<button
						type="button"
						className="pdf-btn"
						onClick={() => setCurrentPage((p) => Math.min(p + 1, numPages))}
						disabled={currentPage >= numPages}
						title="Next Page">
						<svg
							width="18"
							height="18"
							fill="none"
							stroke="currentColor"
							strokeWidth="2.5"
							viewBox="0 0 24 24">
							<path d="M9 5l7 7-7 7" />
						</svg>
					</button>
				</div>

				<div className="divider" />

				{/* Zoom Controls */}
				<div className="pdf-toolbar-section">
					<button
						type="button"
						className="pdf-btn"
						onClick={() => setScale((s) => Math.max(s - 0.2, 0.6))}
						disabled={scale <= 0.6}
						title="Zoom Out">
						<svg
							width="18"
							height="18"
							fill="none"
							stroke="currentColor"
							strokeWidth="2.5"
							viewBox="0 0 24 24">
							<line
								x1="5"
								y1="12"
								x2="19"
								y2="12"
							/>
						</svg>
					</button>

					<span className="pdf-zoom-label">{Math.round(scale * 100)}%</span>

					<button
						type="button"
						className="pdf-btn"
						onClick={() => setScale((s) => Math.min(s + 0.2, 2.0))}
						disabled={scale >= 2.0}
						title="Zoom In">
						<svg
							width="18"
							height="18"
							fill="none"
							stroke="currentColor"
							strokeWidth="2.5"
							viewBox="0 0 24 24">
							<line
								x1="12"
								y1="5"
								x2="12"
								y2="19"
							/>
							<line
								x1="5"
								y1="12"
								x2="19"
								y2="12"
							/>
						</svg>
					</button>
				</div>
			</div>

			{/* Workspace */}
			<div
				ref={workspaceRef}
				className="pdf-workspace">
				{loading && (
					<div className="pdf-loading-overlay">
						<div className="pdf-spinner" />
						<div className="pdf-loading-text">Loading PDF...</div>
					</div>
				)}

				{error && (
					<div className="pdf-error-container">
						<svg
							className="pdf-error-icon"
							width="40"
							height="40"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							viewBox="0 0 24 24">
							<circle
								cx="12"
								cy="12"
								r="10"
							/>
							<line
								x1="12"
								y1="8"
								x2="12"
								y2="12"
							/>
							<line
								x1="12"
								y1="16"
								x2="12.01"
								y2="16"
							/>
						</svg>
						<h2 className="pdf-error-title">Failed to load PDF</h2>
						<p className="pdf-error-message">{error}</p>
						<button
							type="button"
							className="pdf-btn pdf-btn-primary"
							onClick={() => window.location.reload()}>
							Retry
						</button>
					</div>
				)}

				{!loading && !error && pdfDoc && (
					<div className="pdf-page-container">
						<canvas
							ref={canvasRef}
							className="pdf-page-canvas"
						/>
					</div>
				)}
			</div>
		</div>
	)
}
