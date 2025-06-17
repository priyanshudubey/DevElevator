import React, { useEffect, useState } from "react";
import api from "../services/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReadmeEditor from "../components/ReadmeEditor";
import Navbar from "../components/Navbar";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredRepos, setFilteredRepos] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [generatedReadme, setGeneratedReadme] = useState("");
  const [readmeLoading, setReadmeLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchText, setSearchText] = useState("");
  const reposPerPage = 6;

  const fetchGitHubData = async () => {
    try {
      const userRes = await api.get("/github/user");
      const repoRes = await api.get("/github/repos");
      setUser(userRes.data);
      setRepos(repoRes.data);
    } catch (err) {
      console.error("Error fetching GitHub data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReadmeGenerate = async () => {
    if (!selectedRepo) return alert("Please select a repository first.");

    const { name, owner } = selectedRepo;
    setReadmeLoading(true);
    try {
      const res = await api.post("/readme/generate", {
        repoName: name,
        owner: owner.login,
      });

      setGeneratedReadme(res.data.readme);
      console.log("AI Generated README:\n", res.data.readme);
    } catch (err) {
      console.error("README generation failed:", err);
      alert("Failed to generate README. Check server logs.");
    } finally {
      setReadmeLoading(false);
    }
  };

  useEffect(() => {
    fetchGitHubData();
  }, []);

  if (loading)
    return (
      <div className="p-10 text-center text-slate-300 bg-slate-900 min-h-screen">
        Loading dashboard...
      </div>
    );

  const indexOfLastRepo = currentPage * reposPerPage;
  const indexOfFirstRepo = indexOfLastRepo - reposPerPage;
  const currentRepos = repos.slice(indexOfFirstRepo, indexOfLastRepo);

  return (
    <>
      <Navbar />
      <div className="w-full mx-auto p-6 text-slate-200 bg-slate-900 min-h-screen">
        {/* User Info */}
        <div className="flex gap-6 items-center mb-10">
          <img
            src={user.avatar_url}
            alt="avatar"
            className="w-20 h-20 rounded-full border-4 border-blue-500 shadow-lg"
          />
          <div>
            <h1 className="text-3xl font-bold text-white">
              {user.name || user.login}
            </h1>
            <p className="text-blue-400 text-sm">@{user.login}</p>
            <p className="text-blue-400 text-sm">
              {user.location || "🌍 Unknown"}
            </p>
          </div>
        </div>

        {/* User Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "📧 Email", value: user.email || "Not public" },
            { label: "👥 Followers", value: user.followers },
            { label: "🔁 Following", value: user.following },
            { label: "📂 Public Repos", value: user.public_repos },
          ].map((stat, i) => (
            <Card
              key={i}
              className="bg-slate-800/60 text-white border-slate-700 shadow-md transition-transform duration-300 transform hover:scale-[1.04] hover:shadow-xl hover:border-purple-500 hover:brightness-110">
              <CardContent className="p-4">
                <p className="text-sm text-slate-400">{stat.label}</p>
                <p className="text-lg font-semibold">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* README Generator */}
        {/* README Generator */}
        <Card className="mb-8 bg-slate-800/60 border-slate-700">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-3 text-white">
              🧾 Generate a README
            </h2>

            {/* Search & Dropdown */}
            <div className="relative">
              <Input
                className="bg-slate-700 text-white border-slate-600"
                placeholder="Search a repo..."
                value={searchText}
                onChange={(e) => {
                  const q = e.target.value.toLowerCase();
                  setSearchText(e.target.value);
                  setFilteredRepos(
                    q.trim()
                      ? repos.filter((r) => r.name.toLowerCase().includes(q))
                      : []
                  );
                }}
              />

              {searchText && filteredRepos.length > 0 && (
                <div className="absolute z-50 w-full mt-1 max-h-48 overflow-y-auto bg-slate-800 border border-slate-600 rounded shadow-lg">
                  <ul className="text-sm text-white">
                    {filteredRepos.map((repo) => (
                      <li
                        key={repo.id}
                        onClick={() => {
                          setSelectedRepo(repo);
                          setSearchText(repo.name);
                          setFilteredRepos([]);
                        }}
                        className={`p-2 cursor-pointer hover:bg-blue-500/10 rounded transition-all ${
                          selectedRepo?.id === repo.id ? "bg-blue-500/20" : ""
                        }`}>
                        {repo.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Generate Button */}
            <Button
              className="mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              onClick={handleReadmeGenerate}
              disabled={readmeLoading}>
              {readmeLoading ? "Generating..." : "Generate README"}
            </Button>

            {selectedRepo && (
              <p className="text-sm text-green-400 mt-2">
                Selected Repo: <strong>{selectedRepo.name}</strong>
              </p>
            )}
          </CardContent>
        </Card>

        {/* README Editor */}
        {generatedReadme && (
          <Card className="mb-8 bg-slate-800/60 border-slate-700">
            <CardContent className="p-4">
              <ReadmeEditor initialContent={generatedReadme} />
            </CardContent>
          </Card>
        )}

        {/* Repo List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentRepos.map((repo) => (
            <Card
              key={repo.id}
              className="bg-slate-800/60 border-slate-700 transition-transform shadow-xl duration-300 transform hover:scale-[1.03] hover:shadow-l hover:border-purple-500 hover:brightness-110">
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-semibold text-blue-400">{repo.name}</h3>
                  <span className="text-xs text-slate-400">
                    ⭐ {repo.stargazers_count}
                  </span>
                </div>
                <p className="text-sm text-slate-300">
                  {repo.description || (
                    <i className="text-slate-500">No description</i>
                  )}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Language: {repo.language || "N/A"}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        {repos.length > reposPerPage && (
          <div className="flex justify-center mt-6 gap-4">
            <Button
              className="mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}>
              Previous
            </Button>
            <span className="text-sm font-medium self-center">
              Page {currentPage} of {Math.ceil(repos.length / reposPerPage)}
            </span>
            <Button
              className="mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              disabled={currentPage >= Math.ceil(repos.length / reposPerPage)}
              onClick={() => setCurrentPage((prev) => prev + 1)}>
              Next
            </Button>
          </div>
        )}
      </div>
    </>
  );
};

export default Dashboard;
