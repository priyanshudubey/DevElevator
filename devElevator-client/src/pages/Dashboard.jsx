import React, { useEffect, useState } from "react";
import api from "../services/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReadmeEditor from "../components/ReadmeEditor";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredRepos, setFilteredRepos] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [generatedReadme, setGeneratedReadme] = useState("");
  const [readmeLoading, setReadmeLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
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

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  const indexOfLastRepo = currentPage * reposPerPage;
  const indexOfFirstRepo = indexOfLastRepo - reposPerPage;
  const currentRepos = repos.slice(indexOfFirstRepo, indexOfLastRepo);

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* User Info */}
      <div className="flex gap-6 items-center mb-10">
        <img
          src={user.avatar_url}
          alt="avatar"
          className="w-20 h-20 rounded-full border-4 border-blue-500 shadow-md"
        />
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            {user.name || user.login}
          </h1>
          <p className="text-gray-600 text-sm">@{user.login}</p>
          <p className="text-gray-500 text-sm">
            {user.location || "🌍 Unknown"}
          </p>
        </div>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">📧 Email</p>
            <p className="text-lg font-semibold">
              {user.email || "Not public"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">👥 Followers</p>
            <p className="text-lg font-semibold">{user.followers}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">🔁 Following</p>
            <p className="text-lg font-semibold">{user.following}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">📂 Public Repos</p>
            <p className="text-lg font-semibold">{user.public_repos}</p>
          </CardContent>
        </Card>
      </div>

      {/* README Generator */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-3">🧾 Generate a README</h2>
          <Input
            placeholder="Search a repo..."
            onChange={(e) => {
              const q = e.target.value.toLowerCase();
              setFilteredRepos(
                repos.filter((r) => r.name.toLowerCase().includes(q))
              );
            }}
          />
          <ScrollArea className="max-h-40 border mt-2 rounded">
            <ul className="text-sm">
              {filteredRepos.map((repo) => (
                <li
                  key={repo.id}
                  onClick={() => setSelectedRepo(repo)}
                  className={`p-2 cursor-pointer hover:bg-gray-100 rounded ${
                    selectedRepo?.id === repo.id ? "bg-blue-100" : ""
                  }`}>
                  {repo.name}
                </li>
              ))}
            </ul>
          </ScrollArea>
          <Button
            className="mt-4"
            onClick={handleReadmeGenerate}
            disabled={readmeLoading}>
            {readmeLoading ? "Generating..." : "Generate README"}
          </Button>
          {selectedRepo && (
            <p className="text-sm text-green-700 mt-2">
              Selected Repo: <strong>{selectedRepo.name}</strong>
            </p>
          )}
        </CardContent>
      </Card>

      {/* README Editor */}
      {generatedReadme && (
        <Card className="mb-8">
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
            className="hover:shadow-md">
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-1">
                <h3 className="font-semibold text-blue-600">{repo.name}</h3>
                <span className="text-xs text-gray-500">
                  ⭐ {repo.stargazers_count}
                </span>
              </div>
              <p className="text-sm text-gray-700">
                {repo.description || (
                  <i className="text-gray-400">No description</i>
                )}
              </p>
              <p className="text-xs text-gray-400 mt-1">
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
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}>
            Previous
          </Button>
          <span className="text-sm font-medium self-center">
            Page {currentPage} of {Math.ceil(repos.length / reposPerPage)}
          </span>
          <Button
            disabled={currentPage >= Math.ceil(repos.length / reposPerPage)}
            onClick={() => setCurrentPage((prev) => prev + 1)}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
