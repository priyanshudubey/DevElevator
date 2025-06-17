import React, { useEffect, useState } from "react";
import api from "../services/api";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import Navbar from "@/components/Navbar";
import { FileIcon, defaultStyles } from "react-file-icon";

const StructureViewer = () => {
  const [repos, setRepos] = useState([]);
  const [filteredRepos, setFilteredRepos] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [structure, setStructure] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");

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

  const renderTree = (nodes, level = 0) => {
    if (!nodes) return null;

    return (
      <ul className="pl-4 border-l border-slate-600">
        {nodes.map((node, index) => (
          <li
            key={index}
            className="my-1">
            <span
              className={`block pl-${level * 2} text-slate-200 ${
                node.type === "dir" ? "font-semibold" : "font-mono"
              }`}>
              {node.type === "dir" ? "📁" : "📄"} {node.name}
            </span>
            {node.children && renderTree(node.children, level + 1)}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <>
      <Navbar />
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
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-white">
                📁 {selectedRepo.name} Structure
              </h2>
              <div className="text-sm">{renderTree(structure)}</div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
};

export default StructureViewer;
