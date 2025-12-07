import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function sitemap() {
  const baseUrl = 'https://devhance.in';

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
  ];

  // Dynamic case studies - fetch public ones
  try {
    const caseStudies = await prisma.caseStudy.findMany({
      select: {
        slug: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: 1000,
    });

    const caseStudyPages = caseStudies.map((study) => ({
      url: `${baseUrl}/case-studies/${study.slug}`,
      lastModified: study.updatedAt,
      changeFrequency: 'monthly',
      priority: 0.8,
    }));

    return [...staticPages, ...caseStudyPages];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return staticPages;
  }
}
