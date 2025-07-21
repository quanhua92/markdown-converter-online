import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { Toaster } from "sonner"
import { MigrationDialog } from '../components/shared/MigrationDialog'
import { useMigration } from '../components/shared/useMigration'

function RootComponent() {
  const { showDialog, handleMigrationComplete } = useMigration()
  
  return (
    <>
      <Outlet />
      <Toaster />
      <TanStackRouterDevtools />
      <MigrationDialog 
        isOpen={showDialog} 
        onComplete={handleMigrationComplete}
      />
    </>
  )
}

export const Route = createRootRoute({
  component: RootComponent,
})
