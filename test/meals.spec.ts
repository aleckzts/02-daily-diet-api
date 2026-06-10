import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { execSync } from 'node:child_process'
import request from 'supertest'
import { app } from '../src/app.js'

describe('Meals routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  it('should be able to create a new meal', async () => {
    const createUserResponse = await request(app.server).post('/user').send({
      name: 'New User',
      avatar: 'http://google.com/avatar.png',
    })

    const cookies = createUserResponse.get('Set-Cookie') ?? []

    await request(app.server)
      .post('/meals')
      .send({
        name: 'New Dish',
        description: 'This is a new dish',
        date: '02/06/2026',
        time: '19:00',
        included: true,
      })
      .set('Cookie', cookies)
      .expect(201)
  })

  it('should be able to get a all meals', async () => {
    const createUserResponse = await request(app.server).post('/user').send({
      name: 'New User',
      avatar: 'http://google.com/avatar.png',
    })

    const cookies = createUserResponse.get('Set-Cookie') ?? []

    await request(app.server)
      .post('/meals')
      .send({
        name: 'New Dish',
        description: 'This is a new dish',
        date: '02/06/2026',
        time: '19:00',
        included: true,
      })
      .set('Cookie', cookies)
      .expect(201)

    const listMealResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)
      .expect(200)

    expect(listMealResponse.body.meals).toEqual([
      expect.objectContaining({
        name: 'New Dish',
        description: 'This is a new dish',
        created_at: '02/06/2026 19:00',
        included: 1,
      }),
    ])
  })

  it('should be able to get a specific meals', async () => {
    const createUserResponse = await request(app.server).post('/user').send({
      name: 'New User',
      avatar: 'http://google.com/avatar.png',
    })

    const cookies = createUserResponse.get('Set-Cookie') ?? []

    await request(app.server)
      .post('/meals')
      .send({
        name: 'New Dish',
        description: 'This is a new dish',
        date: '02/06/2026',
        time: '19:00',
        included: true,
      })
      .set('Cookie', cookies)
      .expect(201)

    const listMealResponse = await request(app.server)
      .get('/meals/')
      .set('Cookie', cookies)
      .expect(200)

    const mealId = listMealResponse.body.meals[0].id

    const getMealResponse = await request(app.server)
      .get(`/meals/${mealId}`)
      .set('Cookie', cookies)
      .expect(200)

    expect(getMealResponse.body.meal).toEqual(
      expect.objectContaining({
        name: 'New Dish',
        description: 'This is a new dish',
        created_at: '02/06/2026 19:00',
        included: 1,
      }),
    )
  })

  it('should be able to delete a specific meals', async () => {
    const createUserResponse = await request(app.server).post('/user').send({
      name: 'New User',
      avatar: 'http://google.com/avatar.png',
    })

    const cookies = createUserResponse.get('Set-Cookie') ?? []

    await request(app.server)
      .post('/meals')
      .send({
        name: 'New Dish',
        description: 'This is a new dish',
        date: '02/06/2026',
        time: '19:00',
        included: true,
      })
      .set('Cookie', cookies)
      .expect(201)

    const listMealResponse = await request(app.server)
      .get('/meals/')
      .set('Cookie', cookies)
      .expect(200)

    const mealId = listMealResponse.body.meals[0].id

    await request(app.server)
      .del(`/meals/${mealId}`)
      .set('Cookie', cookies)
      .expect(204)
  })

  it('should be able to list all meals metrics', async () => {
    const createUserResponse = await request(app.server).post('/user').send({
      name: 'New User',
      avatar: 'http://google.com/avatar.png',
    })

    const cookies = createUserResponse.get('Set-Cookie') ?? []

    await request(app.server)
      .post('/meals')
      .send({
        name: 'New Dish in',
        description: 'This is a new dish in a diet',
        date: '01/06/2026',
        time: '19:00',
        included: true,
      })
      .set('Cookie', cookies)
      .expect(201)

    await request(app.server)
      .post('/meals')
      .send({
        name: 'New Dish out',
        description: 'This is a new dish out of a diet',
        date: '02/06/2026',
        time: '19:00',
        included: false,
      })
      .set('Cookie', cookies)
      .expect(201)

    await request(app.server)
      .post('/meals')
      .send({
        name: 'New Dish in',
        description: 'This is a new dish in a diet',
        date: '03/06/2026',
        time: '19:00',
        included: true,
      })
      .set('Cookie', cookies)
      .expect(201)

    await request(app.server)
      .post('/meals')
      .send({
        name: 'New Dish in',
        description: 'This is a new dish in a diet',
        date: '04/06/2026',
        time: '19:00',
        included: true,
      })
      .set('Cookie', cookies)
      .expect(201)

    await request(app.server)
      .post('/meals')
      .send({
        name: 'New Dish in',
        description: 'This is a new dish in a diet',
        date: '05/06/2026',
        time: '19:00',
        included: true,
      })
      .set('Cookie', cookies)
      .expect(201)

    const listUserResponse = await request(app.server)
      .get('/user')
      .set('Cookie', cookies)
      .expect(200)

    expect(listUserResponse.body.user).toEqual(
      expect.objectContaining({
        name: 'New User',
        avatar: 'http://google.com/avatar.png',
      }),
    )

    expect(listUserResponse.body.meals).toEqual(
      expect.objectContaining({
        totalMeals: 5,
        totalMealsOnDiet: 4,
        totalMealsOffDiet: 1,
        bestOnDietSequence: 3,
      }),
    )
  })
})
