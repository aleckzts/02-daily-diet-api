import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { execSync } from 'node:child_process'
import request from 'supertest'
import { app } from '../src/app.js'

describe('Users routes', () => {
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

  it('should be able to create a new user', async () => {
    await request(app.server)
      .post('/user')
      .send({
        name: 'New User',
        avatar: 'http://google.com/avatar.png',
      })
      .expect(201)
  })

  it('should be able to list user data', async () => {
    const createUserResponse = await request(app.server).post('/user').send({
      name: 'New User',
      avatar: 'http://google.com/avatar.png',
    })

    const cookies = createUserResponse.get('Set-Cookie') ?? []

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
  })
})
