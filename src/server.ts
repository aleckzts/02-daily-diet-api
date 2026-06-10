import { app } from './app.js'
import { env } from './env.js'

app.addHook('preHandler', async (request) => {
  console.log(`[${request.method}] ${request.url}`)
})

app
  .listen({
    port: env.PORT,
  })
  .then(() => {
    console.log('HTTP Server Running')
  })
