import React, { useEffect, useState } from "react";
import api from "../services/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import LinkedInUpload from "@/components/LinkedInUpload";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [showLinkedInUpload, setShowLinkedInUpload] = useState(false);
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

  useEffect(() => {
    fetchGitHubData();
  }, []);

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
        } finally {
          setLoading(false);
        }
      };
      fetchGitHubData();
    }
  }, []);

  const handleLinkedInPDF = (file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    // 🚀 Send to backend API
    api
      .post("/linkedin/upload", formData)
      .then(() => {
        toast.success("PDF uploaded successfully!");
      })
      .catch(() => {
        toast.error("Failed to upload. Try again.");
      });
  };

  const indexOfLastRepo = currentPage * reposPerPage;
  const indexOfFirstRepo = indexOfLastRepo - reposPerPage;
  const currentRepos = repos.slice(indexOfFirstRepo, indexOfLastRepo);

  if (loading)
    return (
      <p className="text-gray-400 animate-pulse">
        Fetching your repositories...
      </p>
    );
  if (!user) return <div>⚠️ Not logged in or session expired</div>;

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
              {user.name || "Hey"}
            </h1>
            <p className="text-slate-400 text-sm">@{user.name || user.login}</p>
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
          <Card className="bg-slate-800/60 border-slate-700 hover:shadow-md hover:shadow-blue-500 transition-all cursor-pointer transform hover:-translate-y-1">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold text-white mb-2">
                📄 Upload LinkedIn Profile PDF
              </h3>
              <p className="text-slate-400 text-sm mb-4">
                Upload your LinkedIn profile PDF to generate a professional
                README and portfolio website.
              </p>
              <Button
                onClick={() => setShowLinkedInUpload((prev) => !prev)}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 mb-4 text-sm">
                {showLinkedInUpload ? "Cancel Upload" : "Upload PDF"}
              </Button>
              {showLinkedInUpload && (
                <LinkedInUpload onFileSelect={handleLinkedInPDF} />
              )}
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
