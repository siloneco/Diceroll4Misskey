import { random } from './random.js'

describe('random function works fine', () => {
  it('generates numbers randomly', () => {
    const AMOUNT = 10000
    const VALID_RATIO = 0.15

    const results = []

    for (let i = 0; i < 10; i++) {
      results.push(0)
    }

    for (let i = 0; i < AMOUNT; i++) {
      const index = Math.floor(random() * 10)
      results[index]++
    }

    for (let i = 0; i < 10; i++) {
      const ratio = results[i] / (AMOUNT / 10)
      const diff = ratio - 1
      expect(Math.abs(diff)).toBeLessThanOrEqual(VALID_RATIO)
    }
  })
})
