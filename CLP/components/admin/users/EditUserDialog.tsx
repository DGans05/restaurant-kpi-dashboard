'use client'

/**
 * Edit User Dialog Component
 *
 * Updates user profile details. Manages restaurant access with add/remove.
 */

import { useEffect, useState } from 'react'
import { UserProfile, Restaurant, UserRole } from '@/lib/types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Plus, Trash2 } from 'lucide-react'

interface RestaurantAccess {
  restaurantId: string
  role: UserRole
}

interface EditUserDialogProps {
  user: UserProfile
  restaurants: Restaurant[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onUserUpdated: (user: UserProfile) => void
}

export function EditUserDialog({
  user,
  restaurants,
  open,
  onOpenChange,
  onUserUpdated,
}: EditUserDialogProps) {
  const [displayName, setDisplayName] = useState(user.displayName || '')
  const [isAdmin, setIsAdmin] = useState(user.isAdmin)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Restaurant access state
  const [accessList, setAccessList] = useState<RestaurantAccess[]>([])
  const [accessLoading, setAccessLoading] = useState(false)
  const [addRestaurantId, setAddRestaurantId] = useState('')
  const [addRole, setAddRole] = useState<UserRole>('viewer')
  const [addingRestaurant, setAddingRestaurant] = useState(false)

  // Load current restaurant access on open
  useEffect(() => {
    if (!open) return
    setAccessLoading(true)
    fetch(`/api/admin/users/${user.userId}/restaurants`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setAccessList(
            (json.data as UserProfile[]).map((p) => ({
              restaurantId: p.restaurantId,
              role: p.role,
            }))
          )
        }
      })
      .catch(() => {/* non-blocking */})
      .finally(() => setAccessLoading(false))
  }, [open, user.userId])

  const assignedRestaurantIds = new Set(accessList.map((a) => a.restaurantId))
  const availableToAdd = restaurants.filter((r) => !assignedRestaurantIds.has(r.id))

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: displayName || null,
          isAdmin,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update user')
      }

      const { data } = await response.json()
      onUserUpdated(data)
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user')
    } finally {
      setLoading(false)
    }
  }

  const handleAddRestaurant = async () => {
    if (!addRestaurantId) return
    setAddingRestaurant(true)
    setError(null)

    try {
      const res = await fetch(`/api/admin/users/${user.userId}/restaurants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restaurantId: addRestaurantId, role: addRole }),
      })

      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || 'Failed to add restaurant')
      }

      setAccessList([...accessList, { restaurantId: addRestaurantId, role: addRole }])
      setAddRestaurantId('')
      setAddRole('viewer')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add restaurant')
    } finally {
      setAddingRestaurant(false)
    }
  }

  const handleRemoveRestaurant = async (restaurantId: string) => {
    setError(null)
    try {
      const res = await fetch(
        `/api/admin/users/${user.userId}/restaurants/${restaurantId}`,
        { method: 'DELETE' }
      )

      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || 'Failed to remove restaurant')
      }

      setAccessList(accessList.filter((a) => a.restaurantId !== restaurantId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove restaurant')
    }
  }

  const getRestaurantName = (id: string) =>
    restaurants.find((r) => r.id === id)?.name ?? id

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px]">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update profile and manage restaurant access
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSaveProfile}>
          <div className="space-y-5 py-4">
            {error && (
              <div className="bg-destructive/10 text-destructive px-3 py-2 rounded-md text-sm">
                {error}
              </div>
            )}

            {/* Display name */}
            <div className="space-y-2">
              <Label htmlFor="edit-displayName">Display Name</Label>
              <Input
                id="edit-displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="John Doe"
              />
            </div>

            {/* Admin checkbox */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit-isAdmin"
                checked={isAdmin}
                onCheckedChange={(checked) => setIsAdmin(checked === true)}
              />
              <Label
                htmlFor="edit-isAdmin"
                className="text-sm font-medium leading-none"
              >
                System Administrator (full access)
              </Label>
            </div>

            {/* Restaurant access */}
            <div className="space-y-3">
              <Label>Restaurant Access</Label>

              {accessLoading ? (
                <p className="text-xs text-muted-foreground">Loading…</p>
              ) : (
                <>
                  {/* Current access list */}
                  {accessList.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">
                      No restaurants assigned yet
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {accessList.map((access) => (
                        <div
                          key={access.restaurantId}
                          className="flex items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-2"
                        >
                          <span className="flex-1 text-sm font-medium text-foreground">
                            {getRestaurantName(access.restaurantId)}
                          </span>
                          <span className="text-xs text-muted-foreground capitalize">
                            {access.role}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveRestaurant(access.restaurantId)}
                            className="text-muted-foreground hover:text-destructive transition-colors"
                            title="Remove access"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add new restaurant */}
                  {availableToAdd.length > 0 && (
                    <div className="flex items-center gap-2 pt-1">
                      <Select
                        value={addRestaurantId}
                        onValueChange={setAddRestaurantId}
                      >
                        <SelectTrigger className="flex-1 h-8 text-xs">
                          <SelectValue placeholder="Add restaurant…" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableToAdd.map((r) => (
                            <SelectItem key={r.id} value={r.id}>
                              {r.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select
                        value={addRole}
                        onValueChange={(v) => setAddRole(v as UserRole)}
                      >
                        <SelectTrigger className="w-28 h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="owner">Owner</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="viewer">Viewer</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        className="h-8 px-2"
                        disabled={!addRestaurantId || addingRestaurant}
                        onClick={handleAddRestaurant}
                      >
                        <Plus className="size-3.5" />
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving…' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
