import { Request, Response } from '@edge-runtime/primitives'

const mock_types = {
  Request: Request,
  Response: Response,
}

// Mock
Object.assign(global, mock_types)

import type { Hono } from 'hono'
import * as http from 'node:http'

type Options = {
  port: number
}

export const serve = (app: Hono, options: Options = { port: 3000 }) => {
  const server = http.createServer(async (incoming, outgoing) => {
    const method = incoming.method || 'GET'
    const url = new URL(`http://localhost${incoming.url}`)
    const res = await app.request(url.toString(), { method: method })

    for (const key of res.headers.keys()) {
      outgoing.setHeader(key, res.headers.get(key))
    }
    outgoing.statusCode = res.status
    outgoing.end(await res.text())
  })
  server.listen(options.port || 3000)
}
