import React, { useEffect, useState, useRef } from "react";
import api from "../services/api";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import Navbar from "@/components/Navbar";
import { FileIcon, defaultStyles } from "react-file-icon";
import domtoimage from "dom-to-image";

const StructureViewer = () => {
  const [repos, setRepos] = useState([]);
  const [filteredRepos, setFilteredRepos] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [structure, setStructure] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [expandedPaths, setExpandedPaths] = useState({});
  const [copySuccess, setCopySuccess] = useState(false);
  const structureRef = useRef(null);

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
  }, []);

  const handleCopy = () => {
    if (!structureRef.current) return;
    const text = structureRef.current.innerText;
    navigator.clipboard.writeText(text).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000); // hide after 3 sec
    });
  };

  const handleDownload = () => {
    if (!structureRef.current) return;
    domtoimage.toPng(structureRef.current).then((dataUrl) => {
      const link = document.createElement("a");
      link.download = `${selectedRepo.name}-structure.png`;
      link.href = dataUrl;
      link.click();
    });
  };

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

  const handleViewStructure = async () => {
    if (!selectedRepo) return alert("Please select a repo");
    setLoading(true);
    try {
      const res = await api.post("/structure/tree", {
        repoName: selectedRepo.name,
        owner: selectedRepo.owner.login,
      });
      setStructure(res.data.tree); // Expecting structured data
    } catch (err) {
      console.error("Error fetching structure:", err);
      alert("Could not fetch structure");
    } finally {
      setLoading(false);
    }
  };

  const renderTree = (nodes, parentPath = "", siblingStack = []) => {
    if (!nodes) return null;

    return (
      <div style={{ whiteSpace: "pre", fontFamily: "monospace" }}>
        {nodes.map((node, index) => {
          const currentPath = `${parentPath}/${node.name}`;
          const isLast = index === nodes.length - 1;
          if (node.name === ".git") return null;

          // Build prefix lines for tree structure
          const prefix = siblingStack
            .map((hasSibling) => (hasSibling ? "│   " : "    "))
            .join("");
          const branch = isLast ? "└── " : "├── ";

          return (
            <div key={currentPath}>
              {node.type === "dir" ? (
                <div
                  className="cursor-pointer text-yellow-400 font-semibold"
                  onClick={() => {
                    setExpandedPaths((prev) => ({
                      ...prev,
                      [currentPath]: !prev[currentPath],
                    }));
                  }}>
                  <span style={{ whiteSpace: "pre" }}>{prefix + branch}</span>
                  <span className="mr-1">📁</span>
                  <span>{node.name}</span>
                </div>
              ) : (
                <div className="text-slate-300 font-mono flex items-center gap-2">
                  <span>{prefix + branch}</span>
                  <div
                    style={{
                      width: 10, // width and height for icon container
                      height: 10,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transform: "scale(1.5)",
                    }}>
                    <FileIcon
                      extension={node.name.split(".").pop()}
                      {...(defaultStyles[node.name.split(".").pop()] || {})}
                      size="80"
                    />
                  </div>
                  <span>{node.name}</span>
                </div>
              )}

              {/* Recursive render for child nodes */}
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

  const toggleExpand = (pathKey) => {
    setExpandedPaths((prev) => ({
      ...prev,
      [pathKey]: !prev[pathKey],
    }));
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
              }}
            />
            {searchText && filteredRepos.length > 0 && (
              <ScrollArea className="max-h-32 border mt-2 rounded border-slate-600">
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
              </ScrollArea>
            )}

            <Button
              className="mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              onClick={handleViewStructure}
              disabled={loading}>
              {loading ? "Loading..." : "View Structure"}
            </Button>
          </CardContent>
        </Card>

        {/* Display Folder Tree */}
        {structure && (
          <Card className="bg-slate-800/60 border-slate-700">
            <div className="flex gap-4 px-6 pt-6">
              <Button
                className={
                  "cursor-pointer bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                }
                onClick={() => expandAll(structure)}>
                Expand All
              </Button>
              <Button
                className={
                  "cursor-pointer bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                }
                onClick={collapseAll}>
                Collapse All
              </Button>
              <Button
                className={
                  "cursor-pointer bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                }
                onClick={handleCopy}>
                Copy
              </Button>
              <Button
                className={
                  "cursor-pointer bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                }
                onClick={handleDownload}>
                Download PNG
              </Button>
            </div>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-white">
                📁 {selectedRepo.name} Structure
              </h2>
              <div
                ref={structureRef}
                className="text-sm"
                style={{
                  color: "#e2e8f0", // text-slate-200
                  backgroundColor: "#0f172a", // bg-slate-900
                }}>
                {renderTree(structure)}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
};

export default StructureViewer;
