import WebSocket from 'ws'
import * as Misskey from 'misskey-js'
import { createResultText, selectVisibility } from './utils.js'
import { consumeToken } from './rateLimit.js'
import {
  getDebugUserId,
  getMaxAmountOfCommandsPerRequest,
  getMaxAmountOfThrowsPerCommand,
  getServerUrl,
  getToken,
  isDebugMode,
} from './config.js'
import { DiceRollToken } from './roll/interface.js'
import { getDiceRollKit } from './roll/v1/index.js'
import { InvalidCommandError } from './roll/error.js'

const SERVER_URL = getServerUrl()
const TOKEN = getToken()

const isDebugging = isDebugMode()
const debugUserId = getDebugUserId()

if (!SERVER_URL || !TOKEN) {
  console.error('SERVER_URL and TOKEN are required')
  process.exit(1)
}

console.log('Connecting to server: ' + SERVER_URL)
if (isDebugging) {
  console.log(
    `You are in debug mode! Only messages from ${debugUserId} and same host will be processed!`
  )
}

const stream = new Misskey.Stream(SERVER_URL, { token: TOKEN }, { WebSocket })
const cli = new Misskey.api.APIClient({
  origin: SERVER_URL,
  credential: TOKEN,
})

const serverInfo = await cli.request('meta', { detail: true })
const userInfo = await cli.request('i', { detail: true })

const hostname = new URL(serverInfo.uri).hostname
const username = userInfo.username

console.log(`Logged in as ${username}@${hostname}`)

const mainChannel = stream.useChannel('main')
mainChannel.on('mention', async (data) => {
  try {
    const requestUsername = data.user.username
    const requestHostnameNullable = data.user.host
    if (isDebugging) {
      console.log(JSON.stringify(data))

      if (requestUsername !== debugUserId || requestHostnameNullable !== null) {
        return
      }
    }

    const requestHostname = requestHostnameNullable ?? hostname

    const text = data.text
      ?.replace(`@${username}@${hostname}`, '')
      .replace(`@${username}`, '')
    if (text === undefined) {
      return
    }

    const visibility = selectVisibility(data.visibility)
    if (visibility === undefined) {
      return
    }

    const rollKit = getDiceRollKit()
    const tokens: DiceRollToken[] = rollKit.parse(text)
    if (tokens.length <= 0) {
      return
    }

    const rateLimitResult = await consumeToken({
      user: requestUsername,
      host: requestHostname,
    })

    if (!rateLimitResult.pass) {
      if (rateLimitResult.notice) {
        cli.request('notes/create', {
          replyId: data.id,
          text: 'レートリミットに達しました。しばらく待ってからやり直してください！',
          visibility,
        })
      }

      if (rateLimitResult.blockType === 'user') {
        console.log(
          `Rate limit reached for user: ${requestUsername}@${requestHostname}`
        )
      } else if (rateLimitResult.blockType === 'host') {
        console.log(`Rate limit reached for host: ${requestHostname}`)
      }
      return
    }

    if (tokens.length > getMaxAmountOfCommandsPerRequest()) {
      cli.request('notes/create', {
        replyId: data.id,
        text: `一度に${getMaxAmountOfCommandsPerRequest()}個以上のコマンドを実行することはできません！`,
        visibility,
      })
      return
    }

    if (isDebugging) {
      console.log(JSON.stringify(tokens))
    }

    let resultText = ''
    for (const token of tokens) {
      const result = rollKit.perform(token)

      if (result.isFailure()) {
        if (result.error instanceof InvalidCommandError) {
          cli.request('notes/create', {
            replyId: data.id,
            text: `${result.error.message} <small>(${token.value})</small>`,
            visibility,
          })
        } else {
          console.error(result.error)
        }
        return
      }

      resultText += result.value.number
      if (result.value.detail !== undefined) {
        resultText += ` <small>(${result.value.detail})</small>`
      }

      resultText += '\n'
    }

    if (resultText.length <= 0) {
      return
    }

    const cw: string | undefined =
      resultText.length > 100 ? 'ながい' : undefined

    cli.request('notes/create', {
      replyId: data.id,
      text: resultText,
      visibility,
      cw,
    })
  } catch (e) {
    console.error(e)
  }
})
