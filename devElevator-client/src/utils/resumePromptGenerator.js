export function generateResumePrompt(userData, repos) {
  return `
You are a professional resume writer. Based on the following developer data, generate a clean, modern, and ATS-friendly resume content in first-person tone:

Name: ${userData.name}
Email: ${userData.email}
Title: ${userData.title || "Full Stack Developer"}

Skills: ${userData.skills?.join(", ")}

Top Projects:
${repos
  .map((repo, index) => `(${index + 1}) ${repo.name}: ${repo.description}`)
  .join("\n")}

Experience:
Highlight any notable experience, open source contributions, or freelance projects based on the GitHub data.

Keep it concise, clean, and in markdown format for easy rendering.
`;
}
