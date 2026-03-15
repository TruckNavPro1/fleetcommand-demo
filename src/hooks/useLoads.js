/**
 * useLoads — live loads with Supabase Realtime
 *
 * Fetches all loads for the current user's organization and subscribes
 * to INSERT / UPDATE / DELETE events so every client updates instantly
 * when office staff dispatch, reassign, or cancel a load.
 *
 * Usage:
 *   const { loads, loading, error } = useLoads()
 */
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../services/supabase'
import { useAuth } from '../context/AuthContext'

export function useLoads() {
    const { user } = useAuth()
    const [loads, setLoads] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const fetchLoads = useCallback(async () => {
        if (!user?.organization_id) return
        try {
            const { data, error } = await supabase
                .from('loads')
                .select('*')
                .eq('organization_id', user.organization_id)
                .order('created_at', { ascending: false })
                .limit(50)
            if (error) throw error
            setLoads(data ?? [])
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [user?.organization_id])

    useEffect(() => {
        if (!user?.organization_id) {
            setLoading(false)
            return
        }

        fetchLoads()

        // Realtime: any change to loads in this org refreshes the list
        const channel = supabase
            .channel(`loads:org:${user.organization_id}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'loads',
                    filter: `organization_id=eq.${user.organization_id}`,
                },
                () => fetchLoads()
            )
            .subscribe()

        return () => supabase.removeChannel(channel)
    }, [fetchLoads, user?.organization_id])

    return { loads, loading, error, refresh: fetchLoads }
}
