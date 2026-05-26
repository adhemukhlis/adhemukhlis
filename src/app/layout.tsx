import { Rubik } from 'next/font/google'

import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'

import '@/styles/global.css'

const nextFont = Rubik({
	style: ['normal', 'italic'],
	weight: ['300', '400', '500', '600', '700', '800', '900'],
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-family',
	adjustFontFallback: false,
})

export const metadata: Metadata = {
	title: 'Mukhlis Adhe Purwanto',
	description: '🥳',
}

export const viewport: Viewport = {
	themeColor: '#FAFAFA',
}

const RootLayout = ({
	children,
}: Readonly<{
	children: ReactNode
}>) => {
	return (
		<html lang="en">
			<body className={`${nextFont.variable}`}>{children}</body>
		</html>
	)
}

export default RootLayout
