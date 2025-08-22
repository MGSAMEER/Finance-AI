import { UserProfile } from '@clerk/nextjs';

export default function ProfilePage() {
  return (
    <main className="p-6">
      <UserProfile />
    </main>
  );
}
