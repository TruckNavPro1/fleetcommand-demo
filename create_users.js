import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://otqxvohefseqqirhruru.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90cXh2b2hlZnNlcXFpcmhydXJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5MDA5OTksImV4cCI6MjA4ODQ3Njk5OX0.G_F_i9Vo-6fAZx1Aox6QTyJKyE7027LChQ8l0p5pT7M'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function createUsers() {
    console.log("Creating Test Mechanic...")
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email: 'mechanic@fleetcommand.com',
        password: 'password123',
    })

    if (authError && authError.message !== 'User already registered') {
        console.error("Auth Error:", authError.message)
    } else {
        const id = authData?.user?.id || (await supabase.auth.signInWithPassword({ email: 'mechanic@fleetcommand.com', password: 'password123' })).data?.user?.id
        console.log("Auth ID:", id)

        if (id) {
            const { error: profileError } = await supabase
                .from('profiles')
                .update({ role: 'mechanic', full_name: 'Test Mechanic' })
                .eq('id', id)

            if (profileError) {
                await supabase.from('profiles').insert([{ id: id, role: 'mechanic', full_name: 'Test Mechanic' }])
            }
            console.log("Profile updated/inserted for Mechanic")
        }
    }

    console.log("Creating Test Office...")
    const { data: officeData, error: officeError } = await supabase.auth.signUp({
        email: 'office@fleetcommand.com',
        password: 'password123',
    })

    if (officeData?.user) {
        await supabase.from('profiles').update({ role: 'office', full_name: 'Test Office' }).eq('id', officeData.user.id)
        if (officeError) {
            await supabase.from('profiles').insert([{ id: officeData.user.id, role: 'office', full_name: 'Test Office' }])
        }
    }

    console.log("Done.")
}

createUsers()
