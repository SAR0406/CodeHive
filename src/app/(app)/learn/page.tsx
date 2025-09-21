import { PlaceHolderImages } from "@/lib/placeholder-images"
import Image from "next/image"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { GraduationCap, Star, CheckCircle, BookOpen } from "lucide-react"

const mentors = [
  { id: "mentor-1", name: "Jane Doe", specialties: ["React", "UI/UX Design"], reputation: 4.9 },
  { id: "mentor-2", name: "John Smith", specialties: ["Python", "Data Science"], reputation: 4.8 },
  { id: "mentor-3", name: "Alex Ray", specialties: ["Node.js", "DevOps"], reputation: 4.9 },
  { id: "mentor-4", name: "Sarah Chen", specialties: ["Vue.js", "Testing"], reputation: 4.7 },
]

const modules = [
    { title: "Advanced React Patterns", description: "Deep dive into hooks, context, and performance optimization.", cost: 50 },
    { title: "Mastering Tailwind CSS", description: "Learn how to build beautiful, custom designs with utility-first CSS.", cost: 30 },
    { title: "Introduction to AI with Genkit", description: "Build your first AI-powered features using Firebase Genkit.", cost: 75 },
    { title: "Full-Stack Deployment on Firebase", description: "A complete guide to deploying and managing your apps.", cost: 60 },
]

export default function LearnPage() {
  return (
    <div className="flex flex-col gap-12">
      <div>
        <h1 className="font-headline text-3xl md:text-4xl font-semibold flex items-center gap-2 bg-clip-text text-transparent bg-gradient-to-b from-white to-neutral-400">
          <GraduationCap className="size-8" />
          <span>Learn & Mentor</span>
        </h1>
        <p className="text-muted-foreground mt-2">Connect with mentors and enhance your skills with premium modules.</p>
      </div>

      <section>
        <h2 className="font-headline text-2xl font-semibold mb-6">Find a Mentor</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {mentors.map((mentor) => {
            const placeholder = PlaceHolderImages.find((p) => p.id === mentor.id)
            return (
              <Card key={mentor.id} className="text-center transition-all duration-300 hover:scale-[1.02] hover:shadow-accent/40 hover:shadow-2xl">
                <CardContent className="pt-6 flex flex-col items-center gap-4">
                  <Avatar className="h-24 w-24 border-2 border-primary">
                    {placeholder && <AvatarImage src={placeholder.imageUrl} alt={mentor.name} data-ai-hint={placeholder.imageHint} />}
                    <AvatarFallback>{mentor.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="font-headline">{mentor.name}</CardTitle>
                    <div className="flex justify-center items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Badge variant="outline" className="text-accent border-accent flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Verified Mentor
                      </Badge>
                    </div>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2">
                    {mentor.specialties.map((spec) => (
                      <Badge key={spec} variant="secondary">{spec}</Badge>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="flex-col gap-3">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Star className="w-4 h-4 text-primary" />
                    <span>{mentor.reputation} Reputation</span>
                  </div>
                   <Button className="w-full bg-white text-black hover:bg-neutral-200">Request Session</Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      </section>

      <section>
        <h2 className="font-headline text-2xl font-semibold mb-6">Learning Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {modules.map((mod, index) => (
                <Card key={index} className="flex items-center transition-all duration-300 hover:shadow-accent/40 hover:shadow-2xl">
                    <CardHeader className="pr-0">
                        <div className="bg-primary/10 p-4 rounded-lg">
                           <BookOpen className="h-8 w-8 text-primary" />
                        </div>
                    </CardHeader>
                    <CardContent className="flex-grow pt-6">
                        <h3 className="font-headline font-semibold">{mod.title}</h3>
                        <p className="text-sm text-muted-foreground">{mod.description}</p>
                    </CardContent>
                    <CardFooter className="pr-6">
                        <Button variant="outline">
                            <Star className="mr-2 h-4 w-4 text-primary" />
                            {mod.cost} Credits
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
      </section>
    </div>
  )
}
