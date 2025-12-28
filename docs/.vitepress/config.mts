import { defineConfig } from 'vitepress'

export default defineConfig({
    title: "DocGap",
    description: "Stop lying to your developers.",
    themeConfig: {
        nav: [
            { text: 'Guide', link: '/guide/configuration' },
            { text: 'Core Architecture', link: '/core/architecture' },
            { text: 'Reference', link: '/reference/cli' },
            { text: 'GitHub', link: 'https://github.com/nexical/docgap' }
        ],

        sidebar: [
            {
                text: 'Guide',
                items: [
                    { text: 'Configuration', link: '/guide/configuration' }
                ]
            },
            {
                text: 'Core Architecture',
                items: [
                    { text: 'Architecture', link: '/core/architecture' },
                    { text: 'Drift Detection', link: '/core/drift-detection' },
                    { text: 'Git Analysis', link: '/core/git-analysis' },
                    { text: 'Hashing & Timestamps', link: '/core/hashing' },
                    { text: 'Coverage Analysis', link: '/core/coverage' }
                ]
            },
            {
                text: 'Reference',
                items: [
                    { text: 'CLI Reference', link: '/reference/cli' },
                    { text: 'GitHub Action', link: '/reference/action' }
                ]
            },
            {
                text: 'Meta',
                items: [
                    { text: 'Contributing', link: '/meta/contributing' },
                    { text: 'Releasing', link: '/meta/releasing' },
                    { text: 'Testing', link: '/meta/testing' },
                    { text: 'Build Config', link: '/meta/build' }
                ]
            }
        ],

        socialLinks: [
            { icon: 'github', link: 'https://github.com/nexical/docgap' }
        ]
    }
})
