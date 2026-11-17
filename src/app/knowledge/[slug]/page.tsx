import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleDetailClient } from "@/components/knowledge/ArticleDetailClient";
import { JsonLd } from "@/components/seo/JsonLd";
import { ARTICLES } from "@/data/articles";
import { getArticles } from "@/lib/data/repository";
import {
  DEFAULT_OG_IMAGE_PATH,
  buildBreadcrumbJsonLd,
  buildPageMetadata,
  canonicalUrl,
  getCanonicalSiteUrl,
} from "@/lib/seo/config";

export async function generateStaticParams() {
  return ARTICLES.map((article) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { articles } = await getArticles();
  const article = articles.find((a) => a.slug === slug);

  if (!article) {
    return { title: "مقال غير موجود" };
  }

  return buildPageMetadata({
    title: article.titleAr,
    description: article.summaryAr,
    path: `/knowledge/${article.slug}`,
    ogType: "article",
  });
}

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { articles } = await getArticles();
  const article = articles.find((a) => a.slug === slug);

  if (!article) {
    notFound();
  }

  const related = articles
    .filter((a) => a.slug !== article.slug && a.category === article.category)
    .slice(0, 2);

  const siteUrl = getCanonicalSiteUrl();
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.titleAr,
    description: article.summaryAr,
    inLanguage: "ar",
    mainEntityOfPage: canonicalUrl(`/knowledge/${article.slug}`),
    image: `${siteUrl}${DEFAULT_OG_IMAGE_PATH}`,
    publisher: {
      "@id": `${siteUrl}/#organization`,
    },
  };

  return (
    <>
      <JsonLd data={articleJsonLd} />
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "الرئيسية", path: "/" },
          { name: "المعرفة الإسلامية", path: "/knowledge" },
          { name: article.titleAr, path: `/knowledge/${article.slug}` },
        ])}
      />
      <ArticleDetailClient article={article} relatedArticles={related} />
    </>
  );
}
