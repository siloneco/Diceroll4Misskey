jest.mock('../../random/random.js')

import { random } from '../../random/random.js'
import { DiceRollToken } from '../interface.js'
import { getDiceRollKit } from './index.js'

describe('roll/v1 perform', () => {
  beforeAll(() => {
    const randomMock = random as jest.Mock
    randomMock.mockReturnValue(1 - 10e-10) // 0.999999999
  })

  it('performs token correctly', () => {
    const roller = getDiceRollKit()

    const expectedResults: Map<string, number> = new Map([
      ['1d6', 6],
      ['1+2', 3],
      ['1-2', -1],
      ['1d6+2d10', 26],
      ['3d10-2d5', 20],
      ['1d6+2d10+3d10-2d5', 46],
    ])

    for (const [input, expected] of expectedResults) {
      const result = roller.perform({ value: input })
      expect(result).not.toBeNull()
      expect(result!.number).toBe(expected)
    }
  })

  it('performs rapidly', () => {
    const roller = getDiceRollKit()

    const start: number = Date.now()

    for (let i = 0; i < 10000; i++) {
      roller.perform({ value: '1d6+2d10+3d10-2d5' })
    }

    const end: number = Date.now()
    const elapsed: number = end - start

    expect(elapsed).toBeLessThan(300)
  })
})

describe('roll/v1 parse', () => {
  it('parse correctly', () => {
    const roller = getDiceRollKit()

    const expectedResults: Map<string, DiceRollToken[]> = new Map([
      ['a', []],
      ['1d6', [{ value: '1d6' }]],
      ['a 1d2 b', [{ value: '1d2' }]],
      ['randomString 2+3d7+8+8d9 r4nd0mStr1ng adb', [{ value: '2+3d7+8+8d9' }]],
      ['first line\nsecond line 2d5\nsecond line', [{ value: '2d5' }]],
      ['-1d6+2+', []],
      ['-2d-2', []],
      ['2.6d3', []],
      ['6d3.5', []],
      ['8.4d3.5', []],
      ['0x10d5', []],
    ])

    for (const [input, expected] of expectedResults) {
      const result = roller.parse(input)
      expect(result).toEqual(expected)
    }
  })

  it('parse rapidly', () => {
    const roller = getDiceRollKit()
    const text = 'randomString 2+3d7+8+8d9 r4nd0mStr1ng adb'

    const start: number = Date.now()

    for (let i = 0; i < 10000; i++) {
      roller.parse(text)
    }

    const end: number = Date.now()
    const elapsed: number = end - start

    expect(elapsed).toBeLessThan(100)
  })
})
