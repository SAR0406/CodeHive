
"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Sparkles, Wand2, TestTube, Code } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { explainCode, ExplainCodeInput } from "@/ai/flows/explain-code-flow"
import { fixCode, FixCodeInput } from "@/ai/flows/fix-code-flow"
import { generateTests, GenerateTestsInput } from "@/ai/flows/generate-tests-flow"
import { deductCredits } from "@/lib/firebase/credits"
import Editor from "@monaco-editor/react";
import { useFirebase } from "@/lib/firebase/client-provider";

type ActionType = 'explain' | 'fix' | 'test';

export default function AIBotClient() {
  const { toast } = useToast()
  const { user } = useAuth();
  const { app } = useFirebase();
  
  const [isLoading, setIsLoading] = useState<ActionType | null>(null);

  const [explainState, setExplainState] = useState({ code: "", language: "javascript", result: "" });
  const [fixState, setFixState] = useState({ code: "", language: "javascript", errors: "", result: "", fixedCode: "" });
  const [testState, setTestState] = useState({ code: "", language: "javascript", framework: "jest", result: "", testCode: "" });

  const handleActionError = (error: any, title: string) => {
    let description = "Please try again.";
    if (error.message.includes('Insufficient credits')) {
        description = "You don't have enough credits to perform this action.";
    } else if (error.message) {
        description = error.message;
    }
    toast({ title, description, variant: "destructive" });
  }
  
  const createResultDisplay = (content: string, language: string) => {
      return `\`\`\`${language}\n${content}\n\`\`\``;
  }

  const handleAction = async (action: ActionType) => {
      if (!user || !app) return;
      
      setIsLoading(action);
      const cost = 5;

      try {
        await deductCredits(app, user.uid, cost, `Used AI Bot for: ${action}`);

        if (action === 'explain') {
            const input: ExplainCodeInput = { code: explainState.code, language: explainState.language };
            const result = await explainCode(input);
            setExplainState(s => ({ ...s, result: result.explanation }));
        } else if (action === 'fix') {
            const input: FixCodeInput = { code: fixState.code, language: fixState.language, errors: fixState.errors };
            const result = await fixCode(input);
            setFixState(s => ({ ...s, result: result.explanation, fixedCode: result.fixedCode }));
        } else if (action === 'test') {
            const input: GenerateTestsInput = { code: testState.code, language: testState.language, framework: testState.framework };
            const result = await generateTests(input);
            setTestState(s => ({...s, result: result.explanation, testCode: result.testCode }));
        }
        toast({ title: 'Success!', description: `${cost} credits were deducted for the AI operation.`});
      } catch (error: any) {
          handleActionError(error, `Error performing action: ${action}`);
      } finally {
          setIsLoading(null);
      }
  };
  
  const ResultDisplay = ({ isLoading, result, code, language, title }: { isLoading: boolean, result: string, code?: string, language?: string, title: string }) => (
    <Card className="mt-4 flex-grow bg-muted/20">
        <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
        {isLoading ? (
            <div className="flex items-center text-muted-foreground p-4"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Thinking...</div>
        ) : (
          <>
            {result ? (
                <div className="text-sm whitespace-pre-wrap prose prose-sm prose-invert max-w-full" dangerouslySetInnerHTML={{ __html: result.replace(/```(\w+)?\n/g, '<pre><code class="language-$1">').replace(/```/g, '</code></pre>') }} />
            ) : (
                <p className="text-sm text-muted-foreground p-4">The result will appear here.</p>
            )}
            {code && language && (
                <div className="border rounded-lg bg-card h-96 overflow-hidden">
                    <Editor
                        height="100%"
                        language={language}
                        theme="vs-dark"
                        value={code}
                        options={{
                            readOnly: true,
                            minimap: { enabled: false },
                            scrollBeyondLastLine: false,
                            fontSize: 14,
                        }}
                    />
                </div>
            )}
          </>
        )}
        </CardContent>
    </Card>
  )

  return (
    <Tabs defaultValue="explain" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="explain"><Wand2 className="mr-2"/>Explain Code</TabsTrigger>
        <TabsTrigger value="fix"><Code className="mr-2"/>Suggest Fixes</TabsTrigger>
        <TabsTrigger value="test"><TestTube className="mr-2"/>Generate Tests</TabsTrigger>
      </TabsList>

      <TabsContent value="explain">
        <Card>
          <CardHeader>
            <CardTitle>Explain Code Snippet</CardTitle>
            <CardDescription>Get a plain English explanation of a piece of code. Costs 5 credits.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="explain-code">Code Snippet</Label>
                        <Textarea id="explain-code" placeholder="Paste your code here" value={explainState.code} onChange={e => setExplainState(s => ({ ...s, code: e.target.value }))} rows={10} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="explain-language">Programming Language</Label>
                        <Input id="explain-language" placeholder="e.g., javascript" value={explainState.language} onChange={e => setExplainState(s => ({ ...s, language: e.target.value }))} />
                    </div>
                </div>
                 <div className="flex flex-col">
                    <ResultDisplay isLoading={isLoading === 'explain'} result={explainState.result} title="Explanation" />
                </div>
            </div>
            <div className="self-start">
                <Button onClick={() => handleAction('explain')} disabled={!!isLoading || !user}><Sparkles className="mr-2 h-4 w-4" /> Explain</Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="fix">
        <Card>
          <CardHeader>
            <CardTitle>Suggest Code Fixes</CardTitle>
            <CardDescription>Provide code and error messages to get suggested fixes. Costs 5 credits.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="fix-code">Code with Errors</Label>
                        <Textarea id="fix-code" placeholder="Paste your code with errors" value={fixState.code} onChange={e => setFixState(s => ({ ...s, code: e.target.value }))} rows={10} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="fix-language">Programming Language</Label>
                        <Input id="fix-language" placeholder="e.g., javascript" value={fixState.language} onChange={e => setFixState(s => ({ ...s, language: e.target.value }))} />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="fix-errors">Errors & Warnings</Label>
                    <Textarea id="fix-errors" placeholder="Paste console errors or warnings" value={fixState.errors} onChange={e => setFixState(s => ({ ...s, errors: e.target.value }))} rows={10} />
                </div>
             </div>
             <ResultDisplay isLoading={isLoading === 'fix'} result={fixState.result} code={fixState.fixedCode} language={fixState.language} title="Suggested Fix" />
            <div className="self-start">
                <Button onClick={() => handleAction('fix')} disabled={!!isLoading || !user}><Sparkles className="mr-2 h-4 w-4" /> Suggest Fixes</Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="test">
        <Card>
          <CardHeader>
            <CardTitle>Generate Unit Tests</CardTitle>
            <CardDescription>Automatically generate unit tests for your code. Costs 5 credits.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="flex flex-col gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="test-code">Code to Test</Label>
                        <Textarea id="test-code" placeholder="Paste your function or class" value={testState.code} onChange={e => setTestState(s => ({ ...s, code: e.target.value }))} rows={10} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                          <Label htmlFor="test-language">Language</Label>
                          <Input id="test-language" placeholder="e.g., javascript" value={testState.language} onChange={e => setTestState(s => ({ ...s, language: e.target.value }))} />
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="test-framework">Framework</Label>
                          <Select value={testState.framework} onValueChange={(value) => setTestState(s => ({ ...s, framework: value }))}>
                            <SelectTrigger id="test-framework">
                              <SelectValue placeholder="Select framework" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="jest">Jest</SelectItem>
                              <SelectItem value="vitest">Vitest</SelectItem>
                              <SelectItem value="mocha">Mocha</SelectItem>
                            </SelectContent>
                          </Select>
                      </div>
                    </div>
                 </div>
                 <div className="flex flex-col">
                    <ResultDisplay isLoading={isLoading === 'test'} result={testState.result} code={testState.testCode} language={testState.language} title="Generated Tests" />
                </div>
            </div>
            <div className="self-start">
                <Button onClick={() => handleAction('test')} disabled={!!isLoading || !user}><Sparkles className="mr-2 h-4 w-4" /> Generate Tests</Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}

    