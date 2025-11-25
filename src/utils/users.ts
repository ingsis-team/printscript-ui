import {Pagination} from "./pagination.ts";

export type PaginatedUsers = Pagination & {
  users: User[]
}

export type User = {
  id: string,
  name: string,
  username: string,
  email?: string,
  nickname?: string,
  picture?: string,
  user_id?: string
}
