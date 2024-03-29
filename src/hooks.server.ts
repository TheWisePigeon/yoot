import { redirect, type Handle } from "@sveltejs/kit";
import kv from "$lib/kv"
import type { User } from "./app";
import sql from "$lib/db";

export const handle: Handle = async ({ event, resolve }) => {
  if (event.url.pathname.startsWith('/console') ||event.url.pathname.startsWith('/api')) {
    const { cookies } = event
    const session_id = cookies.get("session") ?? ""
    const user = await kv.get(session_id)
    if (!user) {
      throw redirect(302, "/login")
    }
    const current_user = JSON.parse(user) as User
    const [db_user] = await sql`select id from users where id=${current_user.id}`
    if(!db_user){
      throw redirect(302, "/login")
    }
    event.locals.user = current_user
  }
  return await resolve(event)
}
