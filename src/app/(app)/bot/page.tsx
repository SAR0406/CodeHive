import { Bot } from "lucide-react";
import AIBotClient from "./ai-bot-client";

export default function AIBotPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-headline text-3xl md:text-4xl font-semibold flex items-center gap-2 bg-clip-text text-transparent bg-gradient-to-b from-white to-neutral-400">
          <Bot className="size-8" />
          <span>AI Collaboration Bot</span>
        </h1>
        <p className="text-muted-foreground mt-2">
          Your in-repo AI assistant. Suggests fixes, writes tests, explains code, and more.
        </p>
      </div>
      <AIBotClient />
    </div>
  );
}
