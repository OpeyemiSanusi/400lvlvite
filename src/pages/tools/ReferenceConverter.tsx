import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Copy } from "lucide-react";
import { WhatsappNotification } from "@/components/WhatsappNotification";
// Remove this import
// import { APITable } from "apitable";

export default function ReferenceConverter() {
  const [reference, setReference] = useState("");
  const [targetStyle, setTargetStyle] = useState("");
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState("");

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleConvert = async () => {
    if (!targetStyle) {
      setError("Please select a citation style");
      return;
    }
    if (!email || !validateEmail(email)) {
      setEmailError("Please enter a valid email");
      return;
    }
    if (!reference) {
      return;
    }

    setIsLoading(true);
    setError("");
    setEmailError("");
    setReference(""); // Clear input immediately when clicking convert
    setResult(""); // Clear previous result

    try {
      // Track email usage with HTTP request
      try {
        const airtableResponse = await fetch('https://aitable.ai/fusion/v1/datasheets/dstDx8Y0twPGnL7SCl/records?viewId=viw8c75FMuquF&fieldKey=id', {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer uskStXfVaaiXAnh3E0EGLoa',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            records: [{
              fields: {
                "fldC5EjtESY4Y": email,
                "fld74HjfiBm8m": ["Reference Converter"]  // Changed to array for multi-select field
              }
            }],
            fieldKey: "id"
          })
        });

        const responseData = await airtableResponse.text();
        console.log('AITable response:', responseData);

        if (!airtableResponse.ok) {
          throw new Error(`AITable error: ${responseData}`);
        }
      } catch (apiError) {
        console.error('AITable error:', apiError);
      }

      const promptText = `Convert the following references from to ${targetStyle}.

Please:
1. Process each reference completely, preserving all author names, dates, titles, and publication details
2. Arrange the final list in strict alphabetical order by first author's last name
3. Ensure all references follow the exact [TARGET FORMAT] requirements
4. Present as a clean, continuous list WITHOUT any alphabetical section headers (A, B, C, etc.)
5. Use your reasoning capabilities to ensure accuracy and completeness in the conversion process
6. Double-check for formatting consistency across all entries
7. Return ONLY the converted references with no introductory or concluding statements
8. Wrap your complete response inside <result> </result> tags

References to convert:`;

      const response = await fetch('https://400lvlworker.opeyemisanusi.workers.dev', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: reference,
          promptPrefix: promptText,
          model: "anthropic/claude-3-5-haiku-20241022"
        }),
      });

      // Clear the input field immediately after sending the request
      setReference("");

      const responseText = await response.text();
      console.log('Raw response:', responseText);

      if (responseText.includes("No content returned from Straico")) {
        throw new Error("The service is temporarily unavailable. Please try again in a few minutes.");
      }

      try {
        const data = JSON.parse(responseText);
        if (!data.success) {
          throw new Error("API request failed");
        }

        const content = data.data?.completions?.["anthropic/claude-3-5-haiku-20241022"]?.completion?.choices?.[0]?.message?.content;

        if (!content) {
          throw new Error("No valid response content found");
        }

        // Extract content between <result> tags and preserve line breaks
        const resultMatch = content.match(/<result>([\s\S]*)<\/result>/);
        if (resultMatch) {
          setResult(resultMatch[1].trim());
        } else {
          setResult(content);
        }
      } catch (parseError) {
        console.error('Response parsing error:', parseError);
        setError("Failed to process the response. Please try again.");
      }
    } catch (err) {
      console.error('Conversion error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Moved handleCopy outside the returned JSX
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-3xl font-bold mb-2">Reference Converter</h1>
        <p className="text-lg text-muted-foreground mb-12">
          Convert your references to different citation styles instantly.
        </p>

        <div className="content-spacing text-left">
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="space-y-2 flex-1">
                  <label className="text-sm font-medium text-left">Convert to:</label>
                  <Select
                    value={targetStyle}
                    onValueChange={(value) => {
                      setTargetStyle(value);
                      setError("");
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select citation style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="apa">APA (7th Edition)</SelectItem>
                      <SelectItem value="mla">MLA (9th Edition)</SelectItem>
                      <SelectItem value="chicago">Chicago</SelectItem>
                      <SelectItem value="harvard">Harvard</SelectItem>
                    </SelectContent>
                  </Select>
                  {error && <p className="text-sm text-red-500">{error}</p>}
                </div>

                <div className="space-y-2 flex-1">
                  <label className="text-sm font-medium">Email:</label>
                  <input
                    type="email"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailError("");
                    }}
                  />
                  {emailError && <p className="text-sm text-red-500">{emailError}</p>}
                </div>
              </div>

              <Textarea
                placeholder="Paste your reference here..."
                className="min-h-[150px]"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
              />

              <Button onClick={handleConvert} className="w-full" disabled={isLoading}>
                {isLoading ? "Converting..." : "Convert Reference"}
              </Button>
            </div>
          </Card>

          {(isLoading || result) && (
            <>
              <WhatsappNotification onClose={() => { }} />
              <Card className="p-6 mt-6">
                <div className="space-y-4">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-[300px]">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      <span className="ml-3">Converting your reference...</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Result:</span>
                        <Button variant="outline" size="sm" onClick={handleCopy}>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy
                        </Button>
                      </div>
                      <div className="bg-muted p-4 rounded-lg text-left h-[300px] overflow-y-auto">
                        <p className="text-sm whitespace-pre-wrap" style={{ lineHeight: "2" }}>
                          {result}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
