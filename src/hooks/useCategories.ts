import { useState, useEffect } from 'react'

export type Category = {
    id: string
    name: string
    color: string
    isArchived: boolean
}

export function useCategories() {
    const [categories, setCategories] = useState<Category[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/categories')
            if (!res.ok) return

            const data = await res.json()
            // Map snake_case from API to camelCase for frontend
            const mapped = data.map((cat: Record<string, unknown>) => ({
                id: cat.id,
                name: cat.name,
                color: cat.color,
                isArchived: cat.isArchived ?? false,
            }))
            setCategories(mapped)
        } catch (error) {
            console.error('Error fetching categories:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchCategories()
    }, [])

    const addCategory = async (name: string, color: string) => {
        try {
            const res = await fetch('/api/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, color }),
            })

            if (!res.ok) throw new Error('Failed to add category')

            const data = await res.json()
            const newCat: Category = {
                id: data.id,
                name: data.name,
                color: data.color,
                isArchived: data.isArchived ?? false,
            }
            setCategories(prev => [...prev, newCat])
            return newCat
        } catch (error) {
            console.error('Error adding category:', error)
        }
    }

    const deleteCategory = async (id: string) => {
        try {
            const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' })

            if (!res.ok) {
                return { success: false, error: 'Delete failed' }
            }

            setCategories(prev => prev.filter(c => c.id !== id))
            return { success: true }
        } catch (error) {
            console.error('Error deleting category:', error)
            return { success: false, error }
        }
    }

    const toggleArchiveCategory = async (id: string, isArchived: boolean) => {
        try {
            const res = await fetch(`/api/categories/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isArchived }),
            })

            if (!res.ok) throw new Error('Update failed')

            setCategories(prev => prev.map(c =>
                c.id === id ? { ...c, isArchived } : c
            ))
            return { success: true }
        } catch (error) {
            console.error('Error toggling archive status:', error)
            return { success: false, error }
        }
    }

    return {
        categories,
        isLoading,
        addCategory,
        deleteCategory,
        toggleArchiveCategory,
    }
}
