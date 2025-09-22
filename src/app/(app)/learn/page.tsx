'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase/client-app';
import { doc, updateDoc, increment } from 'firebase/firestore';

import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { GraduationCap, Star, BookOpen, UserCheck, Loader2 } from 'lucide-react';

const mentors = [
  { id: 'mentor-1', name: 'Jane Doe', specialties: ['React', 'UI/UX Design'], reputation: 4.9, cost: 100 },
  { id: 'mentor-2', name: 'John Smith', specialties: ['Python', 'Data Science'], reputation: 4.8, cost: 120 },
  { id: 'mentor-3', name: 'Alex Ray', specialties: ['Node.js', 'DevOps'], reputation: 4.9, cost: 150 },
  { id: 'mentor-4', name: 'Sarah Chen', specialties: ['Vue.js', 'Testing'], reputation: 4.7, cost: 90 },
];

const modules = [
  { title: 'Advanced React Patterns', description: 'Deep dive into hooks, context, and performance optimization.', cost: 50 },
  { title: 'Mastering Tailwind CSS', description: 'Learn how to build beautiful, custom designs with utility-first CSS.', cost: 30 },
  { title: 'Introduction to AI with Genkit', description: 'Build your first AI-powered features using Firebase Genkit.', cost: 75 },
  { title: 'Full-Stack Deployment on Firebase', description: 'A complete guide to deploying and managing your apps.', cost: 60 },
];

type ActionType = 'module' | 'session';
type Item = (typeof modules)[0] | (typeof mentors)[0];

export default function LearnPage() {
  const { user, credits } = useAuth();
  const { toast } = useToast();
  const [selectedItem, setSelectedItem] = useState<{ item: Item; type: ActionType } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handlePurchaseClick = (item: Item, type: ActionType) => {
    if (!user) {
      toast({ title: 'Authentication Error', description: 'You must be logged in to make a purchase.', variant: 'destructive' });
      return;
    }
    if (credits === null || credits < item.cost) {
      toast({ title: 'Insufficient Credits', description: `You need ${item.cost} credits for this.`, variant: 'destructive' });
      return;
    }
    setSelectedItem({ item, type });
  };

  const handleConfirmPurchase = async () => {
    if (!selectedItem || !user) return;

    setIsLoading(true);
    try {
      const creditRef = doc(db, 'credits', user.uid);
      await updateDoc(creditRef, {
        balance: increment(-selectedItem.item.cost),
      });
      toast({
        title: 'Purchase Successful!',
        description: `${selectedItem.item.cost} credits have been deducted from your account.`,
      });
    } catch (error) {
      console.error('Error during purchase:', error);
      toast({ title: 'Error', description: 'Could not complete the purchase. Please try again.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
      setSelectedItem(null);
    }
  };

  const getActionText = () => {
    if (!selectedItem) return '';
    const name = selectedItem.type === 'session' ? (selectedItem.item as typeof mentors[0]).name : `the "${(selectedItem.item as typeof modules[0]).title}" module`;
    return `Are you sure you want to book a session with ${name}?`;
  };
  
  return (
    <>
      <div className="flex flex-col gap-12">
        <div>
          <h1 className="font-headline text-3xl md:text-4xl font-semibold flex items-center gap-3">
            <GraduationCap className="size-8 text-accent" />
            <span>Learn & Mentor</span>
          </h1>
          <p className="text-muted-foreground mt-2">Connect with mentors and enhance your skills with premium modules.</p>
        </div>

        <section>
          <h2 className="text-2xl font-semibold mb-6">Find a Mentor</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {mentors.map((mentor) => {
              const placeholder = PlaceHolderImages.find((p) => p.id === mentor.id);
              return (
                <Card key={mentor.id} className="text-center transition-all duration-300 hover:shadow-xl hover:shadow-accent/10 hover:-translate-y-1 flex flex-col">
                  <CardContent className="pt-6 flex flex-col items-center gap-4 flex-grow">
                    <Avatar className="h-24 w-24 border-2 border-accent">
                      {placeholder && <AvatarImage src={placeholder.imageUrl} alt={mentor.name} data-ai-hint={placeholder.imageHint} />}
                      <AvatarFallback>{mentor.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle>{mentor.name}</CardTitle>
                      <div className="flex justify-center items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Badge variant="outline" className="text-green-400 border-green-400/50 flex items-center gap-1">
                          <UserCheck className="h-3 w-3" />
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
                  <CardFooter className="flex-col gap-3 pt-4">
                    <div className="flex items-center gap-1 text-sm text-amber-400 font-medium">
                      <Star className="w-4 h-4 fill-current" />
                      <span>{mentor.reputation} Reputation</span>
                    </div>
                    <Button className="w-full" onClick={() => handlePurchaseClick(mentor, 'session')}>
                      Request Session ({mentor.cost} Credits)
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-6">Learning Modules</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {modules.map((mod, index) => (
              <Card key={index} className="flex items-center transition-all duration-300 hover:shadow-xl hover:shadow-accent/10">
                <CardHeader className="pr-0">
                  <div className="bg-accent/10 p-4 rounded-lg">
                    <BookOpen className="h-8 w-8 text-accent" />
                  </div>
                </CardHeader>
                <CardContent className="flex-grow pt-6">
                  <h3 className="font-semibold">{mod.title}</h3>
                  <p className="text-sm text-muted-foreground">{mod.description}</p>
                </CardContent>
                <CardFooter className="pr-6">
                  <Button variant="outline" onClick={() => handlePurchaseClick(mod, 'module')}>
                    <Star className="mr-2 h-4 w-4 text-amber-400 fill-current" />
                    {mod.cost} Credits
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>
      </div>

      <AlertDialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Your Purchase</AlertDialogTitle>
            <AlertDialogDescription>
              {`Are you sure you want to purchase ${selectedItem?.type === 'module' ? `the module "${(selectedItem?.item as any)?.title}"` : `a session with ${(selectedItem?.item as any)?.name}`}? This will deduct `}
              <span className="font-bold text-amber-400">{selectedItem?.item.cost} credits</span> from your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmPurchase} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Confirming...
                </>
              ) : (
                'Confirm & Spend Credits'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
