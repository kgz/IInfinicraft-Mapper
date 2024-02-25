import eslintPlugin from '@nabla/vite-plugin-eslint'
import basicSsl from '@vitejs/plugin-basic-ssl'
import react from '@vitejs/plugin-react'
import fs from 'fs';
import path, { resolve } from 'path';
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig, loadEnv } from 'vite'
import babelDev from 'vite-plugin-babel-dev';
import checker from 'vite-plugin-checker'

const outputConfig = {
	entryFileNames: 'index.min.js',
	chunkFileNames: 'index-[hash].js',
	assetFileNames: 'index.min.[ext]',
}
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;



// https://vitejs.dev/config/
const config = ({ mode }) => {
	const env = loadEnv(mode, process.cwd())
	const outputs = [env.VITE_OUTPUT_DIR]

	return defineConfig({
		plugins: [
            basicSsl(),

			react({
				babel: {
					plugins: [
						["@babel/plugin-proposal-decorators", { legacy: true }],
						[
							"@babel/plugin-proposal-class-properties",
							{ loose: true },
						],
					],
				},
			}),
			eslintPlugin({}),
			checker({
				typescript: true,
				eslint: {
					lintCommand: 'eslint "./src/**/*.{ts,tsx}"',
				},
			}),
			visualizer({
				filename: './.stats/treemap.html',
				template: 'treemap',
				sourcemap: true
			}),
			visualizer({
				filename: './.stats/sunburst.html',
				template: 'sunburst',
				sourcemap: true
			}),
			visualizer({
				filename: './.stats/network.html',
				template: 'network',
				sourcemap: true
			}),
			visualizer({
				filename: './.stats/raw-data.json',
				template: 'raw-data',
				sourcemap: true
			}),
			visualizer({
				filename: './.stats/list.yml',
				template: 'list',
				sourcemap: true
			})
		],
		build: {
			rollupOptions: {
				external: ['moment-timezone'],
				input: {
					main: env.VITE_ENTRYPOINT,
				},
				output: outputs.map(output => ({
					...outputConfig,
					dir: './' + output
				}))
			},
			outDir: './dist',
			sourcemap: true,
			emptyOutDir: true,
		},
		server: {
			host: env.VITE_HOST,
			https: {
                key: env.VITE_HTTPS_KEY,
                cert: env.VITE_HTTPS_CERT,
            },
			port: Number(env.VITE_PORT),
            hmr: {
                host: 'localhost'
            },
		},
		resolve: {
			alias: [
				{ find: '@s', replacement: path.resolve(__dirname, 'src/@styles') },
				{ find: '@t', replacement: path.resolve(__dirname, 'src/@types') },
				{ find: '@a', replacement: path.resolve(__dirname, 'src/@assets') },
			]
		}
	}
	)

}

export default config