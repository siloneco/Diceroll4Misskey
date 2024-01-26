import { createRequire } from 'module'
import { getLimitForHost, getLimitForUser } from './config.js'
const require = createRequire(import.meta.url)

const RateLimiter = require('limiter').RateLimiter

const hostRateLimiter = new Map<string, typeof RateLimiter>()
const userRateLimiter = new Map<string, typeof RateLimiter>()

type Props = {
  user: string
  host: string
}

type ReturnProps = {
  pass: boolean
  notice: boolean
  blockType?: 'user' | 'host'
}

export const consumeToken = async ({
  user,
  host,
}: Props): Promise<ReturnProps> => {
  if (!hostRateLimiter.has(host)) {
    const rateLimitConfig = getLimitForHost()
    hostRateLimiter.set(
      host,
      new RateLimiter({
        tokensPerInterval: rateLimitConfig.requests,
        interval: 1000 * rateLimitConfig.seconds,
        fireImmediately: true,
      })
    )
  }
  if (!userRateLimiter.has(user)) {
    const rateLimitConfig = getLimitForUser()
    userRateLimiter.set(
      user,
      new RateLimiter({
        tokensPerInterval: rateLimitConfig.requests,
        interval: 1000 * rateLimitConfig.seconds,
        fireImmediately: true,
      })
    )
  }
  const hostLimiter = hostRateLimiter.get(host)!
  const userLimiter = userRateLimiter.get(user)!

  const hostRemaining = await hostLimiter.removeTokens(1)
  const userRemaining = await userLimiter.removeTokens(1)

  if (hostRemaining > 1 && userRemaining > 1) {
    return {
      pass: true,
      notice: false,
    }
  }

  if (userRemaining == 0) {
    return {
      pass: false,
      notice: true,
      blockType: 'user',
    }
  }

  return {
    pass: false,
    notice: false,
    blockType: 'host',
  }
}
