import type { FastifyInstance } from 'fastify'
import { knex } from '../database.js'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { checkUserIdExists } from '../middlewares/check-user-id-exists.js'

export async function usersRoutes(app: FastifyInstance) {
  app.get('/', { preHandler: [checkUserIdExists] }, async (request) => {
    const { userId } = request.cookies

    const user = await knex('users')
      .where({
        id: userId,
      })
      .first()

    return {
      user,
    }
  })

  // app.get('/summary', { preHandler: [checkUserIdExists] }, async (request) => {
  //   const { sessionId } = request.cookies

  //   const summary = await knex('transactions')
  //     .where('session_id', sessionId)
  //     .sum('amount', { as: 'amount' })
  //     .first()

  //   return { summary }
  // })

  app.post('/', async (request, reply) => {
    const createUserBodySchema = z.object({
      name: z.string(),
      avatar: z.string(),
    })

    const { name, avatar } = createUserBodySchema.parse(request.body)

    let userId = request.cookies.userId

    if (!userId) {
      userId = randomUUID()

      reply.cookie('userId', userId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
    } else {
      await knex('users').insert({
        id: userId,
        name,
        avatar,
      })
    }

    return reply.status(201).send()
  })
}
