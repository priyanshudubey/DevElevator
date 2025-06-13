import React, { useState } from "react";

const ResumeForm = ({ user, repos, onGenerate }) => {
  const [formData, setFormData] = useState({
    name: user.name || "",
    email: user.email || "",
    title: "",
    skills: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const skillsArray = formData.skills
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);

    const payload = {
      ...formData,
      skills: skillsArray,
      repos,
    };

    onGenerate(payload); // this will call backend API
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white shadow-md p-6 rounded mt-10 max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">🧠 Resume Info</h2>

      <div className="grid gap-4">
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="border p-2 rounded"
        />

        <input
          type="text"
          name="title"
          placeholder="Headline (e.g. Full Stack Developer)"
          value={formData.title}
          onChange={handleChange}
          className="border p-2 rounded"
        />

        <input
          type="text"
          name="skills"
          placeholder="Skills (comma separated)"
          value={formData.skills}
          onChange={handleChange}
          className="border p-2 rounded"
        />

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
          🚀 Generate Resume
        </button>
      </div>
    </form>
  );
};

export default ResumeForm;
