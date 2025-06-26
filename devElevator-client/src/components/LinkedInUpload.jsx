import React, { useState, useEffect } from "react";
import api from "../services/api";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";

const LinkedinUpload = () => {
  const [file, setFile] = useState(null);
  const [uploaded, setUploaded] = useState(false);
  const [uploadedFile, setUploadedFile] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) return toast.error("Please select a file first.");

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      const res = await api.post("/linkedin/upload", formData);
      toast.success("LinkedIn profile uploaded successfully!");
      setFile(null);
    } catch (err) {
      console.error("Upload error", err);
      toast.error("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await api.get("/linkedin/status");
        if (res.data.uploaded) {
          setUploaded(true);
          setUploadedFile(res.data.fileName);
        }
      } catch (err) {
        console.error("Status fetch error", err);
      }
    };
    fetchStatus();
  }, []);

  return (
    <div className="bg-slate-800/60 p-6 rounded-xl border border-slate-700 shadow-md mt-4">
      <h2 className="text-xl font-semibold text-white mb-2">
        📄 Upload Your LinkedIn Profile
      </h2>
      <p className="text-slate-400 text-sm mb-4">
        Upload your exported LinkedIn PDF. We'll use it to generate a
        professional portfolio.
      </p>
      <input
        type="file"
        accept=".pdf"
        onChange={(e) => setFile(e.target.files[0])}
        className="text-white file:bg-blue-600 file:text-white file:rounded file:p-2 mb-4"
      />
      <Button
        onClick={handleUpload}
        disabled={uploading}
        className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700">
        {uploading ? "Uploading..." : "Upload PDF"}
      </Button>
      {uploaded ? (
        <p className="text-green-400 mt-2 text-sm">
          ✅ LinkedIn profile uploaded: <strong>{uploadedFile}</strong>
        </p>
      ) : (
        <p className="text-yellow-300 mt-2 text-sm">
          ⚠️ No LinkedIn profile uploaded yet
        </p>
      )}
    </div>
  );
};

export default LinkedinUpload;
