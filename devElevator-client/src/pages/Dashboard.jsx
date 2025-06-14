import React, { useEffect, useState } from "react";
import api from "../services/api";
import ResumeForm from "../components/ResumeForm";
import ResumePreview from "../components/ResumePreview";
import ReadmePreview from "../components/ReadmePreview";
import ReadmeEditor from "../components/ReadmeEditor";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [resume, setResume] = useState("");
  const [filteredRepos, setFilteredRepos] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [generatedReadme, setGeneratedReadme] = useState("");

  const handleReadmeGenerate = async () => {
    if (!selectedRepo) return alert("Please select a repository first.");

    const { name, owner } = selectedRepo;

    try {
      const res = await api.post("/readme/generate", {
        repoName: name,
        owner: owner.login, // 👈 very important
      });

      setGeneratedReadme(res.data.readme);

      console.log("AI Generated README:\n", res.data.readme);
      // Optionally display it in a modal or textarea
    } catch (err) {
      console.error("README generation failed:", err);
      alert("Failed to generate README. Check server logs.");
    }
  };

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
        {/* 📘 Readme Generator */}
        <div className="mt-16 bg-white p-6 rounded shadow-sm border">
          <h2 className="text-xl font-semibold mb-4 text-blue-700">
            🧾 Generate a Professional README
          </h2>

          <p className="mb-4 text-sm text-gray-600">
            Don’t let your project go unnoticed. Generate a clean, AI-crafted
            README for any of your repos.
          </p>

          <details className="mb-4">
            <summary className="cursor-pointer text-blue-600 underline text-sm">
              Search & select your repository
            </summary>
            <div className="mt-4">
              <input
                type="text"
                placeholder="Type to search repository..."
                className="w-full p-2 border rounded mb-3"
                onChange={(e) => {
                  const q = e.target.value.toLowerCase();
                  setFilteredRepos(
                    repos.filter((r) => r.name.toLowerCase().includes(q))
                  );
                }}
              />
              <ul className="max-h-40 overflow-y-auto border p-2 rounded text-sm">
                {filteredRepos?.map((repo) => (
                  <li
                    key={repo.id}
                    onClick={() => setSelectedRepo(repo)}
                    className="cursor-pointer hover:bg-gray-100 p-1 rounded">
                    {repo.name}
                  </li>
                ))}
              </ul>
            </div>
          </details>

          {selectedRepo && (
            <div className="text-sm text-green-700">
              Selected Repo: <strong>{selectedRepo.name}</strong>
            </div>
          )}

          <button
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={handleReadmeGenerate}>
            Generate README
          </button>
        </div>
        {generatedReadme && <ReadmeEditor initialContent={generatedReadme} />}

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
      {/* {user && repos.length > 0 && (
        <ResumeForm
          user={user}
          repos={repos}
          onGenerate={handleResumeGenerate}
        />
      )}
      {resume && <ResumePreview content={resume} />} */}
    </div>
  );
};

export default Dashboard;
