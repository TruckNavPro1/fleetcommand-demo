import * as Sentry from '@sentry/react';

export function initMonitoring() {
    const dsn = import.meta.env.VITE_SENTRY_DSN;

    if (!dsn) {
        console.warn("Monitoring: VITE_SENTRY_DSN not found. Error tracking is disabled in this environment.");
        return;
    }

    Sentry.init({
        dsn: dsn,
        integrations: [
            Sentry.browserTracingIntegration(),
            Sentry.replayIntegration(),
        ],
        // Performance Monitoring
        tracesSampleRate: 1.0,
        // Session Replay
        replaysSessionSampleRate: 0.1,
        replaysOnErrorSampleRate: 1.0,
    });

    console.log("Monitoring: Sentry initialized successfully.");
}
