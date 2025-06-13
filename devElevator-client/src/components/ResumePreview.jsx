import React from "react";

const ResumePreview = ({ content }) => {
  if (!content) return null;

  return (
    <div className="mt-10 bg-white p-6 rounded shadow-md">
      <h2 className="text-xl font-bold mb-4 text-gray-800">
        📄 Generated Resume
      </h2>
      <pre className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
        {content}
      </pre>

      {/* Buttons */}
      <div className="mt-4 flex gap-4">
        <button
          onClick={() => navigator.clipboard.writeText(content)}
          className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900 text-sm">
          📋 Copy Resume
        </button>

        {/* Add PDF export next */}
      </div>
    </div>
  );
};

export default ResumePreview;
