import { useAuth } from "../contexts/AuthContext";

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div>
      <h1>Hello {user?.name}</h1>
      <img src={user?.picture} width={80} />
      <button onClick={logout}>Logout</button>
    </div>
  );
}
