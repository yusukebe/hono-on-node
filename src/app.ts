import { Hono } from 'hono'
import { prettyJSON } from 'hono/pretty-json'
import { logger } from 'hono/logger'

const app = new Hono()

app.use('*', logger())
app.use('*', prettyJSON())

app.get('/', (c) => c.html('<h1>This is Hono!</h1>'))
app.get('/hi', (c) => c.text('hi'))
app.get('/json', (c) => c.json({ node: 'js' }))
app.get('/redirect', (c) => c.redirect('/'))

export default app
