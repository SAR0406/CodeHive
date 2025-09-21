import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { LayoutTemplate, Star } from "lucide-react"

const tasks = [
  {
    title: "Build a landing page for a new SaaS",
    description: "Looking for a developer to create a responsive, modern landing page for a new project management tool. Figma designs will be provided.",
    tags: ["Landing Page", "React", "Tailwind CSS"],
    credits: 500,
  },
  {
    title: "Fix a bug in an e-commerce checkout flow",
    description: "Our checkout page has a bug where the shipping cost is not updating correctly. Need someone to investigate and fix it. The backend is Node.js and the frontend is Vue.",
    tags: ["Bug Fix", "E-commerce", "Vue.js"],
    credits: 150,
  },
  {
    title: "UI Tweaks for a mobile app dashboard",
    description: "Need some minor UI adjustments on our mobile dashboard screen. This includes changing colors, font sizes, and alignment. The app is built with React Native.",
    tags: ["UI/UX", "React Native"],
    credits: 75,
  },
  {
    title: "Refactor a Python script for performance",
    description: "We have a data processing script in Python that is running slow. We need an experienced Python developer to refactor it for better performance.",
    tags: ["Refactor", "Python", "Performance"],
    credits: 300,
  },
  {
    title: "Create a set of custom icons",
    description: "We need a set of 10 custom icons for our web application. The style should be modern and minimalist. Please provide a portfolio.",
    tags: ["Design", "Icons"],
    credits: 100,
  },
  {
    title: "Write documentation for a new API",
    description: "Looking for a technical writer to create comprehensive documentation for our new REST API. Experience with Swagger or OpenAPI is a plus.",
    tags: ["Documentation", "API"],
    credits: 200,
  },
]

export default function MarketplacePage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-headline text-3xl md:text-4xl font-semibold flex items-center gap-2">
            <LayoutTemplate className="size-8" />
            <span>Community Marketplace</span>
        </h1>
        <p className="text-muted-foreground mt-2">Find tasks, contribute to projects, and earn credits.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasks.map((task, index) => (
          <Card key={index} className="flex flex-col">
            <CardHeader>
              <CardTitle className="font-headline text-lg">{task.title}</CardTitle>
              <CardDescription className="line-clamp-3">{task.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="flex flex-wrap gap-2">
                {task.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between items-center">
              <div className="flex items-center gap-1 font-bold text-lg text-primary">
                <Star className="w-5 h-5" />
                <span>{task.credits}</span>
              </div>
              <Button>Claim Task</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
