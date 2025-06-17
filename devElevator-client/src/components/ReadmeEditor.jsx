import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { FaCopy, FaDownload } from "react-icons/fa";

const ReadmeEditor = ({ initialContent }) => {
  const [markdown, setMarkdown] = useState(initialContent || "");

  const handleCopy = () => {
    navigator.clipboard.writeText(markdown);
    alert("Copied README to clipboard!");
  };

  const handleDownload = () => {
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "README.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6 text-white">
      {/* Markdown Editor */}
      <div className="relative">
        <h2 className="text-lg font-semibold mb-2">✏️ Edit README</h2>
        <textarea
          className="w-full h-[500px] border p-3 rounded font-mono text-sm resize-none bg-slate-800 text-white"
          value={markdown}
          onChange={(e) => setMarkdown(e.target.value)}
        />
        <div className="absolute top-10 right-4 flex gap-1">
          <button
            onClick={handleCopy}
            title="Copy to clipboard"
            className="bg-slate-700 hover:bg-slate-600 p-2 rounded shadow-md transition">
            <FaCopy className="text-white text-lg" />
          </button>
          <button
            onClick={handleDownload}
            title="Download README"
            className="bg-slate-700 hover:bg-slate-600 p-2 rounded shadow-md transition">
            <FaDownload className="text-white text-lg" />
          </button>
        </div>
      </div>

      {/* Live Preview */}
      <div className="relative">
        <h2 className="text-lg font-semibold mb-2">🔍 Live Preview</h2>
        <div className="prose prose-sm max-w-none border p-4 h-[500px] overflow-y-auto rounded bg-slate-800 text-white">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}>
            {markdown}
          </ReactMarkdown>
        </div>
        <div className="absolute top-10 right-4 flex gap-1">
          <button
            onClick={handleCopy}
            title="Copy to clipboard"
            className="bg-slate-700 hover:bg-slate-600 p-2 rounded shadow-md transition">
            <FaCopy className="text-white text-lg" />
          </button>
          <button
            onClick={handleDownload}
            title="Download README"
            className="bg-slate-700 hover:bg-slate-600 p-2 rounded shadow-md transition">
            <FaDownload className="text-white text-lg" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReadmeEditor;
