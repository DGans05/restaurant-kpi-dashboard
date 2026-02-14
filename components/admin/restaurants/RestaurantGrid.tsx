'use client'

/**
 * Restaurant Grid Component
 *
 * Displays restaurants in a grid with edit and delete actions.
 */

import { useState } from 'react'
import { Restaurant } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Building2, Edit, Trash2 } from 'lucide-react'
import { EditRestaurantDialog } from './EditRestaurantDialog'

interface RestaurantGridProps {
  restaurants: Restaurant[]
  onRestaurantUpdated: (restaurant: Restaurant) => void
  onRestaurantDeleted: (restaurantId: string) => void
}

export function RestaurantGrid({
  restaurants,
  onRestaurantUpdated,
  onRestaurantDeleted,
}: RestaurantGridProps) {
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (restaurant: Restaurant) => {
    if (!confirm(`Are you sure you want to delete "${restaurant.name}"?`)) {
      return
    }

    setDeletingId(restaurant.id)

    try {
      const response = await fetch(`/api/admin/restaurants/${restaurant.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete restaurant')
      }

      onRestaurantDeleted(restaurant.id)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to delete restaurant')
    } finally {
      setDeletingId(null)
    }
  }

  if (restaurants.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <Building2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">No restaurants found</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {restaurants.map((restaurant) => (
          <Card key={restaurant.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <CardTitle className="text-base">{restaurant.name}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {restaurant.createdAt && (
                    <p>Added {new Date(restaurant.createdAt).toLocaleDateString()}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingRestaurant(restaurant)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(restaurant)}
                    disabled={deletingId === restaurant.id}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {editingRestaurant && (
        <EditRestaurantDialog
          restaurant={editingRestaurant}
          open={!!editingRestaurant}
          onOpenChange={(open) => !open && setEditingRestaurant(null)}
          onRestaurantUpdated={onRestaurantUpdated}
        />
      )}
    </>
  )
}
