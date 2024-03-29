import type { PageServerLoad } from "./$types";
import sql from "$lib/db";
import { fail, type Actions } from "@sveltejs/kit";

type Share = {
  share_id: string
  project_name: string
  project_owner: string
  is_sharer: boolean
  sharer_email: string
  sharee_email: string
}

export const load: PageServerLoad = async ({ locals }) => {
  const { user } = locals
  const shares: Share[] = await sql`
    SELECT
      s.id AS share_id,
      s.permissions AS share_permissions,
      p.name AS project_name,
      u.id AS project_owner,
      CASE WHEN u.id = ${user.id} THEN true ELSE false END AS is_sharer,
      usharer.email AS sharer_email,
      usharee.email AS sharee_email
    FROM
      shares AS s 
    JOIN
      project AS p ON s.project = p.id
    JOIN
      users AS u ON p.owner = u.id
    JOIN
      users AS usharer ON s.sharer = usharer.id
    JOIN
      users AS usharee ON s.sharee = usharee.id
    WHERE s.sharee = ${user.id} OR s.sharer = ${user.id}
  `
  return {
    shares
  }
}

export const actions: Actions = {
  delete: async ({ request }) => {
    try {
      const data = await request.formData()
      const share = data.get("share")! as string
      await sql` delete from shares where id=${share}`
    } catch (err) {
      console.log(`Error while deleting share ${err}`)
      return fail(500)
    }
  }
}
