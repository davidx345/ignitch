import { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { access_token, refresh_token } = req.body
  if (!access_token || !refresh_token) {
    return res.status(400).json({ error: 'Missing tokens' })
  }

  // Set cookies for SSR middleware
  const isProd = process.env.NODE_ENV === 'production';
  const secureFlag = isProd ? '; Secure' : '';
  res.setHeader('Set-Cookie', [
    `sb-access-token=${access_token}; Path=/; Max-Age=${60 * 60 * 24 * 7}; SameSite=Lax${secureFlag}`,
    `sb-refresh-token=${refresh_token}; Path=/; Max-Age=${60 * 60 * 24 * 7}; SameSite=Lax${secureFlag}`
  ])

  return res.status(200).json({ success: true })
}
