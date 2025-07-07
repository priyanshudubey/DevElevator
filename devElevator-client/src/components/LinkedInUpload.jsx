import React, { useState, useEffect, useRef } from "react";
import api from "../services/api";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const LinkedinUpload = ({ onFileSelect }) => {
  const [file, setFile] = useState(null);
  const [uploaded, setUploaded] = useState(false);
  const [uploadedFile, setUploadedFile] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const navigate = useNavigate();

  // Add ref for the file input
  const fileInputRef = useRef(null);

  // File validation
  const validateFile = (selectedFile) => {
    if (!selectedFile) return false;

    // Check file type
    if (selectedFile.type !== "application/pdf") {
      toast.error("Please select a PDF file only.");
      return false;
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (selectedFile.size > maxSize) {
      toast.error("File size must be less than 10MB.");
      return false;
    }

    return true;
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && validateFile(selectedFile)) {
      setFile(selectedFile);
      // Call parent callback if provided
      if (onFileSelect) {
        onFileSelect(selectedFile);
      }
    } else {
      setFile(null);
      e.target.value = ""; // Clear the input
    }
  };

  const clearFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file first.");
      return;
    }

    if (!validateFile(file)) {
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      setUploadProgress(0);

      const res = await api.post("/linkedin/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(progress);
        },
      });

      // Update state after successful upload
      toast.success("LinkedIn profile uploaded successfully!");
      setUploaded(true);
      setUploadedFile(res.data.fileName || file.name);
      setFile(null);
      setUploadProgress(0);

      // Clear file input using ref
      clearFileInput();
    } catch (err) {
      console.error("Upload error:", err);

      // Better error handling
      if (err.response) {
        const message =
          err.response.data?.message ||
          err.response.data?.error ||
          "Upload failed. Please try again.";
        toast.error(message);
      } else if (err.request) {
        toast.error("Network error. Please check your connection.");
      } else {
        toast.error("Upload failed. Please try again.");
      }

      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    try {
      await api.delete("/linkedin/remove"); // ✅ Remove /api prefix
      setUploaded(false);
      setUploadedFile("");
      toast.success("File removed successfully!");
    } catch (err) {
      console.error("Remove error:", err);
      const message = err.response?.data?.error || "Failed to remove file.";
      toast.error(message);
    }
  };

  const handleDragEvents = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    handleDragEvents(e);
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files[0]) {
      const event = { target: { files } };
      handleFileSelect(event);
    }
  };

  const handleOpenOptimizer = () => {
    navigate("/linkedin-optimizer");
  };

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await api.get("/linkedin/status"); // ✅ Remove /api prefix
        if (res.data.uploaded) {
          setUploaded(true);
          setUploadedFile(res.data.fileName || "Unknown file");
        }
      } catch (err) {
        console.error("Status fetch error:", err);
        // Don't show error toast for status fetch failure
      }
    };

    fetchStatus();
  }, []);

  return (
    <div className="bg-slate-800/60 p-6 rounded-xl border border-slate-700 shadow-md mt-4">
      <h2 className="text-xl font-semibold text-white mb-2">
        📄 LinkedIn Profile Optimizer
      </h2>
      <p className="text-slate-400 text-sm mb-4">
        Upload and optimize your LinkedIn profile PDF. Get AI-powered
        suggestions to improve your visibility and professional appeal.
      </p>

      <div className="flex flex-col gap-4">
        <div className="p-4 bg-blue-500/10 border border-blue-500 rounded-lg">
          <h3 className="text-blue-300 font-medium mb-2">
            ✨ What you'll get:
          </h3>
          <ul className="text-slate-300 text-sm space-y-1">
            <li>• AI-powered profile analysis</li>
            <li>• Keyword optimization suggestions</li>
            <li>• Professional summary improvements</li>
            <li>• Skills and experience recommendations</li>
            <li>• Industry-specific insights</li>
          </ul>
        </div>

        <Button
          onClick={handleOpenOptimizer}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 text-lg rounded-xl shadow-lg transition-all duration-300">
          🚀 Open Profile Optimizer
        </Button>

        <p className="text-slate-500 text-xs text-center">
          Click above to access the full LinkedIn optimization suite
        </p>
      </div>
    </div>
  );
};

export default LinkedinUpload;
