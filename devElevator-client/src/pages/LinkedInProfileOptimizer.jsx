import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-hot-toast";
import api from "@/services/api";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const LinkedInProfileOptimizer = () => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [optimizedData, setOptimizedData] = useState(null);
  const [rateLimitInfo, setRateLimitInfo] = useState({
    remaining: 5,
    resetAt: null,
  }); // ✅ Initialize with default values

  // File upload states
  const [file, setFile] = useState(null);
  const [uploaded, setUploaded] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null); // ✅ Add missing ref

  const LIMIT = 5;
  const DAY_MS = 12 * 60 * 60 * 1000;

  // Initialize rate limiting
  useEffect(() => {
    const usage = JSON.parse(localStorage.getItem("linkedinUsage")) || {
      count: 0,
      lastReset: Date.now(),
      linkedinResetAt: Date.now() + DAY_MS,
    };

    const timeSinceReset = Date.now() - usage.lastReset;
    if (timeSinceReset > DAY_MS) {
      usage.count = 0;
      usage.lastReset = Date.now();
      usage.linkedinResetAt = usage.lastReset + DAY_MS;
      localStorage.setItem("linkedinUsage", JSON.stringify(usage));
    }

    if (
      usage.count >= LIMIT &&
      (!usage.linkedinResetAt || usage.linkedinResetAt < Date.now())
    ) {
      usage.linkedinResetAt = Date.now() + DAY_MS;
      localStorage.setItem("linkedinUsage", JSON.stringify(usage));
    }

    if (usage.count >= LIMIT) {
      const remaining = usage.linkedinResetAt - Date.now();
      setRateLimitInfo({
        remaining: 0,
        resetAt: usage.linkedinResetAt,
      });
    } else {
      setRateLimitInfo({
        remaining: LIMIT - usage.count,
        resetAt: null,
      });
    }

    // Check existing file status
    fetchFileStatus();
  }, []);

  // ✅ Fixed cooldown timer with proper null checking
  useEffect(() => {
    if (rateLimitInfo && rateLimitInfo.resetAt) {
      const interval = setInterval(() => {
        setRateLimitInfo((prev) => {
          if (!prev || !prev.resetAt) return prev;
          const remaining = prev.resetAt - Date.now();
          if (remaining <= 0) {
            clearInterval(interval);
            return {
              remaining: LIMIT,
              resetAt: null,
            };
          }
          return {
            ...prev,
            timeRemaining: Math.max(0, Math.ceil(remaining / 1000)),
          };
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [rateLimitInfo?.resetAt]);

  // Fetch existing file status
  const fetchFileStatus = async () => {
    try {
      const res = await api.get("/linkedin/status");
      if (res.data.uploaded) {
        setUploaded(true);
        setUploadedFile(res.data);
      }
    } catch (err) {
      console.error("Status fetch error:", err);
    }
  };

  // File validation
  const validateFile = (selectedFile) => {
    if (!selectedFile) return false;

    if (selectedFile.type !== "application/pdf") {
      toast.error("Please select a PDF file only.");
      return false;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (selectedFile.size > maxSize) {
      toast.error("File size must be less than 10MB.");
      return false;
    }

    return true;
  };

  // ✅ Add missing drag event handlers
  const handleDragEvents = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      const selectedFile = droppedFiles[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
      }
    }
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && validateFile(selectedFile)) {
      setFile(selectedFile);
    } else {
      setFile(null);
      e.target.value = "";
    }
  };

  // Clear file input
  const clearFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle file upload
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

      toast.success("LinkedIn profile uploaded successfully!");
      setUploaded(true);
      setUploadedFile(res.data);
      setFile(null);
      setUploadProgress(0);
      clearFileInput();
    } catch (err) {
      console.error("Upload error:", err);

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

  // Handle file removal
  const handleRemove = async () => {
    try {
      await api.delete("/linkedin/remove");
      setUploaded(false);
      setUploadedFile(null); // ✅ Set to null instead of empty string
      setOptimizedData(null);
      toast.success("File removed successfully!");
    } catch (err) {
      console.error("Remove error:", err);
      const message = err.response?.data?.error || "Failed to remove file.";
      toast.error(message);
    }
  };

  // Handle optimization
  const handleOptimize = async () => {
    if (!uploadedFile) {
      toast.error("Please upload a LinkedIn profile PDF first");
      return;
    }

    setOptimizing(true);
    try {
      const response = await api.post("/linkedin/optimize", {
        fileName: uploadedFile.fileName,
      });

      setOptimizedData(response.data.optimizedData);

      // ✅ Update rate limit info properly
      setRateLimitInfo({
        remaining: response.data.remaining,
        resetAt: response.data.linkedinResetAt,
      });

      // ✅ Update localStorage
      const usage = JSON.parse(localStorage.getItem("linkedinUsage")) || {
        count: 0,
      };
      usage.count += 1;
      usage.linkedinResetAt = response.data.linkedinResetAt;
      localStorage.setItem("linkedinUsage", JSON.stringify(usage));

      toast.success("Profile optimization completed!");
    } catch (error) {
      console.error("Optimization error:", error);
      if (error.response?.status === 429) {
        toast.error("Rate limit reached. Please try again later.");
        setRateLimitInfo({
          remaining: 0,
          resetAt: error.response.data.linkedinResetAt,
        });
      } else {
        toast.error(
          error.response?.data?.message || "Failed to optimize profile"
        );
      }
    } finally {
      setOptimizing(false);
    }
  };

  // Helper function to copy text to clipboard
  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  return (
    <>
      <Navbar />
      <div className="w-full mx-auto p-6 text-slate-200 bg-slate-900 min-h-screen">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              💼 LinkedIn Profile Optimizer
            </h1>
            <p className="text-slate-400">
              Upload your LinkedIn profile PDF and get AI-powered optimization
              suggestions to boost your professional visibility
            </p>
          </div>

          {/* Upload Section */}
          <Card className="mb-8 bg-slate-800/60 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">
                📁 Upload LinkedIn Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
                  isDragOver
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-slate-600"
                }`}
                onDragEnter={(e) => {
                  handleDragEvents(e);
                  setIsDragOver(true);
                }}
                onDragLeave={(e) => {
                  handleDragEvents(e);
                  setIsDragOver(false);
                }}
                onDragOver={handleDragEvents}
                onDrop={handleDrop}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  className="text-white file:bg-blue-600 file:text-white file:rounded file:p-2 mb-4 w-full"
                  disabled={uploading}
                />

                {isDragOver && (
                  <p className="text-blue-400 text-center mt-2">
                    Drop your PDF here
                  </p>
                )}

                {file && (
                  <div className="mb-4 p-3 bg-slate-700 rounded">
                    <p className="text-sm text-white">
                      Selected:{" "}
                      <span className="text-green-400">{file.name}</span>
                    </p>
                    <p className="text-xs text-slate-400">
                      Size: {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                )}

                {uploading && uploadProgress > 0 && (
                  <div className="mb-4">
                    <div className="bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Uploading: {uploadProgress}%
                    </p>
                  </div>
                )}

                <Button
                  onClick={handleUpload}
                  disabled={uploading || !file}
                  className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 disabled:opacity-50">
                  {uploading ? `Uploading... ${uploadProgress}%` : "Upload PDF"}
                </Button>
              </div>

              {uploaded && (
                <div className="mt-6 space-y-4">
                  <div className="p-4 bg-green-500/10 border border-green-500 rounded-lg">
                    <p className="text-green-400 text-sm">
                      ✅ LinkedIn profile uploaded:{" "}
                      <strong>
                        {uploadedFile?.originalName || uploadedFile?.fileName}
                      </strong>
                    </p>
                    <p className="text-slate-400 text-xs mt-1">
                      Uploaded:{" "}
                      {uploadedFile?.uploadedAt
                        ? new Date(uploadedFile.uploadedAt).toLocaleString()
                        : "Recently"}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={() =>
                        window.open(
                          uploadedFile?.ftpUrl ||
                            `/api/linkedin/preview/${uploadedFile?.fileName}`,
                          "_blank"
                        )
                      }
                      className="bg-blue-600 hover:bg-blue-700 text-sm">
                      👁️ Preview PDF
                    </Button>

                    <Button
                      onClick={handleRemove}
                      className="bg-red-600 hover:bg-red-700 text-sm">
                      🗑️ Remove File
                    </Button>
                  </div>
                </div>
              )}

              {!uploaded && !uploading && (
                <p className="text-yellow-300 mt-4 text-sm">
                  ⚠️ No LinkedIn profile uploaded yet
                </p>
              )}
            </CardContent>
          </Card>

          {/* ✅ Fixed Rate Limit Info with proper null checking */}
          {rateLimitInfo && (
            <Card className="mb-8 bg-slate-800/60 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">
                    ⏱️ Optimizations remaining: {rateLimitInfo.remaining || 0}/5
                  </span>
                  {rateLimitInfo.resetAt && rateLimitInfo.remaining === 0 && (
                    <span className="text-orange-400 text-sm">
                      Resets: {new Date(rateLimitInfo.resetAt).toLocaleString()}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Optimization Button */}
          {uploadedFile && (
            <Card className="mb-8 bg-slate-800/60 border-slate-700">
              <CardContent className="p-6">
                <Button
                  onClick={handleOptimize}
                  disabled={optimizing || rateLimitInfo?.remaining === 0}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 py-3 text-lg disabled:opacity-50">
                  {optimizing ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Analyzing Profile...
                    </div>
                  ) : rateLimitInfo?.remaining === 0 ? (
                    "Rate Limit Reached"
                  ) : (
                    "🚀 Optimize My LinkedIn Profile"
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* ✅ Optimization Results - keep the same beautiful UI as before */}
          {optimizedData && (
            <div className="space-y-6">
              {/* Profile Score */}
              <Card className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    📊 Profile Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="text-4xl font-bold text-blue-400">
                      {optimizedData.profileOverview?.score || "N/A"}
                    </div>
                    <div className="text-slate-300">
                      {optimizedData.profileOverview?.summary ||
                        "Analysis completed"}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Headline Optimization */}
              <Card className="bg-slate-800/60 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    🎯 Headline Optimization
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-slate-400 mb-2">
                      Current Headline:
                    </h4>
                    <div className="p-3 bg-red-900/20 border border-red-500/30 rounded">
                      <p className="text-slate-300">
                        {optimizedData.headline?.current || "Not provided"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-slate-400 mb-2">
                      Optimized Headline:
                    </h4>
                    <div className="p-3 bg-green-900/20 border border-green-500/30 rounded">
                      <p className="text-slate-300">
                        {optimizedData.headline?.optimized ||
                          "Optimization not available"}
                      </p>
                      {optimizedData.headline?.optimized && (
                        <Button
                          onClick={() =>
                            copyToClipboard(
                              optimizedData.headline.optimized,
                              "Optimized headline"
                            )
                          }
                          className="mt-2 bg-green-600 hover:bg-green-700 text-xs">
                          📋 Copy Headline
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* About Section */}
              <Card className="bg-slate-800/60 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    📝 About Section Optimization
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-slate-400 mb-2">
                      Current About:
                    </h4>
                    <ScrollArea className="h-32 w-full rounded border border-red-500/30 bg-red-900/20 p-3">
                      <p className="text-slate-300 text-sm whitespace-pre-wrap">
                        {optimizedData.about?.current || "Not provided"}
                      </p>
                    </ScrollArea>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-slate-400 mb-2">
                      Optimized About:
                    </h4>
                    <ScrollArea className="h-32 w-full rounded border border-green-500/30 bg-green-900/20 p-3">
                      <p className="text-slate-300 text-sm whitespace-pre-wrap">
                        {optimizedData.about?.optimized ||
                          "Optimization not available"}
                      </p>
                    </ScrollArea>
                    {optimizedData.about?.optimized && (
                      <Button
                        onClick={() =>
                          copyToClipboard(
                            optimizedData.about.optimized,
                            "Optimized about section"
                          )
                        }
                        className="mt-2 bg-green-600 hover:bg-green-700 text-xs">
                        📋 Copy About Section
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Experience Section */}
              {optimizedData.experience &&
                optimizedData.experience.length > 0 && (
                  <Card className="bg-slate-800/60 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        💼 Experience Optimization
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {optimizedData.experience.map((exp, index) => (
                        <div
                          key={index}
                          className="space-y-4">
                          <h4 className="text-lg font-semibold text-blue-400">
                            {exp.role}
                            {exp.company && ` at ${exp.company}`}
                          </h4>

                          <div>
                            <h5 className="text-sm font-medium text-slate-400 mb-2">
                              Current Description:
                            </h5>
                            <div className="p-3 bg-red-900/20 border border-red-500/30 rounded">
                              <p className="text-slate-300 text-sm">
                                {exp.current || "Not provided"}
                              </p>
                            </div>
                          </div>

                          <div>
                            <h5 className="text-sm font-medium text-slate-400 mb-2">
                              Optimized Description:
                            </h5>
                            <div className="p-3 bg-green-900/20 border border-green-500/30 rounded">
                              <p className="text-slate-300 text-sm whitespace-pre-wrap">
                                {exp.optimized || "Optimization not available"}
                              </p>
                              {exp.optimized && (
                                <Button
                                  onClick={() =>
                                    copyToClipboard(
                                      exp.optimized,
                                      `${exp.role} description`
                                    )
                                  }
                                  className="mt-2 bg-green-600 hover:bg-green-700 text-xs">
                                  📋 Copy Description
                                </Button>
                              )}
                            </div>
                          </div>

                          {index < optimizedData.experience.length - 1 && (
                            <Separator className="bg-slate-600" />
                          )}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

              {/* Skills Section */}
              <Card className="bg-slate-800/60 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    🎓 Skills Optimization
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-slate-400 mb-2">
                      Current Skills:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {optimizedData.skills?.current?.length > 0 ? (
                        optimizedData.skills.current.map((skill, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="border-red-500/30 text-red-300">
                            {skill}
                          </Badge>
                        ))
                      ) : (
                        <Badge
                          variant="outline"
                          className="border-red-500/30 text-red-300">
                          Not provided
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-slate-400 mb-2">
                      Recommended Skills:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {optimizedData.skills?.optimized?.length > 0 ? (
                        optimizedData.skills.optimized.map((skill, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="border-green-500/30 text-green-300">
                            {skill}
                          </Badge>
                        ))
                      ) : (
                        <Badge
                          variant="outline"
                          className="border-green-500/30 text-green-300">
                          Optimization not available
                        </Badge>
                      )}
                    </div>
                    {optimizedData.skills?.optimized?.length > 0 && (
                      <Button
                        onClick={() =>
                          copyToClipboard(
                            optimizedData.skills.optimized.join(", "),
                            "Recommended skills"
                          )
                        }
                        className="mt-2 bg-green-600 hover:bg-green-700 text-xs">
                        📋 Copy Skills List
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* SEO & Branding */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-slate-800/60 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      🔍 SEO Improvements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-medium text-slate-400">
                          Current Keywords:
                        </h4>
                        <p className="text-slate-300 text-sm">
                          {optimizedData.seo?.currentKeywords ||
                            "Analysis not available"}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-slate-400">
                          SEO Improvements:
                        </h4>
                        <p className="text-slate-300 text-sm">
                          {optimizedData.seo?.optimizedStrategy ||
                            "Recommendations not available"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/60 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      📈 Brand Message
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-medium text-slate-400">
                          Current Brand:
                        </h4>
                        <p className="text-slate-300 text-sm">
                          {optimizedData.branding?.current ||
                            "Analysis not available"}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-slate-400">
                          Optimized Brand:
                        </h4>
                        <p className="text-green-300 text-sm">
                          {optimizedData.branding?.optimized ||
                            "Recommendations not available"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Action Plan */}
              <Card className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    ✅ Priority Action Plan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {optimizedData.actionPlan?.length > 0 ? (
                      optimizedData.actionPlan.map((action, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-3">
                          <Badge className="bg-purple-600 text-white min-w-fit">
                            {index + 1}
                          </Badge>
                          <p className="text-slate-300">{action}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-400">
                        Action plan not available
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Motivation */}
              <Card className="bg-gradient-to-r from-green-900/20 to-blue-900/20 border-green-500/30">
                <CardContent className="p-6 text-center">
                  <div className="text-2xl mb-2">🚀</div>
                  <p className="text-green-300 font-medium">
                    {optimizedData.finalNote ||
                      optimizedData.motivation ||
                      "Keep optimizing your profile for better visibility!"}
                  </p>
                </CardContent>
              </Card>

              {/* Download All Button */}
              <Card className="bg-slate-800/60 border-slate-700">
                <CardContent className="p-4">
                  <Button
                    onClick={() => {
                      const fullReport = `
LinkedIn Profile Optimization Report
=====================================

Profile Score: ${optimizedData.profileOverview?.score || "N/A"}
Assessment: ${optimizedData.profileOverview?.summary || "Analysis completed"}

Optimized Headline:
${optimizedData.headline?.optimized || "Not available"}

Optimized About Section:
${optimizedData.about?.optimized || "Not available"}

Experience Sections:
${
  optimizedData.experience
    ?.map(
      (exp) => `
${exp.role}${exp.company ? ` at ${exp.company}` : ""}:
${exp.optimized || "Not available"}
`
    )
    .join("\n") || "Not available"
}

Recommended Skills:
${optimizedData.skills?.optimized?.join(", ") || "Not available"}

Action Plan:
${
  optimizedData.actionPlan
    ?.map((action, i) => `${i + 1}. ${action}`)
    .join("\n") || "Not available"
}

${optimizedData.finalNote || optimizedData.motivation || "Keep optimizing!"}
                      `.trim();

                      const blob = new Blob([fullReport], {
                        type: "text/plain",
                      });
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement("a");
                      link.href = url;
                      link.download = "linkedin-optimization-report.txt";
                      link.click();
                      URL.revokeObjectURL(url);
                      toast.success("Complete report downloaded!");
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700">
                    💾 Download Complete Report
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default LinkedInProfileOptimizer;
