import type { FastifyInstance } from 'fastify'
import { knex } from '../database.js'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { checkUserIdExists } from '../middlewares/check-user-id-exists.js'

export async function MealsRoutes(app: FastifyInstance) {
  app.get('/', { preHandler: [checkUserIdExists] }, async (request) => {
    const { userId } = request.cookies

    const meals = await knex('meals')
      .where('user_id', userId)
      .select()
      .orderBy('created_at', 'desc')

    return { meals }
  })

  app.get('/:id', { preHandler: [checkUserIdExists] }, async (request) => {
    const { userId } = request.cookies

    const getMealParamsSchema = z.object({
      id: z.uuid(),
    })

    const { id } = getMealParamsSchema.parse(request.params)

    const meal = await knex('meals')
      .where({
        id,
        user_id: userId,
      })
      .first()

    return {
      meal,
    }
  })

  app.delete(
    '/:id',
    { preHandler: [checkUserIdExists] },
    async (request, reply) => {
      const deleteMealParamsSchema = z.object({
        id: z.uuid(),
      })

      const { id } = deleteMealParamsSchema.parse(request.params)

      const meal = await knex('meals').where({ id }).first()

      if (!meal) {
        return reply.status(404).send({ error: 'Meal not found' })
      }

      await knex('meals').where({ id }).delete()

      return reply.status(204).send()
    },
  )

  app.post('/', { preHandler: [checkUserIdExists] }, async (request, reply) => {
    const createMealBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      date: z.string(),
      time: z.string(),
      included: z.boolean(),
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
