import * as dotenv from 'dotenv'
dotenv.config({
  path: '.env',
})

export const getServerUrl = (): string | undefined => {
  return process.env.SERVER_URL
}

export const getToken = (): string | undefined => {
  return process.env.TOKEN
}

const isDebugging = process.env.DEBUG === 'true'
export const isDebugMode = (): boolean => {
  return isDebugging
}

const debugUserId = process.env.DEBUG_USER_ID ?? ''
export const getDebugUserId = (): string => {
  return debugUserId
}

type RateLimitThreshold = {
  requests: number
  seconds: number
}

const requestLimitForUser = parseInt(
  process.env.REQUEST_LIMIT_FOR_USER ?? '100000000000'
)
export const getLimitForUser = (): RateLimitThreshold => {
  return { requests: requestLimitForUser, seconds: 60 * 15 }
}

const requestLimitForHost = parseInt(
  process.env.REQUEST_LIMIT_FOR_HOST ?? '100000000000'
)
export const getLimitForHost = (): RateLimitThreshold => {
  return { requests: requestLimitForHost, seconds: 60 }
}

const maxAmountOfCommandsPerRequest = parseInt(
  process.env.MAX_AMOUNT_OF_COMMANDS_PER_REQUEST ?? '10'
)
export const getMaxAmountOfCommandsPerRequest = () => {
  return maxAmountOfCommandsPerRequest
}

const maxDiceNumber = parseInt(process.env.MAX_DICE_NUMBER ?? '100')
export const getMaxDiceNumber = () => {
  return maxDiceNumber
}

const maxAmountOfThrowsPerCommand = parseInt(
  process.env.MAX_AMOUNT_OF_THROWS_PER_COMMAND ?? '100'
)
export const getMaxAmountOfThrowsPerCommand = () => {
  return maxAmountOfThrowsPerCommand
}
