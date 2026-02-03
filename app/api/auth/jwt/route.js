import { getToken } from 'next-auth/jwt';

export async function GET(req) {
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });
  console.log(req);
  if (!token) return new Response('Unauthorized', { status: 401 });
  return Response.json({ jwt: token });
}
