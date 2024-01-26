type Visibility = 'public' | 'home' | 'followers'

export const selectVisibility = (received: string): Visibility | undefined => {
  if (received === 'public' || received === 'home') {
    return 'home'
  } else if (received === 'followers') {
    return 'followers'
  } else {
    return undefined
  }
}

const createResultLine = (result: number[]): string => {
  const sum = result.reduce((a, b) => a + b)

  if (result.length === 1) {
    return `${result[0]}`
  }

  if (result.length <= 10) {
    return `${sum} <small>(${result.join(' + ')})</small>`
  } else {
    return `${sum} <small>(出目省略)</small>`
  }
}

export const createResultText = (result: number[][]): string => {
  let resultText = ''
  for (let i = 0; i < result.length; i++) {
    resultText += createResultLine(result[i])

    if (i !== result.length - 1) {
      resultText += '\n'
    }
  }

  return resultText
}
