import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleDetailClient } from "@/components/knowledge/ArticleDetailClient";
import { ARTICLES } from "@/data/articles";
import { getArticles } from "@/lib/data/repository";

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

  return {
    title: article.titleAr,
    description: article.summaryAr,
  };
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

  return <ArticleDetailClient article={article} relatedArticles={related} />;
}
