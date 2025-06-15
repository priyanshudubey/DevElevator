import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

const ReadmePreview = ({ content }) => {
  if (!content) return null;

  return (
    <div className="mt-10 bg-white p-6 rounded shadow-md border">
      <h2 className="text-xl font-semibold mb-4 text-blue-700">
        📘 Generated README.md
      </h2>

      {/* Rendered Markdown with GitHub-style formatting */}
      <div className="prose prose-slate dark:prose-invert max-w-none bg-white p-6 rounded overflow-x-auto border">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}>
          {content}
        </ReactMarkdown>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex gap-4">
        <button
          onClick={() => {
            navigator.clipboard.writeText(content);
            const toast = document.createElement("div");
            toast.textContent = "Copied to clipboard!";
            toast.className =
              "fixed bottom-5 right-5 bg-green-600 text-white px-4 py-2 rounded shadow-lg z-50 animate-fade";
            document.body.appendChild(toast);
            setTimeout(() => document.body.removeChild(toast), 2000);
          }}
          className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900 text-sm">
          📋 Copy to Clipboard
        </button>

        <a
          href={`data:text/plain;charset=utf-8,${encodeURIComponent(content)}`}
          download="README.md"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm">
          📥 Download README
        </a>
      </div>
    </div>
  );
};

export default ReadmePreview;
