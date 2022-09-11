import { createServer, IncomingMessage, ServerResponse, Server } from 'node:http'
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
  serverOptions?: Object
}

type FetchCallback = (request: any) => Promise<any>

export const serve = (option: Options): Server => {
  const fetchCallback = option.fetch
  const requestListener = getRequestListener(fetchCallback)
  const server: Server = createServer(option.serverOptions || {}, requestListener)
  server.listen(option.port || 3000)
  return server
}

const getRequestListener = (fetchCallback: FetchCallback) => {
  return async (incoming: IncomingMessage, outgoing: ServerResponse) => {
    const method = incoming.method || 'GET'
    const url = `http://${incoming.headers.host}${incoming.url}`

    const headerRecord: Record<string, string> = {}
    for (const [k, v] of incoming.rawHeaders) {
      headerRecord[k] = v
    }

    const res: Response = await fetchCallback(
      new Request(url.toString(), {
        method: method,
        headers: headerRecord,
      })
    )

    const contentType = res.headers.get('content-type') || ''

    for (const [k, v] of res.headers) {
      outgoing.setHeader(k, v)
    }
    outgoing.statusCode = res.status

    if (res.body) {
      if (contentType.startsWith('text')) {
        outgoing.end(await res.text())
      } else if (contentType.startsWith('application/json')) {
        outgoing.end(await res.text())
      } else {
        for await (const chunk of res.body) {
          outgoing.write(chunk)
        }
        outgoing.end()
      }
    } else {
      outgoing.end()
    }
  }
}
