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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { WhatsappNotification } from "@/components/WhatsappNotification";

interface Paper {
  title: string;
  authors: string[];
  abstract: string;
  url: string;
  year: string;
  type: string; // Added type field
}

const YEARS = Array.from(
  { length: new Date().getFullYear() - 1998 + 1 },
  (_, i) => (new Date().getFullYear() - i).toString()
);

const FIELDS_OF_STUDY = [
  "All",
  "Computer Science",
  "Medicine",
  "Chemistry",
  "Biology",
  "Materials Science",
  "Physics",
  "Geology",
  "Psychology",
  "Art",
  "History",
  "Geography",
  "Sociology",
  "Business",
  "Political Science",
  "Economics",
  "Philosophy",
  "Mathematics",
  "Engineering",
  "Environmental Science",
  "Agricultural and Food Sciences",
  "Education",
  "Law",
  "Linguistics",
];

const PUBLICATION_TYPES = [
  "Review",
  "JournalArticle",
  "Conference",
  "Dataset",
  "MetaAnalysis",
  "Study",
  "Book",
  "BookSection",
];

export default function RelevantPaper() {
  const [query, setQuery] = useState("");
  const [email, setEmail] = useState("");
  const [yearFrom, setYearFrom] = useState("");
  const [yearTo, setYearTo] = useState("");
  const [field, setField] = useState("");
  const [openAccess, setOpenAccess] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<Paper[]>([]);
  const [error, setError] = useState("");

  // Additional state declarations
  const [emailPreference, setEmailPreference] = useState("");
  const [showEmailWarning, setShowEmailWarning] = useState(false);

  // CSV download function moved outside the return block
  const downloadCSV = () => {
    const headers = ["Title", "Authors", "Abstract", "Year", "Type", "URL"];
    const csvData = results.map((paper) => [
      paper.title,
      paper.authors.join("; "),
      paper.abstract,
      paper.year,
      paper.type,
      paper.url,
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) =>
        row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `research_papers_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  // Email validation helper
  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  // Updated handleSearch function
  const handleSearch = async () => {
    if (!query.trim()) {
      setError("Please enter a search query");
      return;
    }

    if (!email || !validateEmail(email)) {
      setError("Please enter a valid email");
      return;
    }

    if (!emailPreference) {
      setShowEmailWarning(true);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Track email usage with HTTP request (Airtable API call)
      try {
        const airtableResponse = await fetch(
          "https://aitable.ai/fusion/v1/datasheets/dstDx8Y0twPGnL7SCl/records?viewId=viw8c75FMuquF&fieldKey=id",
          {
            method: "POST",
            headers: {
              Authorization: "Bearer uskStXfVaaiXAnh3E0EGLoa",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              records: [
                {
                  fields: {
                    "fldC5EjtESY4Y": email,
                    "fld74HjfiBm8m": ["Relevant Papers"],
                  },
                },
              ],
              fieldKey: "id",
            }),
          }
        );

        const airtableData = await airtableResponse.text();
        console.log("AITable response:", airtableData);

        if (!airtableResponse.ok) {
          throw new Error(`AITable error: ${airtableData}`);
        }
      } catch (apiError) {
        console.error("AITable error:", apiError);
      }

      // Construct Semantic Scholar API URL
      let apiUrl = `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(
        query
      )}&offset=0&limit=100`;

      // Add year range if both are selected
      if (yearFrom && yearTo) {
        apiUrl += `&year=${yearFrom}-${yearTo}`;
      }

      // Add open access filter
      if (openAccess) {
        apiUrl += "&openAccessPdf";
      }

      // Add fields of study only when a specific field is selected
      if (field && field !== "All") {
        apiUrl += `&fieldsOfStudy=${encodeURIComponent(field)}`;
      }

      // Add publication types filter
      if (selectedTypes.length > 0) {
        apiUrl += `&publicationTypes=${selectedTypes.join(",")}`;
      }

      // Specify the fields we want returned
      apiUrl +=
        "&fields=title,year,authors,abstract,url,publicationTypes,openAccessPdf,paperId";

      // Fetch data from the API
      const response = await fetch(apiUrl);
      const data = await response.json();

      if (!data.data || data.data.length === 0) {
        setError("No results based on your query");
        setResults([]);
        return;
      }

      // Transform the API response into our Paper interface
      const papers: Paper[] = data.data.map((paper: any) => ({
        title: paper.title,
        authors: paper.authors.map((author: any) => author.name),
        abstract: paper.abstract || "Abstract not available",
        url:
          paper.openAccessPdf?.url ||
          `https://www.google.com/search?q=${encodeURIComponent(paper.title + " pdf")}`,
        year: paper.year?.toString() || "N/A",
        type: paper.publicationTypes?.[0] || "Research Article",
      }));

      setResults(papers);
    } catch (err) {
      setError("An error occurred while searching. Please try again.");
      console.error("Search error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-7xl mx-auto text-center">
        <h1 className="text-3xl font-bold mb-2">Find Relevant Papers</h1>
        <p className="text-lg text-muted-foreground mb-12">
          Discover academic papers relevant to your research topic.
        </p>

        <div className="content-spacing text-left">
          <Card className="p-6 max-w-3xl mx-auto">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Email:</label>
                <input
                  type="email"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium">
                  Research Topic or Keywords:
                </label>
                <Textarea
                  placeholder="Enter your research topic or keywords..."
                  className="mt-2"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Year From:</label>
                  <Select value={yearFrom} onValueChange={setYearFrom}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {YEARS.map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Year To:</label>
                  <Select value={yearTo} onValueChange={setYearTo}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {YEARS.map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Field of Study:</label>
                  <Select value={field} onValueChange={setField}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select field" />
                    </SelectTrigger>
                    <SelectContent>
                      {FIELDS_OF_STUDY.map((f) => (
                        <SelectItem key={f} value={f}>
                          {f}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="openAccess"
                  checked={openAccess}
                  onCheckedChange={(checked) =>
                    setOpenAccess(checked as boolean)
                  }
                />
                <label htmlFor="openAccess" className="text-sm font-medium">
                  Open Access Papers Only
                </label>
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">
                  Publication Types:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {PUBLICATION_TYPES.map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={type}
                        checked={selectedTypes.includes(type)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedTypes([...selectedTypes, type]);
                          } else {
                            setSelectedTypes(selectedTypes.filter((t) => t !== type));
                          }
                        }}
                      />
                      <label htmlFor={type} className="text-sm">
                        {type}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <div>
                <label className="text-sm font-medium">
                  Email extended results (30 - 70+ more) Only 25 shown here
                </label>
                <Select
                  value={emailPreference}
                  onValueChange={(value) => {
                    setEmailPreference(value);
                    setShowEmailWarning(false);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select email preference" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes, Email me the rest</SelectItem>
                    <SelectItem value="no">No, I don't need them</SelectItem>
                  </SelectContent>
                </Select>
                {showEmailWarning && (
                  <p className="text-sm text-red-500 mt-1">
                    Please select your email preference to continue
                  </p>
                )}
              </div>

              <Button
                onClick={handleSearch}
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Searching..." : "Find Papers"}
              </Button>
            </div>
          </Card>

          {results.length > 0 && (
            <Card className="p-6 mt-6 overflow-x-auto w-full">
              <div className="flex justify-start mb-4">
                <Button
                  onClick={downloadCSV}
                  className="bg-black hover:bg-gray-800 text-white"
                >
                  Download All Papers
                </Button>
              </div>
              {/* Add WhatsApp notification before the table */}
              <WhatsappNotification onClose={() => { }} />
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[500px]">Paper Name</TableHead>
                    <TableHead className="w-[800px]">Abstract</TableHead>
                    <TableHead className="w-[100px]">Year</TableHead>
                    <TableHead className="w-[200px]">Type</TableHead>
                    <TableHead className="w-[100px]">URL</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((paper, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        <a
                          href={paper.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline text-blue-600"
                        >
                          {paper.title}
                        </a>
                      </TableCell>
                      <TableCell className="text-sm">
                        {paper.abstract.length > 150
                          ? `${paper.abstract.substring(0, 150)}...`
                          : paper.abstract}
                      </TableCell>
                      <TableCell>{paper.year}</TableCell>
                      <TableCell>{paper.type}</TableCell>
                      <TableCell>
                        <a
                          href={paper.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline text-blue-600"
                        >
                          {paper.url.includes('google.com') ? 'Search' : 'View'}
                        </a>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
