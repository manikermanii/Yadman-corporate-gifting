import { Request, Response, NextFunction } from 'express';
import { blogService } from '../services/blogService.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { blogPostCreateSchema } from '../validators/index.js';

export class BlogController {
  async getPosts(req: Request, res: Response, next: NextFunction) {
    try {
      const query = {
        categorySlug: req.query.categorySlug as string,
        tag: req.query.tag as string,
        search: req.query.search as string,
        status: req.query.status as string,
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 12,
      };
      const result = await blogService.getPosts(query);
      return sendSuccess(res, result.posts, 200, result.pagination);
    } catch (err: any) {
      next(err);
    }
  }

  async getPostBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      const post = await blogService.getPostBySlug(slug);
      if (!post) {
        return sendError(res, 'POST_NOT_FOUND', 'مقاله مورد نظر یافت نشد.', 404);
      }
      return sendSuccess(res, post);
    } catch (err: any) {
      next(err);
    }
  }

  async getCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await blogService.getCategories();
      return sendSuccess(res, categories);
    } catch (err: any) {
      next(err);
    }
  }

  async getAuthors(req: Request, res: Response, next: NextFunction) {
    try {
      const authors = await blogService.getAuthors();
      return sendSuccess(res, authors);
    } catch (err: any) {
      next(err);
    }
  }

  async createPost(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = blogPostCreateSchema.parse(req.body);
      const post = await blogService.createPost(validated);
      return sendSuccess(res, post, 201);
    } catch (err: any) {
      next(err);
    }
  }

  async updatePost(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const post = await blogService.updatePost(id, req.body);
      return sendSuccess(res, post);
    } catch (err: any) {
      next(err);
    }
  }

  async deletePost(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const deleted = await blogService.deletePost(id);
      return sendSuccess(res, deleted);
    } catch (err: any) {
      next(err);
    }
  }
}

export const blogController = new BlogController();
