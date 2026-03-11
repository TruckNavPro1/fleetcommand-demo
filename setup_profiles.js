import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://otqxvohefseqqirhruru.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90cXh2b2hlZnNlcXFpcmhydXJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5MDA5OTksImV4cCI6MjA4ODQ3Njk5OX0.G_F_i9Vo-6fAZx1Aox6QTyJKyE7027LChQ8l0p5pT7M'
const supabase = createClient(supabaseUrl, supabaseKey)

async function run() {
    console.log('Logging in as office...')
    const { data: oAuth, error: oAuthErr } = await supabase.auth.signInWithPassword({ email: 'office@fleetcommand.com', password: 'password123' })
    if (oAuthErr) { console.error('Office Auth error:', oAuthErr.message); return; }

    // We cannot easily fetch the org because of RLS: 'Users view own organization'
    // But we know 'user_organization_id()' uses profiles, which we don't have yet.
    // So we're in a chicken-and-egg problem. We MUST be assigned an org ID.
    // If we insert a profile with no org_id, RLS might allow it (since check is id=id).

    // Let's try inserting the profile without an org, then getting an org.
    const oProf = { id: oAuth.user.id, full_name: 'Test Office', role: 'office', title: 'Admin' }
    const { error: oErr } = await supabase.from('profiles').upsert(oProf)
    console.log('Office profile insert result:', oErr ? oErr.message : 'Success')

    console.log('Logging in as mechanic...')
    const { data: mAuth, error: mAuthErr } = await supabase.auth.signInWithPassword({ email: 'mechanic@fleetcommand.com', password: 'password123' })
    if (mAuthErr) { console.error('Mechanic Auth error:', mAuthErr.message); return; }

    const mProf = { id: mAuth.user.id, full_name: 'Test Mechanic', role: 'mechanic', title: 'Mechanic' }
    const { error: mErr } = await supabase.from('profiles').upsert(mProf)
    console.log('Mechanic profile insert result:', mErr ? mErr.message : 'Success')
}
run()
