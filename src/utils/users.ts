import {Pagination} from "./pagination.ts";

export type PaginatedUsers = Pagination & {
  users: User[]
}

export type User = {
  user_id: string,
  email: string,
  name: string,
  nickname: string,
  picture: string
}
