'use client'

import { getDocument, GlobalWorkerOptions, TextLayer } from 'pdfjs-dist'
import { use, useEffect, useRef, useState } from 'react'

import styles from './pdf-viewer.module.css'

import type { PDFDocumentProxy, RenderTask } from 'pdfjs-dist'

GlobalWorkerOptions.workerSrc = '/workers/pdf.worker.min.mjs'

interface PdfPromiseResult {
	doc: PDFDocumentProxy | null
	error: string | null
}

const pdfCache = new Map<string, Promise<PdfPromiseResult>>()

function getPdfPromise(src: string): Promise<PdfPromiseResult> {
	let promise = pdfCache.get(src)

	if (!promise) {
		const load = async (): Promise<PdfPromiseResult> => {
			try {
				const response = await fetch(src)

				if (!response.ok) {
					throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`)
				}

				const arrayBuffer = await response.arrayBuffer()
				const loadingTask = getDocument({ data: arrayBuffer })
				const doc = await loadingTask.promise

				return { doc, error: null }
			} catch (err: unknown) {
				const error = err as { message?: string }

				console.error('Error loading PDF:', err)

				return { doc: null, error: error.message || 'Failed to load PDF document' }
			}
		}

		promise = load()
		pdfCache.set(src, promise)
	}

	return promise
}

export default function PdfViewer({ src }: { src: string }) {
	const isMountedRef = useRef<boolean>(false)

	const pdfPromise = getPdfPromise(src)

	const { doc: pdfDoc, error } = use(pdfPromise)
	const numPages = pdfDoc?.numPages || 0

	const [currentPage, setCurrentPage] = useState<number>(1)
	const [scale, setScale] = useState<number>(1.0)
	const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null)
	const [workspaceWidth, setWorkspaceWidth] = useState<number>(0)
	const [workspaceHeight, setWorkspaceHeight] = useState<number>(0)

	const workspaceRef = useRef<HTMLDivElement>(null)
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const textLayerRef = useRef<HTMLDivElement>(null)
	const renderTaskRef = useRef<RenderTask | null>(null)
	const textLayerInstanceRef = useRef<TextLayer | null>(null)

	useEffect(() => {
		isMountedRef.current = true

		const handleResize = () => {
			if (workspaceRef.current) {
				setWorkspaceWidth(workspaceRef.current.clientWidth)
				setWorkspaceHeight(workspaceRef.current.clientHeight)
			}
		}

		handleResize()
		window.addEventListener('resize', handleResize)

		return () => {
			isMountedRef.current = false
			window.removeEventListener('resize', handleResize)
		}
	}, [])

	useEffect(() => {
		if (!pdfDoc) {
			return
		}

		const renderPage = async () => {
			try {
				if (textLayerInstanceRef.current) {
					textLayerInstanceRef.current.cancel()
				}

				if (textLayerRef.current) {
					textLayerRef.current.innerHTML = ''
				}

				const page = await pdfDoc.getPage(currentPage)

				if (!isMountedRef.current) {
					return
				}

				const originalViewport = page.getViewport({ scale: 1.0 })
				const pageWidth = originalViewport.width
				const pageHeight = originalViewport.height

				// Dynamically compute padding from CSS styles to prevent overflow scrollbars
				let paddingX = 32
				let paddingY = 32
				const workspace = workspaceRef.current

				if (workspace) {
					const style = window.getComputedStyle(workspace)

					paddingX = (parseFloat(style.paddingLeft) || 0) + (parseFloat(style.paddingRight) || 0)
					paddingY = (parseFloat(style.paddingTop) || 0) + (parseFloat(style.paddingBottom) || 0)
				}

				// Subtract a tiny safety buffer (4px) to prevent subpixel layout rounding from triggering unnecessary scrollbars
				const availWidth = Math.max(workspaceWidth - paddingX - 4, 200)
				const availHeight = Math.max(workspaceHeight - paddingY - 4, 200)

				const scaleX = availWidth / pageWidth
				const scaleY = availHeight / pageHeight
				const fitScale = Math.min(scaleX, scaleY)

				const actualScale = scale * fitScale
				const viewport = page.getViewport({ scale: actualScale })

				if (isMountedRef.current) {
					setDimensions({ width: viewport.width, height: viewport.height })
				}

				const canvas = canvasRef.current

				if (!canvas) {
					return
				}

				const context = canvas.getContext('2d')

				if (!context) {
					return
				}

				const dpr = window.devicePixelRatio || 1

				canvas.width = viewport.width * dpr
				canvas.height = viewport.height * dpr

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

				// Render Text Layer overlay for high-fidelity text selection & copying
				if (!isMountedRef.current) {
					return
				}

				if (textLayerRef.current) {
					const textContent = await page.getTextContent()

					if (!isMountedRef.current) {
						return
					}

					const textLayer = new TextLayer({
						textContentSource: textContent,
						container: textLayerRef.current,
						viewport: viewport,
					})

					textLayerInstanceRef.current = textLayer
					await textLayer.render()
				}
			} catch (err: unknown) {
				const error = err as { name?: string; message?: string }

				if (error.name !== 'RenderingCancelledException' && error.name !== 'AbortException') {
					console.error(`Error rendering page ${currentPage}:`, err)
				}
			}
		}

		renderPage()

		return () => {
			if (renderTaskRef.current) {
				renderTaskRef.current.cancel()
			}

			if (textLayerInstanceRef.current) {
				textLayerInstanceRef.current.cancel()
			}
		}
	}, [pdfDoc, currentPage, scale, workspaceWidth, workspaceHeight])

	return (
		<div className={styles.pdfViewerContainer}>
			<div className={styles.pdfToolbar}>
				<div className={styles.pdfToolbarSection}>
					<button
						type="button"
						className={styles.pdfBtn}
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

					<span className={styles.pdfPageIndicator}>
						{currentPage} / {numPages || '—'}
					</span>

					<button
						type="button"
						className={styles.pdfBtn}
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

				<div className={styles.divider} />

				{/* Zoom Controls */}
				<div className={styles.pdfToolbarSection}>
					<button
						type="button"
						className={styles.pdfBtn}
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

					<span className={styles.pdfZoomLabel}>{Math.round(scale * 100)}%</span>

					<button
						type="button"
						className={styles.pdfBtn}
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
			<div
				ref={workspaceRef}
				className={styles.pdfWorkspace}>
				{error && (
					<div className={styles.pdfErrorContainer}>
						<h2 className={styles.pdfErrorTitle}>Failed to load PDF</h2>
						<p className={styles.pdfErrorMessage}>{error}</p>
						<button
							type="button"
							className={`${styles.pdfBtn} ${styles.pdfBtnPrimary}`}
							onClick={() => window.location.reload()}>
							Retry
						</button>
					</div>
				)}

				{!error && pdfDoc && (
					<div
						className={styles.pdfPageContainer}
						style={
							dimensions
								? {
										width: `${dimensions.width}px`,
										height: `${dimensions.height}px`,
										aspectRatio: `${dimensions.width} / ${dimensions.height}`,
									}
								: undefined
						}>
						<canvas
							ref={canvasRef}
							className={styles.pdfPageCanvas}
						/>
						<div
							ref={textLayerRef}
							className="textLayer"
						/>
					</div>
				)}
			</div>
		</div>
	)
}
