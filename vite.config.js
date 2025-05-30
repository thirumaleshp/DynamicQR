const { defineConfig } = require('vite')
const react = require('@vitejs/plugin-react')
const path = require('path')

module.exports = defineConfig({
	plugins: [react()],
	build: {
		outDir: 'dist',
		target: 'esnext',
		sourcemap: false
	}
})
