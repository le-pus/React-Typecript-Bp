import { rest } from 'msw';
import { nanoid } from 'nanoid';

import { API_URL } from '@/config';

import { db, persistDb } from '../db';
import { requireAuth, delayedResponse, buildUrl } from '../utils';

type CreatePostBody = {
  body: string;
  postId: string;
  userId: string;
};

export const postsHandlers = [
  rest.get(buildUrl(API_URL, 'posts/search'), async (req, res, ctx) => {
    try {
      const query = req.url.searchParams.get('q') || '';
      const limit = Number(req.url.searchParams.get('limit') || 0);
      const skip = Number(req.url.searchParams.get('skip') || 0);
      const where = {
        title: {
          contains: query,
        },
      };
      const posts = db.post.findMany({ where, take: limit, skip });
      const total = db.post.count({ where });

      const result = {
        posts,
        total,
        skip,
        limit,
      };

      return delayedResponse(ctx.json(result));
    } catch (error: any) {
      return delayedResponse(ctx.status(400), ctx.json({ message: error?.message || 'Server Error' }));
    }
  }),

  rest.get(buildUrl(API_URL, 'users/:userId/posts'), async (req, res, ctx) => {
    try {
      const { userId } = req.params;
      const limit = Number(req.url.searchParams.get('limit') || 0);
      const skip = Number(req.url.searchParams.get('skip') || 0);
      const where = {
        userId: {
          equals: userId as string,
        },
      };
      const posts = db.post.findMany({ where, take: limit, skip });
      const total = db.post.count({ where });

      const result = {
        posts,
        total,
        skip,
        limit,
      };

      return delayedResponse(ctx.json(result));
    } catch (error: any) {
      return delayedResponse(ctx.status(400), ctx.json({ message: error?.message || 'Server Error' }));
    }
  }),

  rest.get(buildUrl(API_URL, 'posts/:postId'), async (req, res, ctx) => {
    try {
      const { postId } = req.params;
      const result = db.post.findFirst({
        where: {
          id: {
            equals: postId as string,
          },
        },
      });
      if (!result) {
        return delayedResponse(ctx.status(404), ctx.json({ message: `Post with id '${postId}' not found` }));
      }
      return delayedResponse(ctx.json(result));
    } catch (error: any) {
      return delayedResponse(ctx.status(400), ctx.json({ message: error?.message || 'Server Error' }));
    }
  }),

  rest.post<CreatePostBody>(buildUrl(API_URL, '/posts/add'), async (req, res, ctx) => {
    try {
      const user = requireAuth(req);
      const data = await req.json();
      const result = db.post.create({
        userId: user.id,
        id: nanoid(),
        createdAt: Date.now(),
        ...data,
      });
      persistDb('post');
      return delayedResponse(ctx.json(result));
    } catch (error: any) {
      return delayedResponse(ctx.status(400), ctx.json({ message: error?.message || 'Server Error' }));
    }
  }),

  rest.put<CreatePostBody>(buildUrl(API_URL, '/posts/:postId'), async (req, res, ctx) => {
    try {
      const user = requireAuth(req);
      const data = await req.json();
      const { postId } = req.params;
      const result = db.post.update({
        where: {
          id: {
            equals: postId as string,
          },
          userId: {
            equals: user.id,
          },
        },
        data,
      });
      persistDb('post');
      return delayedResponse(ctx.json(result));
    } catch (error: any) {
      return delayedResponse(ctx.status(400), ctx.json({ message: error?.message || 'Server Error' }));
    }
  }),

  rest.delete(buildUrl(API_URL, '/posts/:postId'), async (req, res, ctx) => {
    try {
      const user = requireAuth(req);
      const { postId } = req.params;
      const result = db.post.delete({
        where: {
          id: {
            equals: postId as string,
          },
          userId: {
            equals: user.id,
          },
        },
      });
      persistDb('post');
      return delayedResponse(ctx.json(result));
    } catch (error: any) {
      return delayedResponse(ctx.status(400), ctx.json({ message: error?.message || 'Server Error' }));
    }
  }),
];
