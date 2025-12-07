export function WebsiteJsonLd() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'DevHance',
    url: 'https://devhance.in',
    description: 'Transform GitHub repositories into professional case studies and investor-grade technical audits',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://devhance.in/case-studies/{search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export function SoftwareApplicationJsonLd() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'DevHance',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Web',
    url: 'https://devhance.in',
    description: 'AI-powered tool that transforms GitHub repositories into professional case studies and VC reports',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      description: 'Free case study generation, $5 for VC reports',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '50',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export function OrganizationJsonLd() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'DevHance',
    url: 'https://devhance.in',
    logo: 'https://devhance.in/DH Logo.png',
    sameAs: [
      'https://twitter.com/devhance',
      'https://github.com/devhance',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'founder@devhance.in',
      contactType: 'customer service',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export function CaseStudyJsonLd({ caseStudy }) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: caseStudy.title,
    description: caseStudy.summary,
    url: `https://devhance.in/case-studies/${caseStudy.slug}`,
    datePublished: caseStudy.createdAt,
    dateModified: caseStudy.updatedAt || caseStudy.createdAt,
    author: {
      '@type': 'Person',
      name: caseStudy.user?.email || 'DevHance User',
    },
    publisher: {
      '@type': 'Organization',
      name: 'DevHance',
      logo: {
        '@type': 'ImageObject',
        url: 'https://devhance.in/DH Logo.png',
      },
    },
    keywords: caseStudy.techStack,
    articleSection: 'Case Study',
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
