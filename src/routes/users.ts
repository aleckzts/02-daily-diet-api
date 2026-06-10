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

    const totalMealsOnDiet = await knex('meals')
      .where({ user_id: userId, included: true })
      .count('id', { as: 'total' })
      .first()

    const totalMealsOffDiet = await knex('meals')
      .where({ user_id: userId, included: false })
      .count('id', { as: 'total' })
      .first()

    const totalMeals = await knex('meals')
      .where({ user_id: userId })
      .orderBy('created_at', 'desc')

    const { bestOnDietSequence } = totalMeals.reduce(
      (acc, meal) => {
        if (meal.included) {
          acc.currentSequence += 1
        } else {
          acc.currentSequence = 0
        }

        if (acc.currentSequence > acc.bestOnDietSequence) {
          acc.bestOnDietSequence = acc.currentSequence
        }

        return acc
      },
      { bestOnDietSequence: 0, currentSequence: 0 },
    )

    return {
      user,
      meals: {
        totalMeals: totalMeals.length,
        totalMealsOnDiet: totalMealsOnDiet?.total,
        totalMealsOffDiet: totalMealsOffDiet?.total,
        bestOnDietSequence,
      },
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
    }

    await knex('users').insert({
      id: userId,
      name,
      avatar,
    })

    return reply.status(201).send()
  })
}
