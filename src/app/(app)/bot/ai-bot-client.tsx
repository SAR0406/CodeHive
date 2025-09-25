
"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Sparkles } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { explainCode, ExplainCodeInput } from "@/ai/flows/explain-code-flow"
// import { deductCredits } from "@/lib/firebase/credits"

export default function AIBotClient() {
  const { toast } = useToast()
  const { user } = useAuth();

  const [explainState, setExplainState] = useState({ code: "", language: "javascript", explanation: "", isLoading: false })
  const [fixState, setFixState] = useState({ code: "", errors: "", fixes: "", isLoading: false })
  const [testState, setTestState] = useState({ code: "", language: "javascript", tests: "", isLoading: false })

  const handleActionError = (error: any, title: string) => {
    let description = "Please try again.";
    if (error.message.includes('Insufficient credits')) {
        description = "You don't have enough credits to perform this action.";
    } else if (error.message) {
        description = error.message;
    }
    toast({ title, description, variant: "destructive" });
  }

  const handleExplain = async () => {
      if (!user) return;
      setExplainState(s => ({ ...s, isLoading: true, explanation: '' }));

      const cost = 10;
      const input: ExplainCodeInput = {
          code: explainState.code,
          language: explainState.language,
      };

      try {
          // await deductCredits(user.uid, cost);
          toast({ title: 'Credit deduction is coming soon!'});
          const result = await explainCode(input);
          setExplainState(s => ({ ...s, explanation: result.explanation }));
      } catch (error: any) {
          handleActionError(error, "Error explaining code");
      } finally {
          setExplainState(s => ({ ...s, isLoading: false }));
      }
  }

  const handleAction = async (action: 'explain' | 'fix' | 'test') => {
    if (action === 'explain') {
        await handleExplain();
        return;
    }
    toast({ title: "AI Feature Disabled", description: "This feature is currently unavailable.", variant: "destructive" });
  };

  const renderResult = (isLoading: boolean, result: string, placeholder: string) => (
    <Card className="mt-4 flex-grow bg-muted/20">
        <CardHeader>
            <CardTitle className="text-lg">Result</CardTitle>
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
            <CardTitle>Explain Code Snippet</CardTitle>
            <CardDescription>Get a plain English explanation of a piece of code. Costs 10 credits.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
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
                    {renderResult(explainState.isLoading, explainState.explanation, "The explanation will appear here.")}
                </div>
            </div>
            <div className="self-start">
                <Button onClick={() => handleAction('explain')} disabled={explainState.isLoading || !user}><Sparkles className="mr-2 h-4 w-4" /> Explain</Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="fix">
        <Card>
          <CardHeader>
            <CardTitle>Suggest Code Fixes</CardTitle>
            <CardDescription>Provide code and error messages to get suggested fixes. Costs 10 credits.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
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
            <div className="self-start">
                <Button onClick={() => handleAction('fix')} disabled={fixState.isLoading || !user}><Sparkles className="mr-2 h-4 w-4" /> Suggest Fixes</Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="test">
        <Card>
          <CardHeader>
            <CardTitle>Generate Unit Tests</CardTitle>
            <CardDescription>Automatically generate unit tests for your code. Costs 10 credits.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="flex flex-col gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="test-code">Code</Label>
                        <Textarea id="test-code" placeholder="Paste your function or class" value={testState.code} onChange={e => setTestState(s => ({ ...s, code: e.target.value }))} rows={10} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="test-language">Programming Language</Label>
                        <Input id="test-language" placeholder="e.g., javascript" value={testState.language} onChange={e => setTestState(s => ({ ...s, language: e.target.value }))} />
                    </div>
                 </div>
                 <div className="flex flex-col">
                    {renderResult(testState.isLoading, testState.tests, "Generated tests will appear here.")}
                </div>
            </div>
            <div className="self-start">
                <Button onClick={() => handleAction('test')} disabled={testState.isLoading || !user}><Sparkles className="mr-2 h-4 w-4" /> Generate Tests</Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
