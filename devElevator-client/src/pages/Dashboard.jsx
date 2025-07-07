import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import api from "@/services/api";
import Navbar from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const reposPerPage = 6;
  const CACHE_KEY = "github_user_data";
  const CACHE_EXPIRY_KEY = "github_user_data_expiry";
  const CACHE_TTL = 1000 * 60 * 60 * 6;
  const navigate = useNavigate();

  const fetchGitHubData = async () => {
    try {
      const userRes = await api.get("/github/user");
      const repoRes = await api.get("/github/repos");
      setUser(userRes.data.githubProfile);
      setRepos(repoRes.data);
    } catch (err) {
      console.error("Error fetching GitHub data:", err);
    } finally {
      setLoading(false);
    }
  };

  const saveToCache = (data) => {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    localStorage.setItem(CACHE_EXPIRY_KEY, Date.now().toString());
  };

  const getFromCache = () => {
    const expiry = localStorage.getItem(CACHE_EXPIRY_KEY);
    const now = Date.now();

    if (!expiry || now - parseInt(expiry) > CACHE_TTL) {
      localStorage.removeItem(CACHE_KEY);
      localStorage.removeItem(CACHE_EXPIRY_KEY);
      return null;
    }

    const data = localStorage.getItem(CACHE_KEY);
    return data ? JSON.parse(data) : null;
  };

  useEffect(() => {
    const cached = getFromCache();
    if (cached) {
      setUser(cached.githubProfile);
      setRepos(cached.repos);
      setLoading(false);
    } else {
      const fetchGitHubData = async () => {
        try {
          const userRes = await api.get("/github/user");
          const repoRes = await api.get("/github/repos");

          const dataToCache = {
            githubProfile: userRes.data.githubProfile,
            repos: repoRes.data,
          };
          saveToCache(dataToCache);

          setUser(dataToCache.githubProfile);
          setRepos(dataToCache.repos);
        } catch (err) {
          console.error("Error fetching GitHub data:", err);
          toast.error("Failed to load dashboard data");
        } finally {
          setLoading(false);
        }
      };
      fetchGitHubData();
    }
  }, []);

  const indexOfLastRepo = currentPage * reposPerPage;
  const indexOfFirstRepo = indexOfLastRepo - reposPerPage;
  const currentRepos = repos.slice(indexOfFirstRepo, indexOfLastRepo);

  if (loading)
    return (
      <div className="w-full mx-auto p-6 text-slate-200 bg-slate-900 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400 animate-pulse">
            Fetching your repositories...
          </p>
        </div>
      </div>
    );

  if (!user)
    return (
      <div className="w-full mx-auto p-6 text-slate-200 bg-slate-900 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-400 mb-4">
            ⚠️ Authentication Error
          </h2>
          <p className="text-slate-400">Not logged in or session expired</p>
        </div>
      </div>
    );

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
              Welcome back, {user.name || user.login}!
            </h1>
            <p className="text-slate-400 text-sm">@{user.login}</p>
            <p className="text-slate-400 text-sm">
              📍 {user.location || "Location not specified"}
            </p>
            {user.bio && (
              <p className="text-slate-300 text-sm mt-1 italic">{user.bio}</p>
            )}
          </div>
        </div>

        {/* User Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            {
              label: "📧 Email",
              value: user.email || "Not public",
              color: "hover:shadow-green-500",
            },
            {
              label: "👥 Followers",
              value: user.followers,
              color: "hover:shadow-blue-500",
            },
            {
              label: "🔁 Following",
              value: user.following,
              color: "hover:shadow-purple-500",
            },
            {
              label: "📂 Public Repos",
              value: user.public_repos,
              color: "hover:shadow-orange-500",
            },
          ].map((stat, i) => (
            <Card
              key={i}
              className={`bg-slate-800/60 text-white border-slate-700 shadow-md ${stat.color} transition-all duration-300 transform hover:-translate-y-1`}>
              <CardContent className="p-4">
                <p className="text-sm text-slate-400">{stat.label}</p>
                <p className="text-lg font-semibold">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Feature Cards */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">
            🚀 Developer Tools
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* README Generator Card */}
            <Card
              onClick={() => navigate("/readme-generator")}
              className="bg-slate-800/60 border-slate-700 hover:shadow-md hover:shadow-green-500 transition-all cursor-pointer transform hover:-translate-y-2 hover:scale-105 duration-300">
              <CardContent className="p-6">
                <div className="flex items-center mb-3">
                  <div className="text-3xl mr-3">📄</div>
                  <h3 className="text-xl font-semibold text-white">
                    README Generator
                  </h3>
                </div>
                <p className="text-slate-400 text-sm mb-4">
                  Generate clean and professional README files with AI for your
                  GitHub repositories. Perfect documentation made easy.
                </p>
                <div className="flex items-center text-green-400 text-sm font-medium">
                  <span>Generate README</span>
                  <span className="ml-2">→</span>
                </div>
              </CardContent>
            </Card>

            {/* Structure Viewer Card */}
            <Card
              onClick={() => navigate("/structure")}
              className="bg-slate-800/60 border-slate-700 hover:shadow-md hover:shadow-blue-500 transition-all cursor-pointer transform hover:-translate-y-2 hover:scale-105 duration-300">
              <CardContent className="p-6">
                <div className="flex items-center mb-3">
                  <div className="text-3xl mr-3">📁</div>
                  <h3 className="text-xl font-semibold text-white">
                    Structure Visualizer
                  </h3>
                </div>
                <p className="text-slate-400 text-sm mb-4">
                  Visualize and understand your project's folder structure in a
                  clean and elegant format. Perfect for documentation.
                </p>
                <div className="flex items-center text-blue-400 text-sm font-medium">
                  <span>View Structure</span>
                  <span className="ml-2">→</span>
                </div>
              </CardContent>
            </Card>

            {/* LinkedIn Optimizer Card */}
            <Card
              onClick={() => navigate("/linkedin-optimizer")}
              className="bg-slate-800/60 border-slate-700 hover:shadow-md hover:shadow-purple-500 transition-all cursor-pointer transform hover:-translate-y-2 hover:scale-105 duration-300">
              <CardContent className="p-6">
                <div className="flex items-center mb-3">
                  <div className="text-3xl mr-3">💼</div>
                  <h3 className="text-xl font-semibold text-white">
                    LinkedIn Optimizer
                  </h3>
                </div>
                <p className="text-slate-400 text-sm mb-4">
                  Upload your LinkedIn profile PDF and get AI-powered
                  optimization suggestions to improve your professional
                  visibility.
                </p>
                <div className="flex items-center text-purple-400 text-sm font-medium">
                  <span>Optimize Profile</span>
                  <span className="ml-2">→</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">
            ⚡ Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={() => navigate("/readme-generator")}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 p-4 h-auto flex flex-col items-center gap-2">
              <span className="text-2xl">📝</span>
              <span>Create README</span>
            </Button>

            <Button
              onClick={() => navigate("/structure")}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 p-4 h-auto flex flex-col items-center gap-2">
              <span className="text-2xl">🗂️</span>
              <span>View Structure</span>
            </Button>

            <Button
              onClick={() => navigate("/linkedin-optimizer")}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 p-4 h-auto flex flex-col items-center gap-2">
              <span className="text-2xl">🔗</span>
              <span>Optimize LinkedIn</span>
            </Button>
          </div>
        </div>

        {/* Repository Section */}
        <div className="mt-12 mb-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">
                📂 Your Repositories
              </h2>
              <p className="text-sm text-slate-400">
                A quick glance at all your GitHub projects ({repos.length}{" "}
                total)
              </p>
            </div>
            {user.html_url && (
              <Button
                onClick={() => window.open(user.html_url, "_blank")}
                className="bg-slate-700 hover:bg-slate-600 text-sm">
                View on GitHub ↗
              </Button>
            )}
          </div>
        </div>

        {/* Repository Grid */}
        {repos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentRepos.map((repo) => (
              <Card
                key={repo.id}
                className="bg-slate-800/60 border-slate-700 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-md hover:shadow-blue-500/50 hover:brightness-110 cursor-pointer"
                onClick={() => window.open(repo.html_url, "_blank")}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-blue-400 truncate flex-1 mr-2">
                      {repo.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-400 shrink-0">
                      <span>⭐ {repo.stargazers_count}</span>
                      <span>🍴 {repo.forks_count}</span>
                    </div>
                  </div>

                  <p className="text-sm text-slate-300 mb-3 line-clamp-2">
                    {repo.description || (
                      <i className="text-slate-500">No description available</i>
                    )}
                  </p>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">
                      {repo.language ? (
                        <span className="flex items-center">
                          <span className="w-2 h-2 rounded-full bg-blue-500 mr-1"></span>
                          {repo.language}
                        </span>
                      ) : (
                        "No language"
                      )}
                    </span>
                    <span className="text-slate-500">
                      Updated {new Date(repo.updated_at).toLocaleDateString()}
                    </span>
                  </div>

                  {repo.topics && repo.topics.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {repo.topics.slice(0, 3).map((topic, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-slate-700 text-xs rounded-full text-slate-300">
                          {topic}
                        </span>
                      ))}
                      {repo.topics.length > 3 && (
                        <span className="px-2 py-1 bg-slate-700 text-xs rounded-full text-slate-400">
                          +{repo.topics.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              No repositories found
            </h3>
            <p className="text-slate-400">
              Create your first repository on GitHub to get started!
            </p>
          </div>
        )}

        {/* Pagination */}
        {repos.length > reposPerPage && (
          <div className="flex justify-center items-center mt-8 gap-4">
            <Button
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}>
              ← Previous
            </Button>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-300">
                Page {currentPage} of {Math.ceil(repos.length / reposPerPage)}
              </span>
            </div>

            <Button
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              disabled={currentPage >= Math.ceil(repos.length / reposPerPage)}
              onClick={() => setCurrentPage((prev) => prev + 1)}>
              Next →
            </Button>
          </div>
        )}

        {/* Footer Stats */}
        <div className="mt-16 pt-8 border-t border-slate-700">
          <div className="text-center text-slate-400 text-sm">
            <p>
              GitHub Profile:{" "}
              <strong className="text-slate-300">{user.login}</strong> • Member
              since{" "}
              <strong className="text-slate-300">
                {new Date(user.created_at).getFullYear()}
              </strong>
            </p>
            {user.company && (
              <p className="mt-1">
                Working at{" "}
                <strong className="text-slate-300">{user.company}</strong>
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
