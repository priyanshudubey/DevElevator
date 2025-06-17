import React, { useEffect, useState } from "react";
import api from "../services/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const reposPerPage = 6;
  const navigate = useNavigate();

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

  useEffect(() => {
    fetchGitHubData();
  }, []);

  const indexOfLastRepo = currentPage * reposPerPage;
  const indexOfFirstRepo = indexOfLastRepo - reposPerPage;
  const currentRepos = repos.slice(indexOfFirstRepo, indexOfLastRepo);

  if (loading) return <div className="p-10 text-center">Loading...</div>;

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
            <p className="text-slate-400 text-sm">@{user.login}</p>
            <p className="text-slate-400 text-sm">
              {user.location || "🌍 Unknown"}
            </p>
          </div>
        </div>

        {/* User Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { label: "📧 Email", value: user.email || "Not public" },
            { label: "👥 Followers", value: user.followers },
            { label: "🔁 Following", value: user.following },
            { label: "📂 Public Repos", value: user.public_repos },
          ].map((stat, i) => (
            <Card
              key={i}
              className="bg-slate-800/60 text-white border-slate-700 shadow-md hover:shadow-blue-500 transition-transform transform hover:-translate-y-1 duration-300">
              <CardContent className="p-4">
                <p className="text-sm text-slate-400">{stat.label}</p>
                <p className="text-lg font-semibold">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card
            onClick={() => navigate("/readme-generator")}
            className="bg-slate-800/60 border-slate-700 hover:shadow-md hover:shadow-blue-500 transition-all cursor-pointer transform hover:-translate-y-1">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold text-white mb-2">
                📄 README Generator
              </h3>
              <p className="text-slate-400 text-sm">
                Generate clean and professional README files with AI for your
                GitHub repositories.
              </p>
            </CardContent>
          </Card>

          <Card
            onClick={() => navigate("/structure")}
            className="bg-slate-800/60 border-slate-700 hover:shadow-md hover:shadow-blue-500 transition-all cursor-pointer transform hover:-translate-y-1">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold text-white mb-2">
                📁 Folder Structure Visualizer
              </h3>
              <p className="text-slate-400 text-sm">
                Visualize and understand your project’s folder structure in a
                clean and elegant format.
              </p>
            </CardContent>
          </Card>
        </div>
        {/* Repo Section Heading */}
        <div className="mt-12 mb-4">
          <h2 className="text-2xl font-bold text-white">Your Repositories</h2>
          <p className="text-sm text-slate-400">
            A quick glance at all your GitHub projects.
          </p>
        </div>

        {/* Repo Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentRepos.map((repo) => (
            <Card
              key={repo.id}
              className="bg-slate-800/60 border-slate-700 transition-transform duration-300 transform hover:scale-[1.03] hover:shadow-md hover:shadow-blue-500  hover:brightness-110">
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
