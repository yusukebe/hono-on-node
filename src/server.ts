import { createServer } from 'http'
import { Request, Response, Headers } from 'undici'

const mockTypes = {
  Request: Request,
  Response: Response,
  Headers: Headers,
}

// Mock
Object.assign(global, mockTypes)

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

    const headerRecord: Record<string, string> = {}
    let k = ''
    for (const h of incoming.rawHeaders) {
      if (k) {
        headerRecord[k] = h
        k = ''
      } else {
        k = h
      }
    }

    const res: Response = await fetchCallback(
      new Request(url.toString(), {
        method: method,
        headers: headerRecord,
      })
    )

    for (const h of res.headers) {
      outgoing.setHeader(...h)
    }
    outgoing.statusCode = res.status

    // TODO
    if (res.body) {
      for await (const chunk of res.body) {
        outgoing.write(chunk)
      }
    }
    outgoing.end()
  })

  server.listen(option.port || 3000)
}
