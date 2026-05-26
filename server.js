const { execSync } = require('child_process')
const { readFileSync, existsSync } = require('fs')

const vars = {}

if (existsSync('.env')) {
	const env = readFileSync('.env', 'utf-8')
	env.split('\n').forEach((line) => {
		const [key, ...rest] = line.split('=')
		const value = rest.join('=')
		if (key?.trim() && value?.trim()) {
			vars[key.trim()] = value.trim()
		}
	})
}

const port = vars.PORT || 3000

const mode = process.argv[2] || 'dev'

const commands = {
	dev: `next dev -p ${port}`,
	'dev-https': `next dev -p ${port} --experimental-https`,
	start: `next start -p ${port}`,
}

if (!commands[mode]) {
	console.error(`❌ Unknown mode: "${mode}"`)
	console.error(`   Available: ${Object.keys(commands).join(', ')}`)
	process.exit(1)
}

console.info(`🚀 Running: ${commands[mode]}`)

execSync(commands[mode], {
	stdio: 'inherit',
	env: { ...process.env, ...vars },
})
