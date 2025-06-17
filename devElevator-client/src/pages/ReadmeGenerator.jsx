import React, { useState, useEffect } from "react";
import api from "../services/api";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import ReadmeEditor from "../components/ReadmeEditor";
import Navbar from "@/components/Navbar";

const ReadmeGenerator = () => {
  const [repos, setRepos] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [generatedReadme, setGeneratedReadme] = useState("");
  const [readmeLoading, setReadmeLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filteredRepos, setFilteredRepos] = useState([]);

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
  }, []);

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
    } catch (err) {
      console.error("README generation failed", err);
      alert("Failed to generate README. Check server logs.");
    } finally {
      setReadmeLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="max-full mx-auto p-6 text-white bg-slate-900 min-h-screen">
        <h1 className="text-3xl font-bold mb-6">🧾 Generate README</h1>

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

        {generatedReadme && (
          <Card className="mb-8 bg-slate-800/60 border-slate-700">
            <CardContent className="p-4">
              <ReadmeEditor initialContent={generatedReadme} />
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
};

export default ReadmeGenerator;
