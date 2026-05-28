'use client'

import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist'
import { use, useCallback, useEffect, useRef, useState } from 'react'

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

interface PdfPageProps {
	pageNumber: number
	pdfDoc: PDFDocumentProxy
	scale: number
	workspaceWidth: number
	workspaceHeight: number
	onAspectRatioCalculated: (pageNumber: number, aspectRatio: number) => void
}

/* Isolated Page Component to manage rendering and cancellation lifecycle safely */
function PdfPage({ pageNumber, pdfDoc, scale, workspaceWidth, workspaceHeight, onAspectRatioCalculated }: PdfPageProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const renderTaskRef = useRef<RenderTask | null>(null)
	const [isPageLoading, setIsPageLoading] = useState<boolean>(true)

	useEffect(() => {
		let isCancelled = false

		const renderPage = async () => {
			try {
				setIsPageLoading(true)
				const page = await pdfDoc.getPage(pageNumber)

				if (isCancelled) {
					return
				}

				const originalViewport = page.getViewport({ scale: 1.0 })
				const aspectRatio = originalViewport.width / originalViewport.height

				onAspectRatioCalculated(pageNumber, aspectRatio)

				// Padding is already subtracted from contentRect by ResizeObserver
				const paddingX = 0
				const paddingY = 0
				const availWidth = Math.max(workspaceWidth - paddingX - 4, 200)
				const availHeight = Math.max(workspaceHeight - paddingY - 4, 200)

				// Calculate display size for fitting the page to viewport (contain logic)
				const baseDisplayWidth = Math.min(availWidth, availHeight * aspectRatio)
				const actualScale = scale * (baseDisplayWidth / originalViewport.width)
				const viewport = page.getViewport({ scale: actualScale })

				const canvas = canvasRef.current

				if (!canvas || isCancelled) {
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

				// Cancel previous render tasks to prevent canvas tearing & resource leaks
				if (renderTaskRef.current) {
					renderTaskRef.current.cancel()
				}

				renderTaskRef.current = page.render(renderContext)
				await renderTaskRef.current.promise

				setIsPageLoading(false)
			} catch (err: unknown) {
				const error = err as { name?: string }

				if (error.name !== 'RenderingCancelledException' && error.name !== 'AbortException') {
					console.error(`Error rendering page ${pageNumber}:`, err)
				}
			}
		}

		renderPage()

		return () => {
			isCancelled = true

			if (renderTaskRef.current) {
				renderTaskRef.current.cancel()
			}
		}
	}, [pdfDoc, pageNumber, scale, workspaceWidth, workspaceHeight, onAspectRatioCalculated])

	return (
		<>
			{isPageLoading && (
				<div
					className={styles.pdfLoadingOverlay}
					style={{ position: 'absolute', zIndex: 1 }}>
					<div className={styles.pdfSpinner} />
				</div>
			)}
			<canvas
				ref={canvasRef}
				className={styles.pdfPageCanvas}
			/>
		</>
	)
}

export default function PdfViewer({ src }: { src: string }) {
	const pdfPromise = getPdfPromise(src)
	const { doc: pdfDoc, error } = use(pdfPromise)
	const numPages = pdfDoc?.numPages || 0

	const [currentPage, setCurrentPage] = useState<number>(1)
	const [scale, setScale] = useState<number>(1.0)
	const [workspaceWidth, setWorkspaceWidth] = useState<number>(0)
	const [workspaceHeight, setWorkspaceHeight] = useState<number>(0)
	const [fallbackAspectRatio, setFallbackAspectRatio] = useState<number>(0.7071) // Default to standard A4 (1 / sqrt(2))
	const [pageAspectRatios, setPageAspectRatios] = useState<Record<number, number>>({})

	const workspaceRef = useRef<HTMLDivElement>(null)
	const isScrollingRef = useRef<boolean>(false)

	// Update active workspace dimensions dynamically using ResizeObserver to prevent layout race conditions
	useEffect(() => {
		const workspace = workspaceRef.current

		if (!workspace) {
			return
		}

		const observer = new ResizeObserver((entries) => {
			for (const entry of entries) {
				const { width, height } = entry.contentRect

				setWorkspaceWidth(width)
				setWorkspaceHeight(height)
			}
		})

		observer.observe(workspace)

		return () => {
			observer.disconnect()
		}
	}, [])

	// Pre-fetch the first page to calibrate fallback aspect ratio accurately on mount
	useEffect(() => {
		if (!pdfDoc) {
			return
		}

		pdfDoc
			.getPage(1)
			.then((page) => {
				const viewport = page.getViewport({ scale: 1.0 })

				setFallbackAspectRatio(viewport.width / viewport.height)
			})
			.catch((err) => {
				console.error('Error pre-fetching page 1 aspect ratio:', err)
			})
	}, [pdfDoc])

	// IntersectionObserver to dynamically track visible pages in viewport and update currentPage
	useEffect(() => {
		if (!pdfDoc || numPages <= 0) {
			return
		}

		const workspace = workspaceRef.current

		if (!workspace) {
			return
		}

		const pageVisibility: Record<number, number> = {}

		const observer = new IntersectionObserver(
			(entries) => {
				// Skip scroll updates if we are in programmatic scroll transition
				if (isScrollingRef.current) {
					return
				}

				entries.forEach((entry) => {
					const pageNum = Number(entry.target.getAttribute('data-page-number'))

					if (pageNum) {
						pageVisibility[pageNum] = entry.intersectionRatio
					}
				})

				// Determine page with maximum visible ratio in viewport
				let maxRatio = 0
				let mostVisiblePage = currentPage

				Object.entries(pageVisibility).forEach(([pageNumStr, ratio]) => {
					const pageNum = Number(pageNumStr)

					if (ratio > maxRatio) {
						maxRatio = ratio
						mostVisiblePage = pageNum
					}
				})

				// Threshold buffer to prevent erratic switching on boundaries
				if (maxRatio > 0.05 && mostVisiblePage !== currentPage) {
					setCurrentPage(mostVisiblePage)
				}
			},
			{
				root: workspace,
				rootMargin: '-10% 0px -10% 0px', // Shrink vertical window boundary slightly for precise page indexing
				threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
			},
		)

		// Observe all rendered page containers
		const pageContainers = workspace.querySelectorAll(`.${styles.pdfPageContainer}`)

		pageContainers.forEach((container) => observer.observe(container))

		return () => {
			observer.disconnect()
		}
	}, [pdfDoc, numPages, currentPage])

	// Callback to cache page aspect ratios once calculated by the child PdfPage component
	const handleAspectRatioCalculated = useCallback((pageNum: number, ar: number) => {
		setPageAspectRatios((prev) => {
			if (prev[pageNum] === ar) {
				return prev
			}

			return { ...prev, [pageNum]: ar }
		})
	}, [])

	// Programmatically scroll the viewport container smoothly to a specific target page
	const scrollToPage = (pageNum: number) => {
		const workspace = workspaceRef.current

		if (!workspace) {
			return
		}

		const targetEl = workspace.querySelector(`[data-page-number="${pageNum}"]`)

		if (targetEl) {
			isScrollingRef.current = true
			setCurrentPage(pageNum)

			targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' })

			// Disable observer updates briefly to allow the smooth scroll animation to finish
			setTimeout(() => {
				isScrollingRef.current = false
			}, 800)
		}
	}

	return (
		<div className={styles.pdfViewerContainer}>
			{/* Sticky Top Toolbar with standard Controls */}
			<div className={styles.pdfToolbar}>
				<div className={styles.pdfToolbarSection}>
					<button
						type="button"
						className={styles.pdfBtn}
						onClick={() => scrollToPage(Math.max(currentPage - 1, 1))}
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
						onClick={() => scrollToPage(Math.min(currentPage + 1, numPages))}
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

				{/* Zoom Control Buttons */}
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

			{/* Main Scrollable Workspace containing all virtualized pages */}
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
					<>
						{Array.from({ length: numPages }, (_, index) => {
							const pageNum = index + 1
							// Check if page falls inside the active virtualization threshold window (±3)
							const isInsideThreshold = Math.abs(pageNum - currentPage) <= 3

							// Compute precise placeholder geometries to ensure zero scroll jumping
							const ar = pageAspectRatios[pageNum] || fallbackAspectRatio
							// Padding is already subtracted from contentRect by ResizeObserver
							const paddingX = 0
							const paddingY = 0
							const availWidth = Math.max(workspaceWidth - paddingX - 4, 200)
							const availHeight = Math.max(workspaceHeight - paddingY - 4, 200)
							const baseDisplayWidth = Math.min(availWidth, availHeight * ar)
							const displayWidth = baseDisplayWidth * scale
							const displayHeight = displayWidth / ar

							return (
								<div
									key={pageNum}
									data-page-number={pageNum}
									className={`${styles.pdfPageContainer} ${!isInsideThreshold ? styles.pdfPageLoading : ''}`}
									style={{
										width: `${displayWidth}px`,
										height: `${displayHeight}px`,
										aspectRatio: `${ar}`,
									}}>
									{isInsideThreshold && (
										<PdfPage
											pageNumber={pageNum}
											pdfDoc={pdfDoc}
											scale={scale}
											workspaceWidth={workspaceWidth}
											workspaceHeight={workspaceHeight}
											onAspectRatioCalculated={handleAspectRatioCalculated}
										/>
									)}
								</div>
							)
						})}
					</>
				)}
			</div>
		</div>
	)
}
