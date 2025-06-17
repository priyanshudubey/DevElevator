import React from "react";
import Navbar from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { FaGithub, FaRocket, FaFolderOpen, FaFileAlt } from "react-icons/fa";
import { Button } from "@/components/ui/button";

const About = () => {
  return (
    <>
      <Navbar />
      <div className="w-full mx-auto p-6 text-white bg-slate-900 min-h-screen">
        <div className="max-w-5xl mx-auto text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            Welcome to DevElevator
          </h1>
          <p className="mt-4 text-lg text-slate-300">
            In today’s tech world, every developer is judged by what they show —
            not just what they know. But showcasing your work shouldn't feel
            like a second job. That’s why we built <strong>DevElevator</strong>{" "}
            — to make it insanely simple to present your GitHub projects with
            professional
            <span className="text-blue-400 font-semibold"> READMEs</span> and
            clean
            <span className="text-purple-400 font-semibold">
              {" "}
              folder structure
            </span>{" "}
            views.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-slate-800/60 border-slate-700 hover:shadow-purple-500/30 shadow-md transition-transform hover:-translate-y-1">
            <CardContent className="p-6 text-center">
              <FaFileAlt className="text-4xl text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                README Generator
              </h3>
              <p className="text-slate-400 text-sm">
                Instantly craft clean, professional README files using AI and
                GitHub data.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/60 border-slate-700 hover:shadow-purple-500/30 shadow-md transition-transform hover:-translate-y-1">
            <CardContent className="p-6 text-center">
              <FaFolderOpen className="text-4xl text-yellow-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Structure Visualizer
              </h3>
              <p className="text-slate-400 text-sm">
                Beautifully visualize your project folders in an intuitive tree
                layout.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/60 border-slate-700 hover:shadow-purple-500/30 shadow-md transition-transform hover:-translate-y-1">
            <CardContent className="p-6 text-center">
              <FaRocket className="text-4xl text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Portfolio Booster
              </h3>
              <p className="text-slate-400 text-sm">
                Convert your hard work into visual stories to impress recruiters
                and collaborators.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-slate-800/60 border-slate-700 max-w-5xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent text-center">
            About DevElevator
          </h1>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl w-full">
              <Card className="bg-slate-800/70 hover:shadow-lg hover:shadow-blue-600 transition-all border border-slate-700">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-2 text-white">
                    ✍️ Why DevElevator?
                  </h2>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    Because writing a README from scratch is painful. Because
                    recruiters don’t have time to dig through your code. Because
                    your repo deserves more than a “My first project lol”
                    description.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/70 hover:shadow-lg hover:shadow-purple-600 transition-all border border-slate-700">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-2 text-white">
                    💡 What Problem Does It Solve?
                  </h2>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    Devs often fail interviews not because they lack skill — but
                    because they can’t present their work properly. DevElevator
                    turns your raw code into a presentable portfolio, so your
                    hard work finally gets the attention it deserves.
                  </p>
                </CardContent>
              </Card>
            </div>
            <p className="text-slate-400 text-sm mb-2 mt-12">
              DevElevator is free and crafted for the developer community.
            </p>
            {/* <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
              <FaGithub className="mr-2" /> View on GitHub
            </Button> */}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default About;
