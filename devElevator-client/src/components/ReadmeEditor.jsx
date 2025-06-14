import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw"; // 👈 This is necessary

const ReadmeEditor = ({ initialContent }) => {
  const [markdown, setMarkdown] = useState(initialContent || "");

  // 📋 Copy to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(markdown);
    alert("Copied README to clipboard!");
  };

  // 📥 Download as README.md
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
    <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Markdown Editor */}
      <div>
        <h2 className="text-lg font-semibold mb-2">✏️ Edit README</h2>
        <textarea
          className="w-full h-[500px] border p-3 rounded font-mono text-sm resize-none"
          value={markdown}
          onChange={(e) => setMarkdown(e.target.value)}
        />
        {/* 🔘 Action Buttons */}
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={handleCopy}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
            📋 Copy to Clipboard
          </button>

          <button
            onClick={handleDownload}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition">
            📥 Download README
          </button>

          <button
            disabled
            className="bg-gray-400 text-white px-4 py-2 rounded cursor-not-allowed"
            title="Write access to GitHub not enabled">
            🚀 Push to GitHub (coming soon)
          </button>
        </div>
      </div>

      {/* Live Preview */}
      <div>
        <h2 className="text-lg font-semibold mb-2">🔍 Live Preview</h2>
        <div className="prose prose-sm max-w-none border p-4 h-[500px] overflow-y-auto rounded bg-white">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}>
            {markdown}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default ReadmeEditor;
