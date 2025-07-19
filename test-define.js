import { execSync } from 'child_process'

const gitCommitHash = execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim()
console.log('Git commit hash from script:', gitCommitHash)
console.log('Define config would be:', JSON.stringify(gitCommitHash))