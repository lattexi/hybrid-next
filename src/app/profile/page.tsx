import { requireAuth } from "@/lib/authActions";

const Profile = async () => {
  await requireAuth();
  return (
    <main>
      <h1 className="text-4xl font-bold">Profile</h1>
      <p>{}</p>
    </main>
  );
};

export default Profile;
