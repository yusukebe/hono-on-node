import { createServer } from 'http'
import { Request, Response, Headers } from 'undici'

const mock_types = {
  Request: Request,
  Response: Response,
  Headers: Headers,
}

// Mock
Object.assign(global, mock_types)

type Options = {
  fetch: FetchCallback
  port?: number
}

type FetchCallback = (request: any) => Promise<any>

export const serve = (option: Options) => {
  const fetchCallback = option.fetch
  const server = createServer()

  server.on('request', async (incoming, outgoing) => {
    const method = incoming.method || 'GET'
    const url = new URL(`http://localhost${incoming.url}`)
    // TODO
    const res: Response = await fetchCallback(
      new Request(url.toString(), {
        method: method,
      })
    )

    for (const h of res.headers) {
      outgoing.setHeader(...h)
    }
    outgoing.statusCode = res.status
    // TODO
    outgoing.end(await res.text())
  })

  server.listen(option.port || 3000)
}
