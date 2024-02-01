export type DiceRollToken = {
  value: string
}

export type DiceRollResult = {
  number: number
  detail?: string
}

export interface DiceRollKit {
  parse: (text: string) => DiceRollToken[]
  perform: (token: DiceRollToken) => DiceRollResult | null
}
