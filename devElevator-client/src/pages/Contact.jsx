import React from "react";
import {
  FaGithub,
  FaLinkedin,
  FaDiscord,
  FaGlobe,
  FaEnvelope,
  FaYoutube,
} from "react-icons/fa";
import Navbar from "@/components/Navbar";

const socials = [
  {
    name: "GitHub",
    icon: <FaGithub className="text-3xl text-white" />,
    url: "https://github.com/priyanshudubey",
  },
  {
    name: "LinkedIn",
    icon: <FaLinkedin className="text-3xl text-blue-400" />,
    url: "https://www.linkedin.com/in/priyanshudubey/",
  },
  {
    name: "Website",
    icon: <FaGlobe className="text-3xl text-green-400" />,
    url: "https://priyanshudubey.com",
  },
  {
    name: "Discord",
    icon: <FaDiscord className="text-3xl text-indigo-400" />,
    url: "https://discord.gg/maBgRqK8p5",
  },
  {
    name: "Email",
    icon: <FaEnvelope className="text-3xl text-pink-400" />,
    url: "mailto:priyanshu0dubey@gmail.com",
  },
  {
    name: "YouTube",
    icon: <FaYoutube className="text-3xl text-red-500" />,
    url: "https://youtube.com/@toastercode",
  },
];

const Contact = () => {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-slate-900 text-white p-10 flex flex-col items-center">
        <h1 className="text-4xl font-bold mb-4 text-center">📞 Contact</h1>
        <p className="text-slate-400 text-center mb-12 max-w-xl">
          Whether it's collaboration, questions, or just a friendly hello—reach
          out via any platform below.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-4xl">
          {socials.map((social) => (
            <a
              key={social.name}
              href={social.url}
              target="_blank"
              rel="noreferrer"
              className="backdrop-blur-md bg-slate-800/30 border border-slate-700 rounded-xl p-6 flex flex-col items-center gap-3 shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 hover:shadow-purple-500/30">
              {social.icon}
              <span className="text-sm text-slate-200">{social.name}</span>
            </a>
          ))}
        </div>
      </div>
    </>
  );
};

export default Contact;
