import { rest } from 'msw';

import { API_URL } from '@/config';

import { db, persistDb } from '../db';
import { requireAuth, delayedResponse, buildUrl } from '../utils';

type ProfileBody = {
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  image: string;
  password: string;
};

export const usersHandlers = [
  rest.put<ProfileBody>(buildUrl(API_URL, '/auth/users/:userId'), async (req, res, ctx) => {
    try {
      const user = requireAuth(req);
      const data = await req.json();
      const result = db.user.update({
        where: {
          id: {
            equals: user.id,
          },
        },
        data,
      });
      persistDb('user');
      return delayedResponse(ctx.json(result));
    } catch (error: any) {
      return delayedResponse(ctx.status(400), ctx.json({ message: error?.message || 'Server Error' }));
    }
  }),

  rest.get(buildUrl(API_URL, '/users/:userId'), (req, res, ctx) => {
    try {
      const { userId } = req.params;
      const user = db.user.findFirst({
        where: {
          id: {
            equals: userId as string,
          },
        },
      });
      if (!user) {
        return delayedResponse(ctx.status(404), ctx.json({ message: `User not found` }));
      }
      return delayedResponse(ctx.json(user));
    } catch (error: any) {
      return delayedResponse(ctx.status(400), ctx.json({ message: error?.message || 'Server Error' }));
    }
  }),
];
