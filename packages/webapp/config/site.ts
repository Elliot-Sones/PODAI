export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: 'Podverse',
  description: 'AI-Powered Podcast Discovery Platform. Browse by category, search topics, and discover moments across podcasts.',
  mainNav: [
    {
      title: 'Home',
      href: '/',
    },
    {
      title: 'Explore',
      href: '/explore',
    },
    {
      title: 'Topics',
      href: '/topics',
    },
    {
      title: 'Add Podcast',
      href: '/request',
    },
  ],
  links: {
    twitter: 'https://twitter.com/shadcn',
    github: 'https://github.com/shadcn/ui',
    docs: 'https://ui.shadcn.com',
  },
};
