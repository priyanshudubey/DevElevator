import React, { useState, useEffect } from "react";
import api from "../services/api";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import ReadmeEditor from "../components/ReadmeEditor";
import Navbar from "@/components/Navbar";
import RoastPopup from "../components/RoastPopup";

const ReadmeGenerator = () => {
  const [repos, setRepos] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [generatedReadme, setGeneratedReadme] = useState("");
  const [readmeLoading, setReadmeLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filteredRepos, setFilteredRepos] = useState([]);
  const [showRoast, setShowRoast] = useState(false);
  const [roastMessage, setRoastMessage] = useState("");
  const [requestsLeft, setRequestsLeft] = useState(3);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [resetTimeText, setResetTimeText] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);

  const LIMIT = 10;
  const DAY_MS = 12 * 60 * 60 * 1000;

  useEffect(() => {
    const fetchRepos = async () => {
      try {
        const res = await api.get("/github/repos");
        setRepos(res.data);
      } catch (err) {
        console.error("Failed to fetch repos", err);
      }
    };
    fetchRepos();

    const usage = JSON.parse(localStorage.getItem("readmeUsage")) || {
      count: 0,
      lastReset: Date.now(),
      readmeResetAt: Date.now() + DAY_MS,
    };
    const timeSinceReset = Date.now() - usage.lastReset;
    if (timeSinceReset > DAY_MS) {
      usage.count = 0;
      usage.lastReset = Date.now();
      usage.readmeResetAt = usage.lastReset + DAY_MS;
      localStorage.setItem("readmeUsage", JSON.stringify(usage));
    }
    if (
      usage.count >= LIMIT &&
      (!usage.readmeResetAt || usage.readmeResetAt < Date.now())
    ) {
      usage.readmeResetAt = Date.now() + DAY_MS;
      localStorage.setItem("readmeUsage", JSON.stringify(usage));
    }
    setRequestsLeft(LIMIT - usage.count);
    if (usage.count >= LIMIT) {
      const remaining = usage.readmeResetAt - Date.now();
      setCooldownRemaining(remaining);
      setResetTimeText(new Date(usage.readmeResetAt).toLocaleString());
    }
  }, []);

  useEffect(() => {
    if (cooldownRemaining > 0) {
      const interval = setInterval(() => {
        setCooldownRemaining((prev) => {
          if (prev <= 1000) {
            clearInterval(interval);
            setRequestsLeft(LIMIT);
            return 0;
          }
          return prev - 1000;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [cooldownRemaining]);

  useEffect(() => {
    // Only auto-close rate limit popups when cooldown ends
    if (cooldownRemaining <= 0 && showRoast && roastMessage === "limit") {
      setShowRoast(false);
    }
    // Do NOT auto-close "random" (success) popups - let user close manually
  }, [cooldownRemaining, showRoast, roastMessage]);

  const roastMessages = [
    "You hit rate limit faster than my girlfriend hit the 'block' button. 🧊",
    "Every time you click generate, my bank account cries a little louder.",
    "If I had a rupee for every README you generated, I still couldn’t afford OpenAI credits.",
    "Thanks to you, I’m now applying for jobs on websites even my ex won’t visit.",
    "You’ve drained more tokens than I have emotional support left. Respect. 🙏",
    "She said, 'It’s not you, it’s your credit balance.' Now both are gone. 💔",
    "Click again and I swear I’ll start selling kidney-themed NFTs to survive.",
    "I rate-limited the app to protect the world from *you* — and my bank from overdraft.",
    "You used all your README requests, and I used all my hope for getting hired.",
    "At this point, I’m not a developer. I’m just a broke guy with dreams and 0 API credits.",
    "You thought you were using a free tool. Nah bro, you're freeloading through my heartbreak.",
    "Your clicking speed has officially outpaced my career progression. Impressive.",
    "Even OpenAI called. They said: ‘Tell that guy to chill. We’re not Google.’",
    "You're not just rate-limited. You're banned from my future wedding guest list.",
    "Every README you generate pushes me closer to starting a podcast about rock bottom.",
  ];

  const [roastIndex] = useState(() =>
    Math.floor(Math.random() * roastMessages.length)
  );
  const roast = roastMessages[roastIndex];

  const handleReadmeGenerate = async () => {
    if (!selectedRepo) return alert("Please select a repository first.");

    const usage = JSON.parse(localStorage.getItem("readmeUsage")) || {
      count: 0,
      lastReset: Date.now(),
    };

    const timeSinceReset = Date.now() - usage.lastReset;
    if (timeSinceReset > DAY_MS) {
      usage.count = 0;
      usage.lastReset = Date.now();
      usage.readmeResetAt = usage.lastReset + DAY_MS;
    }

    if (usage.count >= LIMIT) {
      if (!usage.readmeResetAt || usage.readmeResetAt < Date.now()) {
        usage.readmeResetAt = Date.now() + DAY_MS;
        localStorage.setItem("readmeUsage", JSON.stringify(usage));
      }
      setRequestsLeft(0);
      const remaining = usage.readmeResetAt - Date.now();
      setCooldownRemaining(remaining);
      setResetTimeText(new Date(usage.readmeResetAt).toLocaleString());
      setRoastMessage("limit");
      setShowRoast(true);
      localStorage.setItem("readmeUsage", JSON.stringify(usage));
      return;
    }

    const { name, owner } = selectedRepo;
    setReadmeLoading(true);
    try {
      const res = await api.post("/readme/generate", {
        repoName: name,
        owner: owner.login,
      });
      const fixedReadme = fixGithubImageUrls(
        res.data.readme,
        owner.login,
        name
      );
      setGeneratedReadme(fixedReadme);
      usage.count++;
      if (res.data.readmeResetAt) {
        usage.readmeResetAt = new Date(res.data.readmeResetAt).getTime();
        setResetTimeText(new Date(usage.readmeResetAt).toLocaleString());
      }
      localStorage.setItem("readmeUsage", JSON.stringify(usage));
      setRequestsLeft(LIMIT - usage.count);
      setRoastMessage("random");
      setShowRoast(true);
      if (usage.count >= LIMIT) {
        setCooldownRemaining(usage.readmeResetAt - Date.now());
      }
    } catch (err) {
      console.error("README generation failed", err);
      if (
        err.response &&
        (err.response.status === 429 ||
          (err.response.data &&
            err.response.data.error === "Rate limit reached"))
      ) {
        setRoastMessage("limit");
        setShowRoast(true);
        setRequestsLeft(0);

        usage.count = LIMIT;

        if (err.response.data && err.response.data.readmeResetAt) {
          usage.readmeResetAt = new Date(
            err.response.data.readmeResetAt
          ).getTime();
          setResetTimeText(new Date(usage.readmeResetAt).toLocaleString());
          setCooldownRemaining(usage.readmeResetAt - Date.now());
        } else {
          // Fallback: set to 24h from now
          usage.readmeResetAt = Date.now() + DAY_MS;
          setResetTimeText(new Date(usage.readmeResetAt).toLocaleString());
          setCooldownRemaining(DAY_MS);
        }
        localStorage.setItem("readmeUsage", JSON.stringify(usage));
      } else {
        alert("Failed to generate README. Check server logs.");
      }
    } finally {
      setReadmeLoading(false);
    }
  };

  const fixGithubImageUrls = (readmeText, owner, repoName, branch = "main") => {
    // Fix absolute GitHub blob URLs to raw URLs
    let fixed = readmeText.replace(
      /https:\/\/github\.com\/(.*?)\/(.*?)\/blob\/(.*?)\/(.*?\.(png|jpg|jpeg|gif|svg|webp))/g,
      "https://raw.githubusercontent.com/$1/$2/$3/$4"
    );

    // Fix relative image paths to GitHub raw URLs
    if (owner && repoName) {
      fixed = fixed.replace(
        /!\[([^\]]*)\]\((?!https?:\/\/)([^)]+\.(png|jpg|jpeg|gif|svg|webp))\)/gi,
        (match, altText, imagePath) => {
          // Remove leading ./ if present
          const cleanPath = imagePath.replace(/^\.\//, "");
          const rawUrl = `https://raw.githubusercontent.com/${owner}/${repoName}/${branch}/${cleanPath}`;
          return `![${altText}](${rawUrl})`;
        }
      );
    }

    return fixed;
  };

  const formatTime = (ms) => {
    const hrs = Math.floor(ms / 3600000);
    const mins = Math.floor((ms % 3600000) / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    return `${hrs}h ${mins}m ${secs}s`;
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".search-container")) {
        setFilteredRepos([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <Navbar />
      <div className="max-full mx-auto p-6 text-white bg-slate-900 min-h-screen">
        <h1 className="text-3xl font-bold mb-6">🧾 Generate README</h1>

        <Card className="mb-8 bg-slate-800/60 border-slate-700 overflow-visible">
          <CardContent className="p-6">
            <div className="relative search-container">
              <Input
                className="bg-slate-700 text-white border-slate-600"
                placeholder="Search a repo..."
                value={searchText}
                onChange={(e) => {
                  const q = e.target.value.toLowerCase();
                  setSearchText(e.target.value);
                  setFilteredRepos(
                    repos.filter((r) => r.name.toLowerCase().includes(q))
                  );
                  setActiveIndex(-1); // Reset keyboard focus
                }}
                onKeyDown={(e) => {
                  if (filteredRepos.length === 0) return;

                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setActiveIndex((prev) =>
                      prev < filteredRepos.length - 1 ? prev + 1 : 0
                    );
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setActiveIndex((prev) =>
                      prev > 0 ? prev - 1 : filteredRepos.length - 1
                    );
                  } else if (e.key === "Enter" && activeIndex >= 0) {
                    e.preventDefault();
                    const selected = filteredRepos[activeIndex];
                    setSelectedRepo(selected);
                    setSearchText(selected.name);
                    setFilteredRepos([]);
                    setActiveIndex(-1);
                  }
                }}
              />

              {searchText && filteredRepos.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-50 mt-1">
                  <div className="max-h-48 overflow-y-auto rounded border border-slate-600 bg-slate-700 shadow-lg">
                    <ul className="text-sm text-white divide-y divide-slate-600">
                      {filteredRepos.map((repo, idx) => (
                        <li
                          key={repo.id}
                          onClick={() => {
                            setSelectedRepo(repo);
                            setSearchText(repo.name);
                            setFilteredRepos([]);
                            setActiveIndex(-1);
                          }}
                          className={`p-2 cursor-pointer transition-all ${
                            selectedRepo?.id === repo.id
                              ? "bg-blue-500/20"
                              : idx === activeIndex
                              ? "bg-blue-500/10"
                              : "hover:bg-blue-500/10"
                          }`}>
                          {repo.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            <Button
              className="mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              onClick={handleReadmeGenerate}
              disabled={readmeLoading || requestsLeft <= 0}>
              {readmeLoading
                ? "Generating..."
                : requestsLeft <= 0
                ? `Rate limit reached`
                : "Generate README"}
            </Button>

            {cooldownRemaining > 0 && (
              <>
                <p className="text-sm text-red-400 mt-2">
                  Available again at: {resetTimeText}
                </p>
                <div className="flex items-start gap-3 text-amber-300 bg-[#1f1b14] border border-amber-500 rounded-xl p-4 mt-4 shadow-md shadow-amber-700/20">
                  <div className="text-xl animate-bounce">🔥</div>
                  <div className="text-xl font-semibold leading-snug">
                    {roast}
                  </div>
                </div>
              </>
            )}

            {selectedRepo && (
              <p className="text-sm text-green-400 mt-2">
                Selected Repo: <strong>{selectedRepo.name}</strong>
              </p>
            )}
          </CardContent>
        </Card>

        {generatedReadme && (
          <Card className="mb-8 bg-slate-800/60 border-slate-700">
            <CardContent className="p-4">
              <ReadmeEditor initialContent={generatedReadme} />
            </CardContent>
          </Card>
        )}

        {showRoast && (
          <RoastPopup
            onClose={() => setShowRoast(false)}
            remaining={requestsLeft}
            disabledUntil={
              cooldownRemaining > 0 ? Date.now() + cooldownRemaining : null
            }
          />
        )}

        {/* Add this button temporarily for testing */}
        {process.env.NODE_ENV === "development" && (
          <Button
            onClick={() => {
              localStorage.removeItem("readmeUsage");
              window.location.reload();
            }}
            className="mt-2 bg-red-600 hover:bg-red-700 text-xs">
            🔧 Reset Rate Limit (Dev)
          </Button>
        )}
      </div>
    </>
  );
};

export default ReadmeGenerator;
