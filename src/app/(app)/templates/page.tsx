import { PlaceHolderImages } from "@/lib/placeholder-images"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Library, GitFork } from "lucide-react"

const templates = [
  {
    id: "template-1",
    title: "Modern E-commerce Storefront",
    description: "A sleek and performant e-commerce template with a focus on user experience. Includes product pages, cart, and checkout.",
  },
  {
    id: "template-2",
    title: "Professional Blog",
    description: "A clean, content-focused blog template with markdown support, categories, and a responsive design.",
  },
  {
    id: "template-3",
    title: "Creative Portfolio",
    description: "A visually-driven portfolio template perfect for designers, photographers, and artists to showcase their work.",
  },
  {
    id: "template-4",
    title: "SaaS Landing Page",
    description: "A high-converting landing page template for your next software-as-a-service product. Includes feature sections and pricing table.",
  },
]

export default function TemplatesPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-headline text-3xl md:text-4xl font-semibold flex items-center gap-3">
          <Library className="size-8 text-accent" />
          <span>Template Library</span>
        </h1>
        <p className="text-muted-foreground mt-2">Fork a template to get a head start on your next project.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {templates.map((template) => {
          const placeholder = PlaceHolderImages.find((p) => p.id === template.id)
          return (
            <Card key={template.id} className="overflow-hidden group transition-all duration-300 hover:shadow-xl hover:shadow-accent/10 hover:-translate-y-1">
              {placeholder && (
                <div className="aspect-video bg-muted overflow-hidden">
                   <Image
                    src={placeholder.imageUrl}
                    alt={template.title}
                    width={600}
                    height={400}
                    data-ai-hint={placeholder.imageHint}
                    className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-xl">{template.title}</CardTitle>
                <CardDescription>{template.description}</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button className="w-full">
                  <GitFork className="mr-2 h-4 w-4" />
                  Fork Template
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
