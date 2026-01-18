
import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

export type Category = {
    id: string
    name: string
    color: string
}

export function useCategories() {
    const [categories, setCategories] = useState<Category[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const supabase = createClient()

    const fetchCategories = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: true })

            if (error) throw error

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

    return {
        categories,
        isLoading,
        addCategory,
    }
}
