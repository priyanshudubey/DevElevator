import React, { useEffect, useState, useRef } from "react";
import api from "../services/api";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import Navbar from "@/components/Navbar";
import { FileIcon, defaultStyles } from "react-file-icon";
import domtoimage from "dom-to-image";
import RoastPopup from "../components/RoastPopup";

const StructureViewer = () => {
  const [repos, setRepos] = useState([]);
  const [filteredRepos, setFilteredRepos] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [structure, setStructure] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [expandedPaths, setExpandedPaths] = useState({});
  const [copySuccess, setCopySuccess] = useState(false);
  const [repoUrl, setRepoUrl] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const listRef = useRef(null);
  const structureRef = useRef(null);
  const searchInputRef = useRef(null);

  // Rate limiting states
  const [showRoast, setShowRoast] = useState(false);
  const [roastMessage, setRoastMessage] = useState("");
  const [requestsLeft, setRequestsLeft] = useState(3);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [resetTimeText, setResetTimeText] = useState("");

  const LIMIT = 10;
  const DAY_MS = 12 * 60 * 60 * 1000;

  // Export states
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);

  // Rate limiting useEffects
  useEffect(() => {
    const fetchRepos = async () => {
      try {
        const res = await api.get("/github/repos");
        setRepos(res.data);
      } catch (err) {
        console.error("Failed to load repos", err);
      }
    };

    fetchRepos();

    // Rate limiting logic
    const usage = JSON.parse(localStorage.getItem("structureUsage")) || {
      count: 0,
      lastReset: Date.now(),
      structureResetAt: Date.now() + DAY_MS,
    };
    const timeSinceReset = Date.now() - usage.lastReset;
    if (timeSinceReset > DAY_MS) {
      usage.count = 0;
      usage.lastReset = Date.now();
      usage.structureResetAt = usage.lastReset + DAY_MS;
      localStorage.setItem("structureUsage", JSON.stringify(usage));
    }
    if (
      usage.count >= LIMIT &&
      (!usage.structureResetAt || usage.structureResetAt < Date.now())
    ) {
      usage.structureResetAt = Date.now() + DAY_MS;
      localStorage.setItem("structureUsage", JSON.stringify(usage));
    }
    setRequestsLeft(LIMIT - usage.count);
    if (usage.count >= LIMIT) {
      const remaining = usage.structureResetAt - Date.now();
      setCooldownRemaining(remaining);
      setResetTimeText(new Date(usage.structureResetAt).toLocaleString());
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
  }, [cooldownRemaining, showRoast, roastMessage]);

  useEffect(() => {
    if (repoUrl) setSearchText("");
  }, [repoUrl]);

  useEffect(() => {
    if (searchText) setRepoUrl("");
  }, [searchText]);

  // Click outside handler for export dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        exportDropdownOpen &&
        !event.target.closest(".export-dropdown-container")
      ) {
        setExportDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [exportDropdownOpen]);

  // Roast messages
  const roastMessages = [
    "You're viewing structures faster than I can afford the API calls! 📂💸",
    "Another structure request? My wallet is emptier than your commit history! 🏗️😭",
    "You're exploring folders like it's Black Friday shopping! Slow down! 🛍️",
    "Every structure view costs me a cup of coffee. I'm running on fumes! ☕💀",
    "You've hit the limit! Even my file tree is tired. 🌳😴",
    "Structure viewer says: 'Please touch grass instead of folders.' 🌱",
    "You've explored more repos than I have job prospects! 📁📈",
    "Rate limit reached! Time to actually code instead of just looking! 💻",
  ];

  const [roastIndex] = useState(() =>
    Math.floor(Math.random() * roastMessages.length)
  );
  const roast = roastMessages[roastIndex];

  const handleViewStructure = async () => {
    // Check rate limit before making request
    const usage = JSON.parse(localStorage.getItem("structureUsage")) || {
      count: 0,
      lastReset: Date.now(),
    };

    const timeSinceReset = Date.now() - usage.lastReset;
    if (timeSinceReset > DAY_MS) {
      usage.count = 0;
      usage.lastReset = Date.now();
      usage.structureResetAt = usage.lastReset + DAY_MS;
    }

    if (usage.count >= LIMIT) {
      if (!usage.structureResetAt || usage.structureResetAt < Date.now()) {
        usage.structureResetAt = Date.now() + DAY_MS;
        localStorage.setItem("structureUsage", JSON.stringify(usage));
      }
      setRequestsLeft(0);
      const remaining = usage.structureResetAt - Date.now();
      setCooldownRemaining(remaining);
      setResetTimeText(new Date(usage.structureResetAt).toLocaleString());
      setRoastMessage("limit");
      setShowRoast(true);
      localStorage.setItem("structureUsage", JSON.stringify(usage));
      return;
    }

    setLoading(true);

    try {
      let repoName = "";
      let owner = "";

      // Case 1: Custom GitHub URL
      if (repoUrl) {
        const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
        if (!match) {
          alert("❌ Invalid GitHub URL format");
          setLoading(false);
          return;
        }
        owner = match[1];
        repoName = match[2];
      }
      // Case 2: Selected from list
      else if (selectedRepo) {
        owner = selectedRepo.owner.login;
        repoName = selectedRepo.name;
      }
      // Neither selected nor entered
      else {
        alert("Please select a repo or enter a valid URL");
        setLoading(false);
        return;
      }

      const res = await api.post("/structure/tree", {
        repoName,
        owner,
      });

      setStructure(res.data.tree);

      // Update usage count on success
      usage.count++;
      if (res.data.structureResetAt) {
        usage.structureResetAt = new Date(res.data.structureResetAt).getTime();
        setResetTimeText(new Date(usage.structureResetAt).toLocaleString());
      }
      localStorage.setItem("structureUsage", JSON.stringify(usage));
      setRequestsLeft(LIMIT - usage.count);
      setRoastMessage("random");
      setShowRoast(true);
      if (usage.count >= LIMIT) {
        setCooldownRemaining(usage.structureResetAt - Date.now());
      }
    } catch (err) {
      console.error("Error fetching structure:", err);
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
        if (err.response.data && err.response.data.structureResetAt) {
          usage.structureResetAt = new Date(
            err.response.data.structureResetAt
          ).getTime();
          setResetTimeText(new Date(usage.structureResetAt).toLocaleString());
          setCooldownRemaining(usage.structureResetAt - Date.now());
        } else {
          usage.structureResetAt = Date.now() + DAY_MS;
          setResetTimeText(new Date(usage.structureResetAt).toLocaleString());
          setCooldownRemaining(DAY_MS);
        }
        localStorage.setItem("structureUsage", JSON.stringify(usage));
      } else {
        alert("❌ Could not fetch structure");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!structureRef.current) return;
    const text = structureRef.current.innerText;
    navigator.clipboard.writeText(text).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    });
  };

  // Export functions
  const exportAsJSON = () => {
    if (!structure) return;
    const dataStr = JSON.stringify(structure, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${selectedRepo?.name || "structure"}-structure.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportAsText = () => {
    if (!structureRef.current) return;
    const text = structureRef.current.innerText;
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${selectedRepo?.name || "structure"}-structure.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportAsMarkdown = () => {
    if (!structure) return;

    const generateMarkdown = (nodes, depth = 0) => {
      let markdown = "";
      nodes.forEach((node) => {
        const indent = "  ".repeat(depth);
        const icon =
          node.type === "dir"
            ? getFolderIcon(node.name)
            : getFileIcon(node.name);
        markdown += `${indent}- ${icon} ${node.name}\n`;
        if (node.children && node.children.length > 0) {
          markdown += generateMarkdown(node.children, depth + 1);
        }
      });
      return markdown;
    };

    const markdownContent = `# ${
      selectedRepo?.name || "Repository"
    } Structure\n\n${generateMarkdown(structure)}`;
    const blob = new Blob([markdownContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${selectedRepo?.name || "structure"}-structure.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportAsPNG = () => {
    if (!structureRef.current) return;
    domtoimage
      .toPng(structureRef.current, {
        quality: 1,
        bgcolor: "#0f172a",
        style: {
          transform: "scale(2)",
          transformOrigin: "top left",
        },
      })
      .then((dataUrl) => {
        const link = document.createElement("a");
        link.download = `${selectedRepo?.name || "structure"}-structure.png`;
        link.href = dataUrl;
        link.click();
      })
      .catch((error) => {
        console.error("Error generating PNG:", error);
        alert("Failed to generate PNG. Please try again.");
      });
  };

  // Export dropdown component
  const ExportDropdown = () => (
    <div className="relative export-dropdown-container">
      <Button
        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
        onClick={() => setExportDropdownOpen(!exportDropdownOpen)}>
        📥 Export ▼
      </Button>
      {exportDropdownOpen && (
        <div className="absolute top-full left-0 mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-lg z-50 min-w-48">
          <button
            onClick={() => {
              exportAsPNG();
              setExportDropdownOpen(false);
            }}
            className="w-full text-left px-4 py-2 hover:bg-slate-700 text-white flex items-center gap-2">
            🖼️ PNG Image
          </button>
          <button
            onClick={() => {
              exportAsText();
              setExportDropdownOpen(false);
            }}
            className="w-full text-left px-4 py-2 hover:bg-slate-700 text-white flex items-center gap-2">
            📄 Text File
          </button>
          <button
            onClick={() => {
              exportAsMarkdown();
              setExportDropdownOpen(false);
            }}
            className="w-full text-left px-4 py-2 hover:bg-slate-700 text-white flex items-center gap-2">
            📝 Markdown
          </button>
          <button
            onClick={() => {
              exportAsJSON();
              setExportDropdownOpen(false);
            }}
            className="w-full text-left px-4 py-2 hover:bg-slate-700 text-white flex items-center gap-2">
            📋 JSON Data
          </button>
        </div>
      )}
    </div>
  );

  const expandAll = (nodes, path = "") => {
    let newExpanded = {};
    const recurse = (list, parent = "") => {
      list.forEach((node) => {
        const currentPath = `${parent}/${node.name}`;
        if (node.type === "dir") {
          newExpanded[currentPath] = true;
          if (node.children) recurse(node.children, currentPath);
        }
      });
    };
    recurse(nodes, path);
    setExpandedPaths(newExpanded);
  };

  const collapseAll = () => {
    setExpandedPaths({});
  };

  const renderTree = (nodes, parentPath = "", siblingStack = []) => {
    if (!nodes) return null;

    return (
      <div style={{ whiteSpace: "pre", fontFamily: "monospace" }}>
        {nodes.map((node, index) => {
          const currentPath = `${parentPath}/${node.name}`;
          const isLast = index === nodes.length - 1;
          if (node.name === ".git") return null;

          const prefix = siblingStack
            .map((hasSibling) => (hasSibling ? "│   " : "    "))
            .join("");
          const branch = isLast ? "└── " : "├── ";

          return (
            <div
              key={currentPath}
              data-path={currentPath}>
              {node.type === "dir" ? (
                <div
                  className="cursor-pointer font-semibold text-yellow-400"
                  onClick={() => {
                    setExpandedPaths((prev) => ({
                      ...prev,
                      [currentPath]: !prev[currentPath],
                    }));
                  }}>
                  <span style={{ whiteSpace: "pre" }}>{prefix + branch}</span>
                  <span className="mr-2">{getFolderIcon(node.name)}</span>
                  <span>{node.name}</span>
                </div>
              ) : (
                <div className="font-mono flex items-center gap-2 text-slate-300">
                  <span>{prefix + branch}</span>
                  <span className="text-lg">{getFileIcon(node.name)}</span>
                  <span>{node.name}</span>
                </div>
              )}

              {node.type === "dir" &&
                expandedPaths[currentPath] &&
                renderTree(node.children, currentPath, [
                  ...siblingStack,
                  !isLast,
                ])}
            </div>
          );
        })}
      </div>
    );
  };

  const getFileIcon = (filename) => {
    const ext = filename.split(".").pop()?.toLowerCase();
    const iconMap = {
      // Programming Languages
      js: "🟨",
      jsx: "⚛️",
      ts: "🔷",
      tsx: "⚛️",
      py: "🐍",
      java: "☕",
      cpp: "⚙️",
      c: "⚙️",
      cs: "🔷",
      php: "🐘",
      rb: "💎",
      go: "🐹",
      rs: "🦀",
      swift: "🍎",
      kotlin: "🎯",
      dart: "🎯",
      scala: "⚖️",
      r: "📊",

      // Web Technologies
      html: "🌐",
      css: "🎨",
      scss: "💅",
      sass: "💅",
      less: "💄",
      vue: "💚",
      svelte: "🧡",
      angular: "🔴",

      // Data & Config
      json: "📋",
      xml: "📄",
      yaml: "📝",
      yml: "📝",
      toml: "⚙️",
      ini: "⚙️",
      env: "🔐",
      config: "⚙️",

      // Documentation
      md: "📖",
      txt: "📄",
      pdf: "📕",
      doc: "📘",
      docx: "📘",
      readme: "📖",
      license: "📜",
      changelog: "📈",

      // Media
      png: "🖼️",
      jpg: "🖼️",
      jpeg: "🖼️",
      gif: "🖼️",
      svg: "🎨",
      webp: "🖼️",
      ico: "🖼️",
      bmp: "🖼️",
      mp4: "🎬",
      avi: "🎬",
      mov: "🎬",
      wmv: "🎬",
      mp3: "🎵",
      wav: "🎵",
      flac: "🎵",
      aac: "🎵",

      // Archives
      zip: "📦",
      rar: "📦",
      tar: "📦",
      gz: "📦",
      "7z": "📦",

      // Database
      sql: "🗄️",
      db: "🗄️",
      sqlite: "🗄️",
      mdb: "🗄️",

      // Build & Package
      package: "📦",
      lock: "🔒",
      dockerfile: "🐳",
      makefile: "🔨",
      gradle: "🐘",
      maven: "📦",
      npm: "📦",
      yarn: "🧶",

      // Special files
      gitignore: "🙈",
      gitattributes: "📝",
      editorconfig: "⚙️",
      prettierrc: "💄",
      eslintrc: "📏",
      babelrc: "🔄",
    };

    // Special filename handling
    const filename_lower = filename.toLowerCase();
    if (filename_lower.includes("dockerfile")) return "🐳";
    if (filename_lower.includes("makefile")) return "🔨";
    if (filename_lower.includes("package.json")) return "📦";
    if (filename_lower.includes("readme")) return "📖";
    if (filename_lower.includes("license")) return "📜";
    if (filename_lower.startsWith(".env")) return "🔐";

    return iconMap[ext] || "📄";
  };

  const getFolderIcon = (folderName) => {
    const folderIconMap = {
      src: "📂",
      source: "📂",
      lib: "📚",
      libs: "📚",
      components: "🧩",
      pages: "📄",
      views: "👁️",
      assets: "🎨",
      images: "🖼️",
      img: "🖼️",
      icons: "🎯",
      styles: "💅",
      css: "💅",
      scss: "💅",
      js: "🟨",
      javascript: "🟨",
      ts: "🔷",
      typescript: "🔷",
      config: "⚙️",
      configs: "⚙️",
      settings: "⚙️",
      utils: "🔧",
      helpers: "🤝",
      tools: "🔨",
      tests: "🧪",
      test: "🧪",
      __tests__: "🧪",
      spec: "🧪",
      docs: "📚",
      documentation: "📚",
      doc: "📚",
      public: "🌐",
      static: "🌐",
      dist: "📦",
      build: "🏗️",
      node_modules: "📦",
      vendor: "📦",
      packages: "📦",
      database: "🗄️",
      db: "🗄️",
      migrations: "🔄",
      api: "🔌",
      services: "⚙️",
      controllers: "🎮",
      models: "🏗️",
      schemas: "📋",
      types: "🏷️",
      hooks: "🪝",
      middleware: "🔗",
      plugins: "🔌",
      ".git": "📂",
      ".vscode": "💙",
      ".idea": "💡",
    };

    return folderIconMap[folderName.toLowerCase()] || "📁";
  };

  const handleSearchChange = (e) => {
    const inputValue = e.target.value;
    setSearchText(inputValue);

    if (inputValue.trim()) {
      const q = inputValue.toLowerCase();
      const filtered = repos.filter((r) => r.name.toLowerCase().includes(q));
      setFilteredRepos(filtered);
      setActiveIndex(filtered.length > 0 ? 0 : -1);
    } else {
      setFilteredRepos([]);
      setActiveIndex(-1);
    }
  };

  const handleSearchKeyDown = (e) => {
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
      const repo = filteredRepos[activeIndex];
      setSelectedRepo(repo);
      setSearchText(repo.name);
      setFilteredRepos([]);
      setActiveIndex(-1);
    }
  };

  return (
    <>
      <Navbar />
      {copySuccess && (
        <div className="fixed top-20 right-160 bg-green-600 text-white px-4 py-2 rounded shadow-lg z-50 animate-fadeIn">
          ✅ Copied to clipboard!
        </div>
      )}
      <div className="max-full mx-auto p-6 text-white bg-slate-900 min-h-screen">
        <h1 className="text-3xl font-bold mb-6 text-white">
          📂 Folder Structure Visualizer
        </h1>

        <Card className="mb-8 bg-slate-800/60 border-slate-700">
          <CardContent className="p-6">
            <div className="relative">
              <Input
                ref={searchInputRef}
                className="bg-slate-700 text-white border-slate-600"
                placeholder="Search a repo..."
                value={searchText}
                onChange={handleSearchChange}
                onKeyDown={handleSearchKeyDown}
                onBlur={(e) => {
                  if (!e.relatedTarget?.closest(".repo-dropdown")) {
                    setTimeout(() => setFilteredRepos([]), 150);
                  }
                }}
              />
              {searchText && filteredRepos.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-slate-800 border border-slate-600 rounded shadow-lg max-h-60 overflow-auto repo-dropdown">
                  <ul className="text-sm text-white">
                    {filteredRepos.map((repo, index) => (
                      <li
                        key={repo.id}
                        ref={index === activeIndex ? listRef : null}
                        onClick={() => {
                          setSelectedRepo(repo);
                          setSearchText(repo.name);
                          setFilteredRepos([]);
                        }}
                        className={`p-2 cursor-pointer rounded transition-all ${
                          selectedRepo?.id === repo.id ? "bg-blue-500/20" : ""
                        } ${
                          index === activeIndex
                            ? "bg-blue-700 text-white"
                            : "hover:bg-blue-500/10"
                        }`}>
                        {repo.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="mt-6">
              <p className="text-white text-sm mb-2">
                🔗 Or enter any public GitHub repo URL:
              </p>
              <Input
                className="bg-slate-700 text-white border-slate-600"
                placeholder="https://github.com/username/repo-name"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
              />
              {repoUrl && (
                <div className="mt-2 inline-block bg-yellow-500/10 border border-yellow-500 text-yellow-300 px-3 py-1 rounded text-sm">
                  Using public repo: <strong>{repoUrl}</strong>
                </div>
              )}
            </div>

            <Button
              className="mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              onClick={handleViewStructure}
              disabled={loading || requestsLeft <= 0}>
              {loading
                ? "Loading..."
                : requestsLeft <= 0
                ? `Rate limit reached`
                : "View Structure"}
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

        {structure && (
          <Card className="bg-slate-800/60 border-slate-700">
            <div className="flex gap-4 px-6 pt-6">
              <Button
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                onClick={() => expandAll(structure)}>
                📂 Expand All
              </Button>
              <Button
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                onClick={collapseAll}>
                📁 Collapse All
              </Button>
              <Button
                className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                onClick={handleCopy}>
                📋 Copy
              </Button>
              <ExportDropdown />
            </div>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-white">
                📁 {selectedRepo?.name || "Repository"} Structure
              </h2>
              <div
                ref={structureRef}
                className="text-sm"
                style={{
                  color: "#e2e8f0",
                  backgroundColor: "#0f172a",
                }}>
                {renderTree(structure)}
              </div>
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

        {process.env.NODE_ENV === "development" && (
          <Button
            onClick={() => {
              localStorage.removeItem("structureUsage");
              window.location.reload();
            }}
            className="mt-2 bg-red-600 hover:bg-red-700 text-xs">
            🔧 Reset Structure Limit (Dev)
          </Button>
        )}
      </div>
    </>
  );
};

export default StructureViewer;
