'use client'

/**
 * Restaurants Management Client Component
 *
 * Main orchestrator for restaurant management UI.
 */

import { useState } from 'react'
import { Restaurant } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Building2, Plus, Search } from 'lucide-react'
import { RestaurantGrid } from './RestaurantGrid'
import { CreateRestaurantDialog } from './CreateRestaurantDialog'

interface RestaurantsClientProps {
  restaurants: Restaurant[]
}

export function RestaurantsClient({ restaurants: initialRestaurants }: RestaurantsClientProps) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>(initialRestaurants)
  const [searchQuery, setSearchQuery] = useState('')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  // Filter restaurants by search query
  const filteredRestaurants = restaurants.filter((restaurant) => {
    const query = searchQuery.toLowerCase()
    return restaurant.name.toLowerCase().includes(query)
  })

  const handleRestaurantCreated = (newRestaurant: Restaurant) => {
    setRestaurants([newRestaurant, ...restaurants])
    setCreateDialogOpen(false)
  }

  const handleRestaurantUpdated = (updatedRestaurant: Restaurant) => {
    setRestaurants(
      restaurants.map((r) => (r.id === updatedRestaurant.id ? updatedRestaurant : r))
    )
  }

  const handleRestaurantDeleted = (restaurantId: string) => {
    setRestaurants(restaurants.filter((r) => r.id !== restaurantId))
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Restaurant Management</h2>
          <p className="text-sm text-muted-foreground">
            Add, edit, and manage restaurants
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Restaurant
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search restaurants..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Stats */}
      <div className="flex gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Building2 className="w-4 h-4" />
          <span>
            {filteredRestaurants.length} restaurant
            {filteredRestaurants.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Restaurant Grid */}
      <RestaurantGrid
        restaurants={filteredRestaurants}
        onRestaurantUpdated={handleRestaurantUpdated}
        onRestaurantDeleted={handleRestaurantDeleted}
      />

      {/* Create Restaurant Dialog */}
      <CreateRestaurantDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onRestaurantCreated={handleRestaurantCreated}
      />
    </div>
  )
}
