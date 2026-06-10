// eslint-disable-next-line
import { Knex } from 'knex'

declare module 'knex/types/tables' {
  export interface Tables {
    users: {
      id: string
      name: string
      created_at: string
    }
    meal: {
      id: string
      name: string
      description: string
      user_id: string
      created_at: string
    }
  }
}
