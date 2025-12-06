import AppRoutes from "./routes";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastProvider } from "./providers/ToastProvider";

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppRoutes />
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
