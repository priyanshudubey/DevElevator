import React from "react";

const ReadmePreview = ({ content }) => {
  if (!content) return null;

  return (
    <div className="mt-10 bg-white p-6 rounded shadow-md border">
      <h2 className="text-xl font-semibold mb-4 text-blue-700">
        📘 Generated README.md
      </h2>
      <pre className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed bg-gray-50 p-4 rounded overflow-x-auto">
        {content}
      </pre>

      <div className="mt-4 flex gap-4">
        <button
          onClick={() => navigator.clipboard.writeText(content)}
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
