import crypto from 'crypto'

const nBytes = 4
const maxValue = 4294967295

// See: https://qiita.com/nwtgck/items/5b52336ad37ed51badf7
const generateSecureRandom = () => {
  const randomBytes = crypto.randomBytes(nBytes)
  const r = randomBytes.readUIntBE(0, nBytes)
  return r / maxValue
}

export const random = () => {
  return generateSecureRandom()
}
