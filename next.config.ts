import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
	compiler: {
		...(process.env.NODE_ENV === 'production'
			? {
					removeConsole: {
						exclude: ['error', 'warn', 'info', 'table'],
					},
				}
			: {}),
		...(process.env.NODE_ENV === 'production' ? { reactRemoveProperties: { properties: ['^data-testid$'] } } : {}),
	},
	cacheComponents: true,
	pageExtensions: ['ts', 'tsx'],
	poweredByHeader: false,
	typescript: {
		ignoreBuildErrors: true,
		tsconfigPath: 'tsconfig.json',
	},
	reactStrictMode: false, // I prefer to set to false to prevent double rendering.
	productionBrowserSourceMaps: false,
	trailingSlash: false,
	turbopack: {
		resolveExtensions: ['.mdx', '.tsx', '.ts', '.jsx', '.js', '.mjs', '.json'],
	},
	typedRoutes: true,
	experimental: {
		serverSourceMaps: false,
	},
}

export default nextConfig
