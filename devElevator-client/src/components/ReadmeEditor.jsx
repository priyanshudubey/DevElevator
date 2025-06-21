import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { FaCopy, FaDownload } from "react-icons/fa";
import MarkdownPreview from "@uiw/react-markdown-preview";

const ReadmeEditor = ({ initialContent }) => {
  const [markdown, setMarkdown] = useState(initialContent || "");
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    setMarkdown(initialContent || "");
  }, [initialContent]);
  const handleCopy = () => {
    navigator.clipboard.writeText(markdown).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000); // hide after 3 sec
    });
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
          className="w-full h-[800px] border p-3 rounded font-mono text-sm resize-none bg-slate-800 text-white"
          value={markdown}
          onChange={(e) => setMarkdown(e.target.value)}
        />
        {copySuccess && (
          <div className="fixed top-20 right-160 bg-green-600 text-white px-4 py-2 rounded shadow-lg z-50 animate-fadeIn">
            ✅ Copied to clipboard!
          </div>
        )}
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
        <div className="overflow-y-auto h-[800px] max-w-none border rounded bg-white text-black p-6 list-disc list-inside markdown-preview">
          <MarkdownPreview
            source={markdown}
            wrapperElement={{
              "data-color-mode": "light",
            }}
            style={{
              fontSize: "0.95rem",
              lineHeight: "1.6",
            }}
          />
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
