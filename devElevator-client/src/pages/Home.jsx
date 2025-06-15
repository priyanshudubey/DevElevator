import React from "react";

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-gray-50 text-center">
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center flex-grow px-6 py-24">
        <h1 className="text-5xl font-extrabold mb-4 text-gray-800">
          🚀 DevElevator
        </h1>
        <p className="text-lg text-gray-600 max-w-xl mb-8">
          Build your developer resume and portfolio in seconds — directly from
          your GitHub.
        </p>

        <a
          href="/api/auth/github"
          className="bg-black text-white px-8 py-3 text-sm rounded-md shadow hover:bg-gray-900 transition">
          Login with GitHub
        </a>

        <p className="text-sm text-gray-400 mt-4">
          No forms. No fluff. Just your code → your career.
        </p>
      </div>

      {/* Footer */}
      <footer className="text-xs text-gray-400 py-6">
        © {new Date().getFullYear()} DevElevator — Built with ❤️ by Priyanshu
      </footer>
    </div>
  );
};

export default Home;
