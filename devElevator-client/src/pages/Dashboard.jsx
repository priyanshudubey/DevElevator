import React, { useEffect, useState } from "react";
import api from "../services/api";
import ResumeForm from "../components/ResumeForm";
import ResumePreview from "../components/ResumePreview";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [resume, setResume] = useState("");

  const handleResumeGenerate = async (data) => {
    try {
      const res = await api.post("/resume/generate", data);
      setResume(res.data.resume); // 👈 store it for preview
    } catch (err) {
      console.error("Resume generation failed:", err);
    }
  };

  useEffect(() => {
    const fetchGitHubData = async () => {
      try {
        const userRes = await api.get("/github/user");
        const repoRes = await api.get("/github/repos");

        setUser(userRes.data);
        setRepos(repoRes.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching GitHub data:", err);
        setLoading(false);
      }
    };

    fetchGitHubData();
  }, []);

  if (loading)
    return <div className="p-10 text-center">Loading your dashboard...</div>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* 🧑 Profile Section */}
      <div className="flex items-center gap-4 mb-6">
        <img
          src={user.avatar_url}
          alt="avatar"
          className="w-16 h-16 rounded-full"
        />
        <div>
          <h1 className="text-2xl font-bold">{user.name || user.login}</h1>
          <p className="text-sm text-gray-600">@{user.login}</p>
        </div>
      </div>

      {/* 📨 Basic Info */}
      <div className="bg-gray-100 p-4 rounded mb-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <p className="font-semibold text-gray-700">Email</p>
          <p>{user.email || "Not public"}</p>
        </div>
        <div>
          <p className="font-semibold text-gray-700">Location</p>
          <p>{user.location || "N/A"}</p>
        </div>
        <div>
          <p className="font-semibold text-gray-700">Followers</p>
          <p>{user.followers}</p>
        </div>
        <div>
          <p className="font-semibold text-gray-700">Public Repos</p>
          <p>{user.public_repos}</p>
        </div>
      </div>

      {/* 📦 Repositories */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4">Top Repositories</h2>

        <ul className="space-y-3">
          {(showAll ? repos : repos.slice(0, 3)).map((repo) => (
            <li
              key={repo.id}
              className="p-4 bg-white rounded shadow-sm border">
              <div className="flex justify-between items-center mb-1">
                <p className="font-bold text-blue-600">{repo.name}</p>
                <span className="text-xs text-gray-500">
                  ⭐ {repo.stargazers_count}
                </span>
              </div>
              <p className="text-sm text-gray-700">
                {repo.description || (
                  <span className="italic text-gray-400">No description</span>
                )}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Language: {repo.language || "N/A"}
              </p>
            </li>
          ))}
        </ul>

        {repos.length > 3 && (
          <button
            className="mt-4 text-sm text-blue-600 hover:underline"
            onClick={() => setShowAll(!showAll)}>
            {showAll ? "View Less" : "View More"}
          </button>
        )}
      </div>

      {/* 📄 Resume Generator Form */}
      {user && repos.length > 0 && (
        <ResumeForm
          user={user}
          repos={repos}
          onGenerate={handleResumeGenerate}
        />
      )}
      {resume && <ResumePreview content={resume} />}
    </div>
  );
};

export default Dashboard;
