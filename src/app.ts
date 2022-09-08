import { Hono } from 'hono'
import { prettyJSON } from 'hono/pretty-json'

const app = new Hono()

app.use('*', prettyJSON())

app.get('/', (c) => c.html('<h1>This is Hono!</h1>'))
app.get('/hi', (c) => c.text('hi'))
app.get('/json', (c) => c.json({ node: 'js' }))

export default app
