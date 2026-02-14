'use client'

/**
 * User Table Component
 *
 * Displays users in a table with edit and delete actions.
 */

import { useState } from 'react'
import { UserProfile, Restaurant } from '@/lib/types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Edit, Trash2, ShieldCheck } from 'lucide-react'
import { EditUserDialog } from './EditUserDialog'

interface UserTableProps {
  users: UserProfile[]
  restaurants: Restaurant[]
  onUserUpdated: (user: UserProfile) => void
  onUserDeleted: (userId: string) => void
}

export function UserTable({
  users,
  restaurants,
  onUserUpdated,
  onUserDeleted,
}: UserTableProps) {
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null)
  const [deletingUser, setDeletingUser] = useState<string | null>(null)

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) {
      return
    }

    setDeletingUser(userId)

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete user')
      }

      onUserDeleted(userId)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to delete user')
    } finally {
      setDeletingUser(null)
    }
  }

  const getRestaurantName = (restaurantId: string) => {
    return restaurants.find((r) => r.id === restaurantId)?.name || restaurantId
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'owner':
        return 'default'
      case 'manager':
        return 'secondary'
      case 'viewer':
        return 'outline'
      default:
        return 'outline'
    }
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <p className="text-muted-foreground">No users found</p>
      </div>
    )
  }

  return (
    <>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Display Name</TableHead>
              <TableHead>Restaurant</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {user.displayName || 'N/A'}
                    {user.isAdmin && (
                      <ShieldCheck className="w-4 h-4 text-primary" />
                    )}
                  </div>
                </TableCell>
                <TableCell>{getRestaurantName(user.restaurantId)}</TableCell>
                <TableCell>
                  <Badge variant={getRoleBadgeVariant(user.role)}>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  {user.deletedAt ? (
                    <Badge variant="destructive">Deleted</Badge>
                  ) : (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Active
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(user.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingUser(user)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(user.userId)}
                      disabled={deletingUser === user.userId}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {editingUser && (
        <EditUserDialog
          user={editingUser}
          restaurants={restaurants}
          open={!!editingUser}
          onOpenChange={(open) => !open && setEditingUser(null)}
          onUserUpdated={onUserUpdated}
        />
      )}
    </>
  )
}
