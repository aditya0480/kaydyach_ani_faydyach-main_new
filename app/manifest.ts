import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'कायद्याचं आणि फायद्याचं',
        short_name: 'KAF',
        description: 'कायद्याचे ज्ञान आता सर्वांसाठी उपलब्ध. वकीलांचे मार्गदर्शन आणि ई-बुक्स एकाच ठिकाणी.',
        start_url: '/',
        display: 'standalone',
        display_override: ['window-controls-overlay', 'standalone'],
        background_color: '#ffffff',
        theme_color: '#0D9488',
        categories: ['education', 'lifestyle', 'books'],
        icons: [
            {
                src: '/favicon.svg',
                sizes: 'any',
                type: 'image/svg+xml',

            },
            {
                src: '/favicon-96x96.png',
                sizes: '96x96',
                type: 'image/png'
            },
            {
                src: '/apple-touch-icon',
                sizes: '180x180',
                type: 'image/png'
            },
            {
                src: '/web-app-manifest-192x192.png',
                sizes: '192x192',
                type: 'image/png',

            },
            {
                src: '/web-app-manifest-512x512.png',
                sizes: '512x512',
                type: 'image/png',

            },
        ],
        shortcuts: [
            {
                name: 'E-Books',
                url: '/ebooks',
                icons: [{ src: '/icon.svg', sizes: 'any' }]
            },
            {
                name: 'Combo Packs',
                url: '/combos',
                icons: [{ src: '/icon.svg', sizes: 'any' }]
            }
        ]
    };
}
