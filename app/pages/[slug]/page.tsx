import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';

async function getPage(slug: string) {
  const page = await prisma.page.findUnique({
    where: {
      slug,
      published: true,
    },
  });

  if (!page) notFound();
  return page;
}

export default async function CustomPage({ params }: { params: { slug: string } }) {
  const page = await getPage(params.slug);

  return (
    <div className="container py-8">
      <article className="prose prose-slate dark:prose-invert max-w-none">
        <h1 className="mb-8">{page.title}</h1>
        <div dangerouslySetInnerHTML={{ __html: page.content }} />
      </article>
    </div>
  );
}

export async function generateStaticParams() {
  const pages = await prisma.page.findMany({
    where: { published: true },
    select: { slug: true },
  });

  return pages.map((page) => ({
    slug: page.slug,
  }));
}