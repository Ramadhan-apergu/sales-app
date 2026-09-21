import { redirect } from 'next/navigation'

export default async function Page({ params }) {
  const { role } = await params
  redirect(`/${role}/home`)
}
