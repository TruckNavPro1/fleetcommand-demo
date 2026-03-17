import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Check, Zap, Shield, CreditCard, Clock } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import { loadStripe } from '@stripe/stripe-js';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';
import { toast } from 'react-hot-toast';

// To be replaced with actual key in production
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

const TIERS = [
    {
        name: 'Starter',
        price: 'Free',
        description: 'For owner-operators just getting started.',
        features: [
            'Up to 3 vehicles',
            'Basic dispatch features',
            'Standard HOS tracking',
            'Community support'
        ],
        buttonText: 'Current Plan',
        isCurrent: true,
        action: 'null',
    },
    {
        name: 'Pro',
        price: '$199',
        period: '/mo',
        description: 'For growing fleets needing full visibility.',
        features: [
            'Up to 50 vehicles',
            'Live GPS Tracking (Samsara)',
            'Advanced Analytics',
            'Priority 24/7 Phone Support',
            'Unlimited User Roles'
        ],
        buttonText: 'Upgrade to Pro',
        isCurrent: false,
        action: 'upgrade_pro',
        highlight: true,
    }
];

export default function Billing() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);

    const handleUpgrade = async (action) => {
        if (action === 'null') return;

        setLoading(true);
        const toastId = toast.loading('Connecting to secure checkout...');

        try {
            // First, trigger the supersonic edge function to create a checkout session
            const { data, error } = await supabase.functions.invoke('create-checkout-session', {
                body: {
                    action,
                    organizationId: user?.organization_id,
                    returnUrl: window.location.origin + '/billing?success=true'
                }
            });

            if (error) {
                console.error("Stripe edge function error:", error);
                throw error;
            }

            if (data?.sessionId) {
                // Redirect to stripe checkout
                const stripe = await stripePromise;
                if (!stripe) throw new Error("Stripe failed to load");

                const { error: stripeError } = await stripe.redirectToCheckout({
                    sessionId: data.sessionId,
                });

                if (stripeError) {
                    console.error("Stripe Redirect Error:", stripeError);
                    throw stripeError;
                }
            } else {
                throw new Error("No session ID returned");
            }
        } catch (error) {
            console.error("Upgrade error:", error);
            // This is a graceful fallback since we know the edge function isn't deployed yet
            toast.error('Payment system currently in demo mode. Connect to a real Stripe account to continue.', { id: toastId, duration: 4000 });
        } finally {
            setLoading(false);
            toast.dismiss(toastId);
        }
    };

    return (
        <div style={{ maxWidth: 1000, margin: '0 auto', paddingBottom: 40 }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', background: 'rgba(59,142,243,0.1)', border: '1px solid rgba(59,142,243,0.3)', borderRadius: 20, color: 'var(--accent-blue)', fontSize: 13, fontWeight: 700, marginBottom: 16 }}>
                    <Zap size={14} /> FleetCommand Billing
                </div>
                <h1 style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 12 }}>
                    Upgrade your fleet operations
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: 15, maxWidth: 500, margin: '0 auto', lineHeight: 1.6 }}>
                    Choose the right plan to unlock live tracking, advanced analytics, and premium support for your organization.
                </p>
            </div>

            {/* Pricing Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, marginBottom: 40 }}>
                {TIERS.map((tier) => (
                    <motion.div
                        key={tier.name}
                        whileHover={{ y: -5 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                    >
                        <GlassCard
                            style={{
                                padding: 32,
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                position: 'relative',
                                overflow: 'hidden',
                                border: tier.highlight ? '1px solid var(--accent-blue)' : '1px solid rgba(255,255,255,0.06)',
                                boxShadow: tier.highlight ? '0 12px 40px rgba(59,142,243,0.15)' : 'none'
                            }}
                        >
                            {/* Highlight gradient */}
                            {tier.highlight && (
                                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, var(--accent-blue), var(--accent-purple))' }} />
                            )}

                            <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: tier.highlight ? 'var(--accent-blue)' : 'white' }}>
                                {tier.name}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 16 }}>
                                <span style={{ fontSize: 42, fontWeight: 800, letterSpacing: '-0.04em' }}>{tier.price}</span>
                                {tier.period && <span style={{ color: 'var(--text-tertiary)', fontSize: 15, fontWeight: 500 }}>{tier.period}</span>}
                            </div>

                            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 32, lineHeight: 1.5, minHeight: 42 }}>
                                {tier.description}
                            </p>

                            <div style={{ flex: 1 }}>
                                {tier.features.map((feature, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                                        <div style={{ width: 24, height: 24, borderRadius: '50%', background: tier.highlight ? 'rgba(59,142,243,0.15)' : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <Check size={12} color={tier.highlight ? 'var(--accent-blue)' : 'var(--text-secondary)'} strokeWidth={3} />
                                        </div>
                                        <span style={{ fontSize: 14, color: 'var(--text-primary)' }}>{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <motion.button
                                onClick={() => handleUpgrade(tier.action)}
                                disabled={tier.isCurrent || loading}
                                whileHover={!tier.isCurrent && !loading ? { scale: 1.02 } : {}}
                                whileTap={!tier.isCurrent && !loading ? { scale: 0.98 } : {}}
                                style={{
                                    width: '100%',
                                    marginTop: 32,
                                    padding: '14px',
                                    borderRadius: 12,
                                    fontWeight: 700,
                                    fontSize: 15,
                                    border: 'none',
                                    cursor: tier.isCurrent || loading ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 8,
                                    background: tier.highlight ? 'linear-gradient(135deg, var(--accent-blue), #2563eb)' : 'rgba(255,255,255,0.05)',
                                    color: tier.highlight ? 'white' : 'var(--text-secondary)',
                                    opacity: tier.isCurrent ? 0.6 : 1,
                                    boxShadow: tier.highlight && !tier.isCurrent ? '0 8px 20px rgba(59,142,243,0.3)' : 'none',
                                    transition: 'all 0.2s',
                                }}
                            >
                                {tier.buttonText} {tier.highlight && !tier.isCurrent && <ArrowRight size={16} />}
                            </motion.button>
                        </GlassCard>
                    </motion.div>
                ))}
            </div>

            {/* Trust Badges */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 40, marginTop: 40 }}>
                {[
                    { icon: Shield, title: 'Secure Checkout', desc: 'Protected by Stripe\'s bank-grade 256-bit encryption' },
                    { icon: CreditCard, title: 'Flexible Payments', desc: 'Accepting all major credit cards and ACH transfers' },
                    { icon: Clock, title: 'Cancel Anytime', desc: 'No long-term commitments. Pause or cancel your plan easily' }
                ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: 16 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <item.icon size={20} color="var(--text-secondary)" />
                        </div>
                        <div>
                            <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{item.title}</h4>
                            <p style={{ fontSize: 13, color: 'var(--text-tertiary)', lineHeight: 1.5 }}>{item.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
