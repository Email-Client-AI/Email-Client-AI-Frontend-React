import { useGoogleLogin } from "@react-oauth/google";
import type { CodeResponse } from "@react-oauth/google";
import { useAuth } from "../contexts/AuthContext";
import type {User} from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const handleSuccess = async (codeResponse: CodeResponse) => {
    if (!codeResponse.code) return;
    console.log("Authorization code:", codeResponse.code);

    try {
      const res = await fetch(`${backendUrl}/auth/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ code: codeResponse.code }),
      });

      if (!res.ok) {
        console.error("Backend error:", res.statusText);
        return;
      }
      const user = {};
      login(user as User);
      navigate("/dashboard"); 

    } catch (err) {
      console.error("Failed to login:", err);
    }
  };

  const googleScopes = import.meta.env.VITE_GOOGLE_SCOPES;

  const googleLogin = useGoogleLogin({
    flow: 'auth-code',
    // ux_mode: 'redirect',
    scope: googleScopes,
    // redirect_uri: `${import.meta.env.VITE_GOOGLE_REDIRECT_URI}`,
    onSuccess: handleSuccess,
    onError: errorResponse => console.log(errorResponse),
  });


  return (
    
    <div>
      <h1 className="text-4xl font-bold text-red-500">
      Tailwind v4 working! 🔥
    </h1>
      <h1>Login</h1>
      <button onClick={() => googleLogin()}>
        Login with Google 🚀
      </button>
    </div>
  );
}
