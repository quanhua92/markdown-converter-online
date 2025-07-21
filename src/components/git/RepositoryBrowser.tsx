import React, { useState, useEffect } from 'react'
import { useGitHubAPI } from '../../auth/useGitHubAuth'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from '../ui/dialog'
import { 
  Github, 
  Search, 
  Star, 
  GitFork, 
  Lock, 
  Globe, 
  Calendar,
  Loader2,
  AlertCircle,
  ChevronRight,
  GitBranch
} from 'lucide-react'
import type { GitRepository, GitBranch } from '../../types/git'

interface RepositoryBrowserProps {
  isOpen: boolean
  onClose: () => void
  onSelectRepository: (repository: GitRepository, branch: string) => void
}

export function RepositoryBrowser({ isOpen, onClose, onSelectRepository }: RepositoryBrowserProps) {
  const github = useGitHubAPI()
  
  const [repositories, setRepositories] = useState<GitRepository[]>([])
  const [branches, setBranches] = useState<GitBranch[]>([])
  const [selectedRepo, setSelectedRepo] = useState<GitRepository | null>(null)
  const [selectedBranch, setSelectedBranch] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingBranches, setIsLoadingBranches] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  // Load repositories on open
  useEffect(() => {
    if (isOpen) {
      loadRepositories()
    }
  }, [isOpen])

  const loadRepositories = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const repos = await github.listRepositories({
        sort: 'updated',
        direction: 'desc',
        per_page: 30,
        page: currentPage
      })
      
      setRepositories(repos)
    } catch (error) {
      console.error('Failed to load repositories:', error)
      setError(error instanceof Error ? error.message : 'Failed to load repositories')
    } finally {
      setIsLoading(false)
    }
  }

  const loadBranches = async (repo: GitRepository) => {
    try {
      setIsLoadingBranches(true)
      
      const repoBranches = await github.listBranches(repo.owner.login, repo.name)
      setBranches(repoBranches)
      setSelectedBranch(repo.default_branch)
    } catch (error) {
      console.error('Failed to load branches:', error)
      setBranches([])
      setSelectedBranch('')
    } finally {
      setIsLoadingBranches(false)
    }
  }

  const handleSelectRepository = (repo: GitRepository) => {
    setSelectedRepo(repo)
    loadBranches(repo)
  }

  const handleCreateWorkspace = () => {
    if (selectedRepo && selectedBranch) {
      onSelectRepository(selectedRepo, selectedBranch)
      onClose()
    }
  }

  const filteredRepositories = repositories.filter(repo =>
    repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    repo.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Github className="h-5 w-5" />
            Connect to GitHub Repository
          </DialogTitle>
          <DialogDescription>
            Select a repository and branch to create a Git workspace
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex gap-4 min-h-0">
          {/* Repository List */}
          <div className="flex-1 flex flex-col min-h-0">
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search repositories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Repository List */}
            <div className="flex-1 overflow-y-auto space-y-2">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : error ? (
                <div className="flex items-center justify-center py-8 text-red-600">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  {error}
                </div>
              ) : filteredRepositories.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Github className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No repositories found</p>
                  {searchQuery && (
                    <p className="text-sm">Try a different search term</p>
                  )}
                </div>
              ) : (
                filteredRepositories.map((repo) => (
                  <Card
                    key={repo.id}
                    className={`cursor-pointer transition-all ${
                      selectedRepo?.id === repo.id
                        ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                    onClick={() => handleSelectRepository(repo)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {repo.private ? (
                              <Lock className="h-4 w-4 text-gray-500" />
                            ) : (
                              <Globe className="h-4 w-4 text-green-600" />
                            )}
                            <h3 className="font-medium truncate">{repo.name}</h3>
                            {selectedRepo?.id === repo.id && (
                              <ChevronRight className="h-4 w-4 text-blue-600" />
                            )}
                          </div>
                          
                          {repo.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                              {repo.description}
                            </p>
                          )}
                          
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Updated {formatDate(repo.updated_at || repo.created_at || '')}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {repo.default_branch}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Load More */}
            {!isLoading && filteredRepositories.length >= 30 && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setCurrentPage(prev => prev + 1)
                  loadRepositories()
                }}
                className="mt-4"
              >
                Load More
              </Button>
            )}
          </div>

          {/* Repository Details & Branch Selection */}
          {selectedRepo && (
            <div className="w-80 border-l pl-4 flex flex-col">
              <div className="mb-4">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Github className="h-4 w-4" />
                  {selectedRepo.name}
                </h3>
                
                {selectedRepo.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {selectedRepo.description}
                  </p>
                )}

                <div className="flex items-center gap-2 mb-3">
                  {selectedRepo.private ? (
                    <Badge variant="secondary" className="gap-1">
                      <Lock className="h-3 w-3" />
                      Private
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="gap-1">
                      <Globe className="h-3 w-3" />
                      Public
                    </Badge>
                  )}
                </div>
              </div>

              {/* Branch Selection */}
              <div className="flex-1">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <GitBranch className="h-4 w-4" />
                  Select Branch
                </h4>
                
                {isLoadingBranches ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {branches.map((branch) => (
                      <div
                        key={branch.name}
                        className={`p-2 rounded border cursor-pointer transition-colors ${
                          selectedBranch === branch.name
                            ? 'bg-blue-100 border-blue-300 dark:bg-blue-900/30 dark:border-blue-700'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                        onClick={() => setSelectedBranch(branch.name)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{branch.name}</span>
                          {branch.name === selectedRepo.default_branch && (
                            <Badge variant="secondary" className="text-xs">
                              default
                            </Badge>
                          )}
                          {branch.protected && (
                            <Badge variant="outline" className="text-xs">
                              protected
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Create Workspace Button */}
              <div className="mt-4 pt-4 border-t">
                <Button
                  onClick={handleCreateWorkspace}
                  disabled={!selectedRepo || !selectedBranch || isLoadingBranches}
                  className="w-full gap-2"
                >
                  <GitBranch className="h-4 w-4" />
                  Create Git Workspace
                </Button>
                
                {selectedRepo && selectedBranch && (
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Will create workspace from {selectedRepo.name}:{selectedBranch}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}