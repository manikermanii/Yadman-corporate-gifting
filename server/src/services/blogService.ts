import { initialStoreData } from '../utils/initialStoreData.js';
import { prisma, isDbConnected } from '../config/database.js';

let inMemoryBlogPosts = [...initialStoreData.blogPosts];
let inMemoryBlogCategories = [...initialStoreData.blogCategories];
let inMemoryBlogAuthors = [...initialStoreData.blogAuthors];

function formatPostFromPrisma(p: any) {
  return {
    ...p,
    tags: typeof p.tags === 'string' ? JSON.parse(p.tags || '[]') : (p.tags || []),
    status: p.status ? p.status.toLowerCase() : 'published',
    createdAt: p.createdAt ? p.createdAt.toISOString() : new Date().toISOString(),
    updatedAt: p.updatedAt ? p.updatedAt.toISOString() : new Date().toISOString(),
    publishedAt: p.publishedAt ? p.publishedAt.toISOString() : new Date().toISOString(),
  };
}

export class BlogService {
  async getPosts(query?: {
    categorySlug?: string;
    tag?: string;
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, Number(query?.page) || 1);
    const limit = Math.max(1, Math.min(50, Number(query?.limit) || 12));
    const skip = (page - 1) * limit;

    if (isDbConnected()) {
      try {
        const where: any = {};
        const statusReq = (query?.status || 'published').toUpperCase();
        where.status = statusReq;

        if (query?.categorySlug) {
          const cat = await prisma.blogCategory.findFirst({
            where: { OR: [{ slug: query.categorySlug }, { id: query.categorySlug }] },
          });
          if (cat) where.categoryId = cat.id;
        }

        if (query?.search && query.search.trim()) {
          where.OR = [
            { title: { contains: query.search.trim(), mode: 'insensitive' } },
            { excerpt: { contains: query.search.trim(), mode: 'insensitive' } },
            { content: { contains: query.search.trim(), mode: 'insensitive' } },
          ];
        }

        const [total, posts] = await Promise.all([
          prisma.blogPost.count({ where }),
          prisma.blogPost.findMany({
            where,
            include: { category: true, author: true },
            orderBy: { publishedAt: 'desc' },
            skip,
            take: limit,
          }),
        ]);

        return {
          posts: posts.map(formatPostFromPrisma),
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit) || 1,
          },
        };
      } catch (err) {
        console.warn('Prisma getPosts error, falling back:', err);
      }
    }

    let items = [...inMemoryBlogPosts];

    if (query?.status) {
      items = items.filter((p) => p.status === query.status);
    } else {
      items = items.filter((p) => p.status === 'published');
    }

    if (query?.categorySlug) {
      const cat = inMemoryBlogCategories.find(
        (c) => c.slug === query.categorySlug || c.id === query.categorySlug
      );
      if (cat) {
        items = items.filter((p) => p.categoryId === cat.id);
      }
    }

    if (query?.tag) {
      items = items.filter((p) => p.tags && p.tags.includes(query.tag!));
    }

    if (query?.search && query.search.trim()) {
      const q = query.search.toLowerCase().trim();
      items = items.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.excerpt.toLowerCase().includes(q) ||
          p.content.toLowerCase().includes(q)
      );
    }

    const total = items.length;
    const paginated = items.slice(skip, skip + limit);

    const enriched = paginated.map((post) => {
      const author = inMemoryBlogAuthors.find((a) => a.id === post.authorId);
      const category = inMemoryBlogCategories.find((c) => c.id === post.categoryId);
      return {
        ...post,
        author,
        category,
      };
    });

    return {
      posts: enriched,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async getPostBySlug(slug: string) {
    if (isDbConnected()) {
      try {
        const post = await prisma.blogPost.findFirst({
          where: { OR: [{ slug }, { id: slug }] },
          include: { category: true, author: true },
        });
        if (post) {
          await prisma.blogPost.update({
            where: { id: post.id },
            data: { viewsCount: { increment: 1 } },
          }).catch(() => {});
          return formatPostFromPrisma(post);
        }
      } catch (err) {
        console.warn('Prisma getPostBySlug fallback:', err);
      }
    }

    const post = inMemoryBlogPosts.find((p) => p.slug === slug || p.id === slug);
    if (!post) return null;

    post.viewsCount = (post.viewsCount || 0) + 1;

    const author = inMemoryBlogAuthors.find((a) => a.id === post.authorId);
    const category = inMemoryBlogCategories.find((c) => c.id === post.categoryId);

    return {
      ...post,
      author,
      category,
    };
  }

  async getCategories() {
    if (isDbConnected()) {
      try {
        const cats = await prisma.blogCategory.findMany({
          include: { _count: { select: { posts: true } } },
        });
        return cats.map((c) => ({
          ...c,
          postCount: c._count?.posts || 0,
        }));
      } catch (err) {
        console.warn('Prisma getCategories fallback:', err);
      }
    }

    return inMemoryBlogCategories.map((c) => {
      const postCount = inMemoryBlogPosts.filter((p) => p.categoryId === c.id).length;
      return { ...c, postCount };
    });
  }

  async getAuthors() {
    if (isDbConnected()) {
      try {
        return await prisma.blogAuthor.findMany();
      } catch (err) {
        console.warn('Prisma getAuthors fallback:', err);
      }
    }
    return inMemoryBlogAuthors;
  }

  async createPost(data: any) {
    const now = new Date();
    if (isDbConnected()) {
      const created = await prisma.blogPost.create({
        data: {
          id: data.id || `post-${Date.now()}`,
          title: data.title,
          slug: data.slug || `post-${Date.now()}`,
          excerpt: data.excerpt || '',
          content: data.content || '',
          coverImage: data.coverImage || '',
          categoryId: data.categoryId,
          authorId: data.authorId,
          readingTimeMin: data.readTimeMinutes ? Number(data.readTimeMinutes) : 5,
          tags: JSON.stringify(data.tags || []),
          status: (data.status || 'PUBLISHED').toUpperCase(),
          publishedAt: data.publishedAt ? new Date(data.publishedAt) : now,
          seoTitle: data.seoTitle || data.title,
          seoDescription: data.seoDescription || data.excerpt?.slice(0, 160) || null,
        },
        include: { category: true, author: true },
      });
      return formatPostFromPrisma(created);
    }

    const newPost = {
      ...data,
      id: `post-${Date.now()}`,
      viewsCount: 0,
      likesCount: 0,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      publishedAt: data.publishedAt || now.toISOString(),
      publishedAtFa: new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium' }).format(now),
    };
    inMemoryBlogPosts.unshift(newPost);
    return newPost;
  }

  async updatePost(id: string, data: any) {
    if (isDbConnected()) {
      const updated = await prisma.blogPost.update({
        where: { id },
        data: {
          title: data.title,
          slug: data.slug,
          excerpt: data.excerpt,
          content: data.content,
          coverImage: data.coverImage,
          categoryId: data.categoryId,
          authorId: data.authorId,
          readingTimeMin: data.readTimeMinutes ? Number(data.readTimeMinutes) : undefined,
          tags: data.tags !== undefined ? JSON.stringify(data.tags) : undefined,
          status: data.status ? String(data.status).toUpperCase() : undefined,
          publishedAt: data.publishedAt ? new Date(data.publishedAt) : undefined,
          seoTitle: data.seoTitle,
          seoDescription: data.seoDescription,
        },
        include: { category: true, author: true },
      });
      return formatPostFromPrisma(updated);
    }

    const index = inMemoryBlogPosts.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('مقاله یافت نشد.');
    inMemoryBlogPosts[index] = {
      ...inMemoryBlogPosts[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return inMemoryBlogPosts[index];
  }

  async deletePost(id: string) {
    if (isDbConnected()) {
      const deleted = await prisma.blogPost.delete({ where: { id } });
      return formatPostFromPrisma(deleted);
    }
    const index = inMemoryBlogPosts.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('مقاله یافت نشد.');
    const [deleted] = inMemoryBlogPosts.splice(index, 1);
    return deleted;
  }
}

export const blogService = new BlogService();
