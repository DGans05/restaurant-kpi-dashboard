'use client'

/**
 * Users Management Client Component
 *
 * Main orchestrator for user management UI.
 * Handles state management and coordinates child components.
 */

import { useState } from 'react'
import { UserProfile, Restaurant } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { UserPlus, Search } from 'lucide-react'
import { UserTable } from './UserTable'
import { CreateUserDialog } from './CreateUserDialog'

interface UsersClientProps {
  users: UserProfile[]
  restaurants: Restaurant[]
}

export function UsersClient({ users: initialUsers, restaurants }: UsersClientProps) {
  const [users, setUsers] = useState<UserProfile[]>(initialUsers)
  const [searchQuery, setSearchQuery] = useState('')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  // Filter users by search query
  const filteredUsers = users.filter((user) => {
    const query = searchQuery.toLowerCase()
    return (
      user.displayName?.toLowerCase().includes(query) ||
      user.role.toLowerCase().includes(query) ||
      user.restaurantId.toLowerCase().includes(query)
    )
  })

  const handleUserCreated = (newUser: UserProfile) => {
    setUsers([newUser, ...users])
    setCreateDialogOpen(false)
  }

  const handleUserUpdated = (updatedUser: UserProfile) => {
    setUsers(users.map((u) => (u.id === updatedUser.id ? updatedUser : u)))
  }

  const handleUserDeleted = (userId: string) => {
    setUsers(users.filter((u) => u.userId !== userId))
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">User Management</h2>
          <p className="text-sm text-muted-foreground">
            Manage user accounts and permissions
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <UserPlus className="w-4 h-4 mr-2" />
          Create User
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* User Table */}
      <UserTable
        users={filteredUsers}
        restaurants={restaurants}
        onUserUpdated={handleUserUpdated}
        onUserDeleted={handleUserDeleted}
      />

      {/* Create User Dialog */}
      <CreateUserDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        restaurants={restaurants}
        onUserCreated={handleUserCreated}
      />
    </div>
  )
}
