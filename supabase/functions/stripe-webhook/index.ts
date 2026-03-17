import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const stripe = Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
    httpClient: Stripe.createFetchHttpClient(),
})

const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || ''

const supabase = createClient(supabaseUrl, supabaseServiceKey)

serve(async (req) => {
    // Get the signature sent by Stripe
    const signature = req.headers.get('stripe-signature')

    if (!signature) {
        return new Response('No signature', { status: 400 })
    }

    try {
        const body = await req.text()
        const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)

        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object
                const organizationId = session.client_reference_id

                if (organizationId) {
                    await handleSubscriptionActivated(organizationId, session.subscription)
                }
                break;
            }
            case 'customer.subscription.deleted': {
                const subscription = event.data.object
                // Here we would typically look up the org by customer_id
                console.log('Subscription canceled:', subscription.id)
                break;
            }
        }

        return new Response(JSON.stringify({ received: true }), { status: 200 })
    } catch (err) {
        console.error(`Webhook Error: ${err.message}`)
        return new Response(`Webhook Error: ${err.message}`, { status: 400 })
    }
})

// Helper to update the organization's plan in Supabase
async function handleSubscriptionActivated(organizationId: string, subscriptionId: string | null) {
    console.log(`Upgrading Organization ${organizationId} to PRO. Subscription: ${subscriptionId}`)

    // Example: You would add a `subscription_tier` and `stripe_customer_id` column to your organizations table
    // For now, this is a placeholder logger.

    /* 
    const { error } = await supabase
        .from('organizations')
        .update({ 
            subscription_tier: 'pro',
            stripe_subscription_id: subscriptionId 
        })
        .eq('id', organizationId)
        
    if (error) throw error
    */
}
