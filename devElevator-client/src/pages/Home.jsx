import { motion } from "framer-motion";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import {
  FaGithub,
  FaLinkedin,
  FaFileAlt,
  FaRocket,
  FaEye,
  FaDownload,
  FaStar,
  FaArrowRight,
  FaCheck,
  FaTimes,
  FaGlobe,
} from "react-icons/fa";
import { HiSparkles, HiLightningBolt, HiCode } from "react-icons/hi";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const AnimatedCounter = ({ end, duration = 2000 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime;
    let animationFrame;

    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return <span>{count.toLocaleString()}</span>;
};

export default function DevElevatorLanding() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-teal-600/20 opacity-30" />
          <div className="relative container mx-auto px-4 py-20 lg:py-32">
            <motion.div
              className="text-center max-w-4xl mx-auto"
              initial="initial"
              animate="animate"
              variants={staggerContainer}>
              {/* Animated Logo */}
              <motion.div
                className="mb-8 flex justify-center"
                variants={fadeInUp}
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.8 }}>
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-2xl">
                  <FaRocket className="text-2xl text-white" />
                </div>
              </motion.div>

              <motion.h1
                className="text-5xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-teal-400 bg-clip-text text-transparent"
                variants={fadeInUp}>
                Elevate Your Dev Profile
              </motion.h1>

              <motion.p
                className="text-xl lg:text-2xl text-slate-300 mb-8 leading-relaxed"
                variants={fadeInUp}>
                Auto-generate GitHub-based resumes, AI README files, and repo
                visualizations
              </motion.p>

              <motion.div variants={fadeInUp}>
                <a href="/api/auth/github">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 text-lg rounded-xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 group">
                    <FaGithub className="mr-3 text-xl group-hover:rotate-12 transition-transform" />
                    Login with GitHub
                    <FaArrowRight className="ml-3 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </a>
              </motion.div>

              <motion.p
                className="text-slate-400 mt-6 text-lg"
                variants={fadeInUp}>
                No fluff. No forms. Just your code → your career.
              </motion.p>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-slate-800/50">
          <div className="container mx-auto px-4">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}>
              <h2 className="text-4xl lg:text-5xl font-bold mb-4">
                Everything you need to{" "}
                <span className="text-blue-400">stand out</span>
              </h2>
              <p className="text-xl text-slate-300">
                Powered by AI, built for developers
              </p>
            </motion.div>

            <motion.div
              className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}>
              {[
                {
                  icon: <HiSparkles className="text-3xl" />,
                  title: "AI Resume Generator",
                  description:
                    "Transform your GitHub activity into a professional resume instantly",
                },
                {
                  icon: <FaFileAlt className="text-3xl" />,
                  title: "AI README Generator",
                  description:
                    "Create compelling project documentation with zero effort",
                },
                {
                  icon: <FaEye className="text-3xl" />,
                  title: "Visual Repo Structure",
                  description:
                    "Beautiful file tree visualizations for your repositories",
                },
                {
                  icon: <FaDownload className="text-3xl" />,
                  title: "One-click Export",
                  description:
                    "Export everything as PDF, Markdown, or share via link",
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}>
                  <Card className="bg-slate-700/50 border-slate-600 hover:bg-slate-700/70 transition-all duration-300 group hover:scale-105">
                    <CardHeader className="text-center">
                      <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:rotate-6 transition-transform">
                        {feature.icon}
                      </div>
                      <CardTitle className="text-white">
                        {feature.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-slate-300 text-center">
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 bg-slate-800/50">
          <div className="container mx-auto px-4">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}>
              <h2 className="text-4xl lg:text-5xl font-bold mb-4">
                How it works
              </h2>
              <p className="text-xl text-slate-300">
                Three steps to developer greatness
              </p>
            </motion.div>

            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  {
                    step: "01",
                    title: "Connect GitHub",
                    description:
                      "Securely link your GitHub account with one click",
                  },
                  {
                    step: "02",
                    title: "AI Analysis",
                    description:
                      "Our AI analyzes your repos, commits, and coding patterns",
                  },
                  {
                    step: "03",
                    title: "Generate & Export",
                    description:
                      "Get professional resumes, READMEs, and visualizations instantly",
                  },
                ].map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.3 }}
                    className="text-center relative">
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-2xl">
                      {step.step}
                    </div>
                    <h3 className="text-2xl font-bold mb-4 text-white">
                      {step.title}
                    </h3>
                    <p className="text-slate-300">{step.description}</p>
                    {index < 2 && (
                      <div className="hidden md:block absolute top-10 left-full w-full">
                        <FaArrowRight className="text-slate-500 text-2xl" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Why DevElevator */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}>
              <h2 className="text-4xl lg:text-5xl font-bold mb-4">
                Why DevElevator?
              </h2>
              <p className="text-xl text-slate-300">
                Stop wasting time on manual work
              </p>
            </motion.div>

            <div className="max-w-4xl mx-auto">
              <Card className="bg-slate-700/30 border-slate-600">
                <CardContent className="p-8">
                  <div className="grid md:grid-cols-3 gap-8">
                    <div className="text-center">
                      <div className="text-red-400 mb-4">
                        <FaTimes className="text-3xl mx-auto" />
                      </div>
                      <h3 className="text-xl font-bold mb-2 text-white">
                        Manual Resume Building
                      </h3>
                      <p className="text-slate-300 text-sm">
                        Hours of formatting, outdated info, generic templates
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="text-red-400 mb-4">
                        <FaTimes className="text-3xl mx-auto" />
                      </div>
                      <h3 className="text-xl font-bold mb-2 text-white">
                        Online Generators
                      </h3>
                      <p className="text-slate-300 text-sm">
                        Not dev-focused, missing GitHub integration, limited
                        customization
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="text-green-400 mb-4">
                        <FaCheck className="text-3xl mx-auto" />
                      </div>
                      <h3 className="text-xl font-bold mb-2 text-white">
                        DevElevator
                      </h3>
                      <p className="text-slate-300 text-sm">
                        GitHub-powered, AI-generated, developer-first, instant
                        results
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 bg-slate-900 border-t border-slate-700">
          <div className="container mx-auto px-4 flex flex-col items-center justify-center text-center">
            {/* Logo + Text */}
            <div className="flex items-center justify-center mb-4 space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                <FaRocket className="text-white text-lg" />
              </div>
              <span className="text-slate-300 text-sm sm:text-base">
                Built with ❤️ by Priyanshu
              </span>
            </div>

            {/* Social Links */}
            <div className="flex items-center justify-center space-x-6 mb-6">
              <a
                href="https://github.com/priyanshudubey"
                className="text-slate-400 hover:text-white transition-colors">
                <FaGithub className="text-xl" />
              </a>
              <a
                href="https://www.linkedin.com/in/priyanshudubey/"
                className="text-slate-400 hover:text-white transition-colors">
                <FaLinkedin className="text-xl" />
              </a>
              <a
                href="https://priyanshudubey.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-white transition-colors"
                aria-label="Portfolio">
                <FaGlobe className="text-xl" />
              </a>
            </div>

            <Separator className="my-4 w-full bg-slate-700" />

            {/* Copyright */}
            <p className="text-slate-500 text-sm">
              © {new Date().getFullYear()} DevElevator. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
