import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/index-simple')({
  component: Index,
})

function Index() {
  // Git commit hash from build-time environment variable
  let gitCommit = '1510dfc-hardcoded'
  try {
    gitCommit = __GIT_COMMIT_HASH__
    console.log('Successfully got git commit from define:', gitCommit)
  } catch (e) {
    console.log('__GIT_COMMIT_HASH__ not available, using fallback')
  }
  
  console.log('Final git commit value:', gitCommit)
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Simple Test Page
        </h1>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">
            Git Commit Hash Test
          </h2>
          
          <p className="text-gray-600 mb-4">
            This is a simple test page to verify that the git commit hash can be included in the build.
          </p>
          
          <div className="bg-blue-50 p-4 rounded border">
            <p className="font-mono text-sm">
              Git commit: {gitCommit}
            </p>
          </div>
        </div>
        
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Powered by Marp CLI and Pandoc • Built with React and Express • Git: {gitCommit} • {new Date().toISOString()}</p>
        </div>
      </div>
    </div>
  )
}