import { random } from '../../random/random.js'
import { DiceRollKit, DiceRollResult, DiceRollToken } from '../interface.js'

const validTokenRegex =
  /^(?:\d{1,10})?(?:(?:[+-]?\d{1,10}[+-]){0,10}?\d{1,10}d\d{1,10})+(?:[+-]\d{1,10}){0,10}$/

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
const numberRegex = /([+-]?\d+)/

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

const perform = (token: DiceRollToken): DiceRollResult | null => {
  let tmpTokenStr: string = token.value
  let result: RegExpExecArray | null = null

  while ((result = diceRegex.exec(tmpTokenStr)) !== null) {
    const captures: string[] = result
    const diceStr: string = captures[1]

    const split = diceStr.split('d')
    const face = parseInt(split[1])
    const count = parseInt(split[0])

    let total = 0
    for (let i = 0; i < count; i++) {
      const rollResult = Math.floor(random() * face) + 1
      total += rollResult
    }

    tmpTokenStr = tmpTokenStr.replace(diceStr, total.toString())
  }

  const sumResult = calcSum(tmpTokenStr)

  return {
    number: sumResult,
    detail: tmpTokenStr,
  }
}

export const getDiceRollKit = (): DiceRollKit => {
  return {
    parse,
    perform,
  }
}
