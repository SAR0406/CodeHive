"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Sparkles, Code } from "lucide-react"
import { explainCodeSnippet } from "@/ai/flows/explain-code-snippet"
import { suggestCodeFixes } from "@/ai/flows/suggest-code-fixes"
import { generateTestsFromCode } from "@/ai/flows/generate-tests-from-code"

export default function AIBotClient() {
  const { toast } = useToast()

  const [explainState, setExplainState] = useState({ code: "", language: "javascript", explanation: "", isLoading: false })
  const [fixState, setFixState] = useState({ code: "", errors: "", fixes: "", isLoading: false })
  const [testState, setTestState] = useState({ code: "", language: "javascript", tests: "", isLoading: false })

  const handleExplain = async () => {
    setExplainState(prev => ({ ...prev, isLoading: true, explanation: "" }))
    try {
      const result = await explainCodeSnippet({ codeSnippet: explainState.code, programmingLanguage: explainState.language })
      setExplainState(prev => ({ ...prev, explanation: result.explanation }))
    } catch (e) {
      toast({ title: "Error explaining code", description: "Please try again.", variant: "destructive" })
    } finally {
      setExplainState(prev => ({ ...prev, isLoading: false }))
    }
  }

  const handleFix = async () => {
    setFixState(prev => ({ ...prev, isLoading: true, fixes: "" }))
    try {
      const result = await suggestCodeFixes({ code: fixState.code, errors: fixState.errors })
      setFixState(prev => ({ ...prev, fixes: result.fixes }))
    } catch (e) {
      toast({ title: "Error suggesting fixes", description: "Please try again.", variant: "destructive" })
    } finally {
      setFixState(prev => ({ ...prev, isLoading: false }))
    }
  }
  
  const handleTest = async () => {
    setTestState(prev => ({ ...prev, isLoading: true, tests: "" }))
    try {
      const result = await generateTestsFromCode({ code: testState.code, language: testState.language })
      setTestState(prev => ({ ...prev, tests: result.tests }))
    } catch (e) {
      toast({ title: "Error generating tests", description: "Please try again.", variant: "destructive" })
    } finally {
      setTestState(prev => ({ ...prev, isLoading: false }))
    }
  }

  const renderResult = (isLoading: boolean, result: string, placeholder: string) => (
    <Card className="mt-4 flex-grow bg-muted/40">
        <CardHeader>
            <CardTitle className="font-headline text-lg">Result</CardTitle>
        </CardHeader>
        <CardContent>
        {isLoading ? (
            <div className="flex items-center text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Thinking...</div>
        ) : result ? (
            <pre className="text-sm whitespace-pre-wrap font-mono bg-transparent p-0"><code>{result}</code></pre>
        ) : (
            <p className="text-sm text-muted-foreground">{placeholder}</p>
        )}
        </CardContent>
    </Card>
  )

  return (
    <Tabs defaultValue="explain" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="explain">Explain Code</TabsTrigger>
        <TabsTrigger value="fix">Suggest Fixes</TabsTrigger>
        <TabsTrigger value="test">Generate Tests</TabsTrigger>
      </TabsList>
      <TabsContent value="explain">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Explain Code Snippet</CardTitle>
            <CardDescription>Get a plain English explanation of a piece of code.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="explain-code">Code Snippet</Label>
                    <Textarea id="explain-code" placeholder="Paste your code here" value={explainState.code} onChange={e => setExplainState(s => ({ ...s, code: e.target.value }))} rows={10} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="explain-language">Programming Language</Label>
                    <Input id="explain-language" placeholder="e.g., javascript" value={explainState.language} onChange={e => setExplainState(s => ({ ...s, language: e.target.value }))} />
                    {renderResult(explainState.isLoading, explainState.explanation, "The explanation will appear here.")}
                </div>
            </div>
            <Button onClick={handleExplain} disabled={explainState.isLoading}><Sparkles className="mr-2 h-4 w-4" /> Explain</Button>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="fix">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Suggest Code Fixes</CardTitle>
            <CardDescription>Provide code and error messages to get suggested fixes.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="fix-code">Code</Label>
                    <Textarea id="fix-code" placeholder="Paste your code with errors" value={fixState.code} onChange={e => setFixState(s => ({ ...s, code: e.target.value }))} rows={10} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="fix-errors">Errors & Warnings</Label>
                    <Textarea id="fix-errors" placeholder="Paste console errors or warnings" value={fixState.errors} onChange={e => setFixState(s => ({ ...s, errors: e.target.value }))} rows={10} />
                </div>
             </div>
             {renderResult(fixState.isLoading, fixState.fixes, "Suggested fixes will appear here.")}
            <Button onClick={handleFix} disabled={fixState.isLoading}><Sparkles className="mr-2 h-4 w-4" /> Suggest Fixes</Button>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="test">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Generate Unit Tests</CardTitle>
            <CardDescription>Automatically generate unit tests for your code.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="test-code">Code</Label>
                    <Textarea id="test-code" placeholder="Paste your function or class" value={testState.code} onChange={e => setTestState(s => ({ ...s, code: e.target.value }))} rows={10} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="test-language">Programming Language</Label>
                    <Input id="test-language" placeholder="e.g., javascript" value={testState.language} onChange={e => setTestState(s => ({ ...s, language: e.target.value }))} />
                    {renderResult(testState.isLoading, testState.tests, "Generated tests will appear here.")}
                </div>
            </div>
            <Button onClick={handleTest} disabled={testState.isLoading}><Sparkles className="mr-2 h-4 w-4" /> Generate Tests</Button>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
