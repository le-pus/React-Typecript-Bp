import jwt from 'jsonwebtoken';
import omit from 'lodash/omit';
import { RestRequest, createResponseComposition, context } from 'msw';

import { JWT_SECRET } from '@/config';

import { db } from './db';

const isTesting = process.env.NODE_ENV === 'test' || ((window as any).Cypress as any);

export const buildUrl = (domain: string, path: string) => new URL(path, domain).href;

export const delayedResponse = createResponseComposition(undefined, [context.delay(isTesting ? 0 : 1000)]);

export const hash = (str: string) => {
  let hash = 5381,
    i = str.length;

  while (i) {
    hash = (hash * 33) ^ str.charCodeAt(--i);
  }
  return String(hash >>> 0);
};

export const sanitizeUser = (user: any) => omit(user, ['password', 'iat']);

export function authenticate({ username, password }: { username: string; password: string }) {
  const user = db.user.findFirst({
    where: {
      username: {
        equals: username,
      },
    },
  });

  if (user?.password === hash(password)) {
    const sanitizedUser = sanitizeUser(user);
    const encodedToken = jwt.sign(sanitizedUser, JWT_SECRET);
    return { user: sanitizedUser, jwt: encodedToken };
  }

  const error = new Error('Invalid username or password');
  throw error;
}

export function requireAuth(request: RestRequest) {
  try {
    const encodedToken = request.headers.get('authorization');
    if (!encodedToken) {
      throw new Error('No authorization token provided!');
    }
    const encodedJWT = encodedToken.split(' ').pop() ?? '';
    const decodedToken = jwt.verify(encodedJWT, JWT_SECRET) as { id: string };

    const user = db.user.findFirst({
      where: {
        id: {
          equals: decodedToken.id,
        },
      },
    });

    if (!user) {
      throw Error('Unauthorized');
    }

    return sanitizeUser(user);
  } catch (err: any) {
    throw new Error(err);
  }
}
