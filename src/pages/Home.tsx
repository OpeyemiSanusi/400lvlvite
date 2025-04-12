import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Link } from "react-router-dom";
import {
  BookOpen,
  FileSearch,
  FileCog,
  HelpCircle,
  BookMarked,
  FileStack
} from "lucide-react";

const tools = [
  {
    title: "Topic Generator",
    description: "Generate relevant research topics based on your field of study",
    icon: BookOpen,
    href: "/tools/topic-generator"
  },
  {
    title: "Reference Converter",
    description: "Convert citations to APA, MLA, and other formats",
    icon: FileSearch,
    href: "/tools/reference-converter"
  },
  {
    title: "Plagiarism Checker",
    description: "Check your work for potential plagiarism",
    icon: FileCog,
    href: "/tools/plagiarism-checker"
  },
  {
    title: "Research Questions",
    description: "Generate and refine research questions",
    icon: HelpCircle,
    href: "/tools/research-questions"
  },
  {
    title: "Literature Review",
    description: "Organize and structure your literature review",
    icon: BookMarked,
    href: "/tools/literature-review"
  },
  {
    title: "Methodology Advisor",
    description: "Get guidance on research methodology",
    icon: FileStack,
    href: "/tools/methodology-advisor"
  }
];

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-3xl mx-auto text-center mb-16">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl text-black mb-6">
          Final Year Project Assistant
        </h1>
        <p className="text-xl text-black/70">
          Your comprehensive toolkit for planning, writing, and perfecting your final year project.
          Access powerful tools designed specifically for Nigerian students.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool) => (
          <Link key={tool.href} to={tool.href} className="h-full">
            <Card className="hover:shadow-lg transition-shadow h-full">
              <CardHeader className="h-full flex flex-col">
                <div className="flex-1">
                  <tool.icon className="h-8 w-8 text-black mb-4" />
                  <CardTitle className="text-black">{tool.title}</CardTitle>
                  <CardDescription className="text-black/70">{tool.description}</CardDescription>
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}