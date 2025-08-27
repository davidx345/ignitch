import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Get the access token from the Authorization header
  const authHeader = req.headers.authorization
  if (!authHeader) {
    return res.status(401).json({ error: 'Missing Authorization header' })
  }
  const token = authHeader.split(' ')[1]
  if (!token) {
    return res.status(401).json({ error: 'Missing token' })
  }

  // Verify the token with Supabase
  const { data: user, error } = await supabase.auth.getUser(token)
  if (error || !user) {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }

  // Example: return user data
  return res.status(200).json({ user })
}
