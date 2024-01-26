import {
  getMaxAmountOfCommandsPerRequest,
  getMaxAmountOfThrowsPerCommand,
  getMaxDiceNumber,
} from './config.js'
import { random } from './random.js'

export type Roll = {
  amount: number
  size: number
}

export const parseDiceText = (text: string): Roll[] => {
  const lines = text.split('\n')

  const results: Roll[] = []

  for (const line of lines) {
    const split = line.trim().split('d')

    if (split.length !== 2) {
      continue
    }

    const amountStr = split[0]
    const sizeStr = split[1]

    if (amountStr === '' || sizeStr === '') {
      continue
    }

    const amount: number = Number(amountStr)
    const size: number = Number(sizeStr)

    if (!Number.isInteger(amount) || !Number.isInteger(size)) {
      continue
    }

    results.push({
      amount,
      size,
    })
  }

  return results
}

type RollTextValidationResult = {
  valid: boolean
  reason?: string
}

export const validateRolls = (rolls: Roll[]): RollTextValidationResult => {
  if (rolls.length > getMaxAmountOfCommandsPerRequest()) {
    return {
      valid: false,
      reason: `コマンドの個数が多すぎます！${getMaxAmountOfCommandsPerRequest()}個までにしてください！`,
    }
  }

  for (const roll of rolls) {
    if (roll.amount > getMaxAmountOfThrowsPerCommand()) {
      return {
        valid: false,
        reason: `${
          roll.amount
        }個も振れません！${getMaxAmountOfThrowsPerCommand()}個までにしてください！`,
      }
    }
    if (roll.amount < 1) {
      return {
        valid: false,
        reason: `0以下の個数は指定できません！1個以上にしてください！`,
      }
    }

    if (roll.size > getMaxDiceNumber()) {
      return {
        valid: false,
        reason: `${
          roll.size
        }面ダイスはデカすぎます！${getMaxDiceNumber()}面までにしてください！`,
      }
    }
    if (roll.size < 2) {
      return {
        valid: false,
        reason: `ダイスの面は2以上にしてください！`,
      }
    }
  }

  return {
    valid: true,
  }
}

export const roll = (rolls: Roll[]): number[][] => {
  const results: number[][] = []

  for (const roll of rolls) {
    const result = []
    for (let i = 0; i < roll.amount; i++) {
      result.push(Math.floor(random() * roll.size) + 1)
    }

    results.push(result)
  }

  return results
}
