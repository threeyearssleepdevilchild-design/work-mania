
import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

export type Category = {
    id: string
    name: string
    color: string
    is_archived: boolean
}

export function useCategories() {
    const [categories, setCategories] = useState<Category[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const supabase = createClient()

    const fetchCategories = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // First try: Fetch with is_archived support
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .eq('user_id', user.id)
                .order('is_archived', { ascending: true }) // Active first
                .order('created_at', { ascending: true })

            if (error) {
                // Feature detection: If error is related to missing column (Postgres code 42703 or 400), try fallback
                if (error.code === '42703' || error.code === 'PGRST100' || error.code === '400') {
                    console.warn('Backend schema mismatch detected, falling back to legacy query.');
                    const { data: fallbackData, error: fallbackError } = await supabase
                        .from('categories')
                        .select('*')
                        .eq('user_id', user.id)
                        .order('created_at', { ascending: true })

                    if (fallbackError) throw fallbackError
                    setCategories(fallbackData || [])
                    return;
                }
                throw error
            }

            setCategories(data || [])
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
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error("No user")

            const { data, error } = await supabase
                .from('categories')
                .insert({
                    user_id: user.id,
                    name,
                    color,
                })
                .select()
                .single()

            if (error) throw error

            setCategories(prev => [...prev, data])
            return data
        } catch (error) {
            console.error('Error adding category:', error)
        }
    }

    const deleteCategory = async (id: string) => {
        try {
            const { error } = await supabase
                .from('categories')
                .delete()
                .eq('id', id)

            if (error) throw error

            setCategories(prev => prev.filter(c => c.id !== id))
            return { success: true }
        } catch (error) {
            console.error('Error deleting category:', error)
            return { success: false, error }
        }
    }

    const toggleArchiveCategory = async (id: string, isArchived: boolean) => {
        try {
            const { error } = await supabase
                .from('categories')
                .update({ is_archived: isArchived })
                .eq('id', id)

            if (error) throw error

            setCategories(prev => prev.map(c =>
                c.id === id ? { ...c, is_archived: isArchived } : c
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
