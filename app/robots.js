export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/dashboard/', '/sign-in/', '/sign-up/'],
      },
    ],
    sitemap: 'https://devhance.in/sitemap.xml',
  };
}

