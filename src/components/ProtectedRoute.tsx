import type { ReactNode } from "react";

export default function ProtectedRoute({ children }: { children: ReactNode }) {

  //if (!user) return <Navigate to="/login" replace />;

  return children;
}
