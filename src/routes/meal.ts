import type { FastifyInstance } from 'fastify'
import { knex } from '../database.js'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { checkUserIdExists } from '../middlewares/check-user-id-exists.js'

export async function MealsRoutes(app: FastifyInstance) {
  app.get('/', { preHandler: [checkUserIdExists] }, async (request) => {
    const { userId } = request.cookies

    const meals = await knex('meals').where('user_id', userId).select()

    return { meals }
  })

  //   app.get('/:id', { preHandler: [checkUserIdExists] }, async (request) => {
  //     const { sessionId } = request.cookies

  //     const getTransactionsParamsSchema = z.object({
  //       id: z.uuid(),
  //     })

  //     const { id } = getTransactionsParamsSchema.parse(request.params)

  //     const transaction = await knex('transactions')
  //       .where({
  //         id,
  //         session_id: sessionId,
  //       })
  //       .first()

  //     return {
  //       transaction,
  //     }
  //   })

  //   app.get('/summary', { preHandler: [checkUserIdExists] }, async (request) => {
  //     const { sessionId } = request.cookies

  //     const summary = await knex('transactions')
  //       .where('session_id', sessionId)
  //       .sum('amount', { as: 'amount' })
  //       .first()

  //     return { summary }
  //   })

  app.post('/', { preHandler: [checkUserIdExists] }, async (request, reply) => {
    const createMealBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      date: z.string(),
      time: z.string(),
      included: z.coerce.boolean(),
      //   included: z.enum(['true', 'false']),
    })

    const { name, description, date, time, included } =
      createMealBodySchema.parse(request.body)

    const userId = request.cookies.userId

    await knex('meals').insert({
      id: randomUUID(),
      name,
      description,
      created_at: `${date} ${time}`,
      included,
      user_id: userId,
    })

    return reply.status(201).send()
  })
}
