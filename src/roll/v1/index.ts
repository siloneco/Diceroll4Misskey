import {
  getMaxAmountOfCommandsPerRequest,
  getMaxAmountOfThrowsPerCommand,
  getMaxDiceNumber,
} from '../../config.js'
import { random } from '../../random/random.js'
import { Failure, Result, Success } from '../../utils/Result.js'
import { InvalidCommandError } from '../error.js'
import { DiceRollKit, DiceRollResult, DiceRollToken } from '../interface.js'

const validTokenRegex =
  /^(?:\d{1,10})?(?:(?:[+-]?\d{1,10}[+-]){0,10}?\d{1,10}d\d{1,10}){1,10}(?:[+-]\d{1,10}){0,10}$/

const parse = (text: string): DiceRollToken[] => {
  const result: DiceRollToken[] = []

  const lines = text.split('\n')
  for (const line of lines) {
    const tokenCandidates: string[] = line.split(' ')

    for (const tokenCandidate of tokenCandidates) {
      if (!validTokenRegex.test(tokenCandidate)) {
        continue
      }

      result.push({
        value: tokenCandidate,
      })
    }
  }

  return result
}

const diceRegex = /[+-]?(\d+d\d+)[+-]?/

const calcSum = (str: string): number => {
  const tokens = str.split('+')

  const values: number[] = []
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]

    const minusTokens = token.split('-')
    for (let j = 0; j < minusTokens.length; j++) {
      if (j === 0) {
        values.push(Number(minusTokens[j]))
        continue
      }

      values.push(Number('-' + minusTokens[j]))
    }
  }

  return values.reduce((a, b) => a + b)
}

const rollDice = ({
  count,
  face,
}: {
  count: number
  face: number
}): number | string => {
  if (count <= 0 || face <= 0) {
    return 'マイナスは指定できません！'
  }
  if (count > getMaxAmountOfThrowsPerCommand()) {
    return `${count}個も振れません！${getMaxAmountOfThrowsPerCommand()}個までにしてください！`
  }
  if (face > getMaxDiceNumber()) {
    return `${face}面ダイスはデカすぎます！${getMaxDiceNumber()}面ダイスまでにしてください！`
  }

  let total = 0
  for (let i = 0; i < count; i++) {
    const rollResult = Math.floor(random() * face) + 1
    total += rollResult
  }

  return total
}

const perform = (
  token: DiceRollToken
): Result<DiceRollResult, InvalidCommandError | Error> => {
  if (token.value.length > 50) {
    return new Failure(
      new InvalidCommandError(
        'コマンドが長すぎます！50文字以内にしてください！'
      )
    )
  }

  let tmpTokenStr: string = token.value
  let result: RegExpExecArray | null = null

  while ((result = diceRegex.exec(tmpTokenStr)) !== null) {
    const captures: string[] = result
    const diceStr: string = captures[1]

    const split = diceStr.split('d')
    const face = parseInt(split[1])
    const count = parseInt(split[0])

    const rollResult = rollDice({ face, count })

    if (typeof rollResult === 'string') {
      return new Failure(new InvalidCommandError(rollResult))
    }

    tmpTokenStr = tmpTokenStr.replace(diceStr, rollResult.toString())
  }

  const sumResult = calcSum(tmpTokenStr)

  const hasOperator =
    tmpTokenStr.indexOf('+') !== -1 || tmpTokenStr.indexOf('-') !== -1

  return new Success({
    number: sumResult,
    detail: hasOperator ? tmpTokenStr : undefined,
  })
}

export const getDiceRollKit = (): DiceRollKit => {
  return {
    parse,
    perform,
  }
}
