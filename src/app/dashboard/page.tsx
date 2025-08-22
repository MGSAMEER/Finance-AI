import { auth } from '@clerk/nextjs/server';

export default async function DashboardPage() {
  const { userId, redirectToSignIn } = await auth();
  if (!userId) return redirectToSignIn();

  return <main className="p-6">Dashboard for user: {userId}</main>;
}
