import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export default function ChapterRewriter() {
  const [chapter, setChapter] = useState(""); // Input text
  const [rewrittenChapter, setRewrittenChapter] = useState(""); // Rewritten result
  const [confidence, setConfidence] = useState("medium");
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [options, setOptions] = useState({
    shortenSentences: false,
    shortenParagraphs: false,
    addMoreParagraphs: false,
    rephraseSentences: false,
    replaceWithSynonyms: false,
    rearrangeParagraphs: false,
    makeHumanLike: false,
    addTypos: false,
    addMisspelledWords: false,
    addWrongPunctuation: false,
  });
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleOptionChange = (option: keyof typeof options) => {
    setOptions((prev) => ({
      ...prev,
      [option]: !prev[option],
    }));
  };

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleRewrite = async () => {
    if (!chapter.trim()) {
      setError("Please enter your chapter text");
      return;
    }
    if (!email || !validateEmail(email)) {
      setError("Please enter a valid email");
      return;
    }

    setIsLoading(true);
    setError("");
    setRewrittenChapter("");

    try {
      const response = await fetch("https://spintext.opeyemisanusial.workers.dev", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: chapter,
          email: email,
          confidence: confidence,
          options: options,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to rewrite the text");
      }
      if (data.data.status === "OK") {
        setRewrittenChapter(data.data.response);
      } else {
        throw new Error(data.data.response || "API returned an error");
      }
    } catch (err) {
      console.error("Rewrite error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to connect to the rewriting service"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Chapter Rewriter</h1>

        <Card className="p-6 mb-6">
          <Textarea
            placeholder="Paste your chapter here..."
            className="min-h-[300px] mb-4"
            value={chapter}
            onChange={(e) => setChapter(e.target.value)}
          />

          <div className="mb-6">
            <label className="text-sm font-medium mb-2 block">
              Confidence Level
            </label>
            <Select value={confidence} onValueChange={setConfidence}>
              <SelectTrigger>
                <SelectValue placeholder="Select confidence level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="mb-6">
            <label className="text-sm font-medium mb-2 block">Email</label>
            <input
              type="email"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
            <CollapsibleTrigger asChild>
              <Button
                variant="outline"
                className="w-full mb-4 text-blue-500 hover:text-blue-600"
              >
                {isAdvancedOpen ? "Hide Advanced Options" : "Show Advanced Options"}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-3">Sentences/Paragraphs</h3>
                  <div className="space-y-2">
                    {[
                      { id: "shortenSentences", label: "Shorten sentences" },
                      { id: "shortenParagraphs", label: "Shorten paragraphs" },
                      { id: "addMoreParagraphs", label: "Add more paragraphs" },
                      { id: "rephraseSentences", label: "Rephrase sentences" },
                      {
                        id: "replaceWithSynonyms",
                        label: "Replace all original words with synonyms",
                      },
                      {
                        id: "rearrangeParagraphs",
                        label: "Rearrange the paragraphs order",
                      },
                    ].map((option) => (
                      <div key={option.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={option.id}
                          checked={options[option.id as keyof typeof options]}
                          onCheckedChange={() =>
                            handleOptionChange(option.id as keyof typeof options)
                          }
                        />
                        <label htmlFor={option.id} className="text-sm">
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-3">Humanize (Using AI)</h3>
                  <div className="space-y-2">
                    {[
                      { id: "makeHumanLike", label: "Make Human Like" },
                      { id: "addTypos", label: "Add typos" },
                      { id: "addMisspelledWords", label: "Add misspelled words" },
                      {
                        id: "addWrongPunctuation",
                        label: "Add wrong punctuation marks",
                      },
                    ].map((option) => (
                      <div key={option.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={option.id}
                          checked={options[option.id as keyof typeof options]}
                          onCheckedChange={() =>
                            handleOptionChange(option.id as keyof typeof options)
                          }
                        />
                        <label htmlFor={option.id} className="text-sm">
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Button
            className="w-full mt-4"
            onClick={handleRewrite}
            disabled={isLoading}
          >
            {isLoading ? "Rewriting..." : "Rewrite Chapter"}
          </Button>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </Card>

        {rewrittenChapter && !isLoading && (
          <Card className="p-6 mt-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Rewritten Chapter:</span>
              </div>
              <div className="bg-muted p-4 rounded-lg text-left h-[300px] overflow-y-auto">
                <p className="text-sm whitespace-pre-wrap" style={{ lineHeight: "2" }}>
                  {rewrittenChapter}
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
