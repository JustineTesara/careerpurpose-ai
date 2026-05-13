// src/pages/Login.js
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../firebase";

function Login() {
  async function handleGoogleLogin() {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      // Show the real Firebase error code
      alert(error.code + " — " + error.message);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 w-full max-w-md text-center">
        {/* Logo */}
        <div className="w-14 h-14 bg-violet-600 rounded-xl flex items-center justify-center mx-auto mb-6">
          <span className="text-white text-2xl">✦</span>
        </div>

        <h1 className="text-white text-3xl font-bold mb-2">CareerPurpose AI</h1>
        <p className="text-gray-400 text-sm mb-8">
          Your AI-powered career coach. Build resumes, prep for interviews, and
          land your dream job.
        </p>

        {/* Google Login Button */}
        <button
          onClick={handleGoogleLogin}
          className="w-full bg-white text-gray-900 font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-100 transition"
        >
          <img
            src="https://www.google.com/favicon.ico"
            alt="Google"
            className="w-5 h-5"
          />
          Continue with Google
        </button>

        <p className="text-gray-600 text-xs mt-6">
          Free to use · Powered by Gemini AI · No credit card needed
        </p>
      </div>
    </div>
  );
}

export default Login;
