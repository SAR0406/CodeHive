
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
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
import type { Mentor } from '@/lib/firebase/data/get-mentors';
import type { LearningModule } from '@/lib/firebase/data/get-modules';
import { deductCredits } from '@/lib/firebase/credits';
import { useFirebase } from '@/lib/firebase/client-provider';
import { onSnapshot, collection, query } from 'firebase/firestore';

type ActionType = 'module' | 'session';
type Item = LearningModule | Mentor;

export default function LearnPage() {
  const { user, credits } = useAuth();
  const { app, db } = useFirebase();
  const { toast } = useToast();
  const [selectedItem, setSelectedItem] = useState<{ item: Item; type: ActionType } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [isLoadingMentors, setIsLoadingMentors] = useState(true);
  const [modules, setModules] = useState<LearningModule[]>([]);
  const [isLoadingModules, setIsLoadingModules] = useState(true);

  useEffect(() => {
    if (!db) return;

    // Listen for mentors
    const mentorsQuery = query(collection(db, 'mentors'));
    const unsubscribeMentors = onSnapshot(mentorsQuery, (snapshot) => {
      const fetchedMentors = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Mentor));
      setMentors(fetchedMentors);
      setIsLoadingMentors(false);
    }, (error) => {
      console.error(error);
      toast({ title: 'Error', description: 'Could not load mentors.', variant: 'destructive' });
      setIsLoadingMentors(false);
    });

    // Listen for modules
    const modulesQuery = query(collection(db, 'learning_modules'));
    const unsubscribeModules = onSnapshot(modulesQuery, (snapshot) => {
      const fetchedModules = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LearningModule));
      setModules(fetchedModules);
      setIsLoadingModules(false);
    }, (error) => {
      console.error(error);
      toast({ title: 'Error', description: 'Could not load learning modules.', variant: 'destructive' });
      setIsLoadingModules(false);
    });

    return () => {
      unsubscribeMentors();
      unsubscribeModules();
    };
  }, [db, toast]);


  const handlePurchaseClick = (item: Item, type: ActionType) => {
    if (!user) {
      toast({ title: 'Authentication Error', description: 'You must be logged in to make a purchase.', variant: 'destructive' });
      return;
    }
    if (credits === null || credits.credits < item.cost) {
      toast({ title: 'Insufficient Credits', description: `You need ${item.cost} credits for this.`, variant: 'destructive' });
      return;
    }
    setSelectedItem({ item, type });
  };

  const handleConfirmPurchase = async () => {
    if (!selectedItem || !user || !app) return;

    setIsLoading(true);

    const { item, type } = selectedItem;
    const description = type === 'module'
      ? `Purchased module: ${(item as LearningModule).title}`
      : `Booked session with: ${(item as Mentor).name}`;
    
    try {
      await deductCredits(app, user.uid, item.cost, description)
      toast({
        title: 'Purchase Successful!',
        description: `${item.cost} credits have been deducted from your account.`,
      });
    } catch (error: any) {
      console.error('Error during purchase:', error);
      toast({ title: 'Error', description: error.message || 'Could not complete the purchase. Please try again.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
      setSelectedItem(null);
    }
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
            {isLoadingMentors ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}><CardContent className="p-6 h-64 flex items-center justify-center"><Loader2 className="animate-spin text-muted-foreground" /></CardContent></Card>
              ))
            ) : (
              mentors.map((mentor) => {
                const placeholder = PlaceHolderImages.find((p) => p.id === `mentor-${mentor.id.toString()}`);
                return (
                  <Card key={mentor.id} className="text-center transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 flex flex-col">
                    <CardContent className="pt-6 flex flex-col items-center gap-4 flex-grow">
                      <Avatar className="h-24 w-24 border-2 border-primary">
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
                        {mentor.specialties.map((spec: string) => (
                          <Badge key={spec} variant="secondary">{spec}</Badge>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter className="flex-col gap-3 pt-4">
                      <div className="flex items-center gap-1 text-sm text-yellow-400 font-medium">
                        <Star className="w-4 h-4 fill-current" />
                        <span>{mentor.reputation} Reputation</span>
                      </div>
                      <Button className="w-full" onClick={() => handlePurchaseClick(mentor, 'session')} disabled={!user}>
                        Request Session ({mentor.cost} Credits)
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })
            )}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-6">Learning Modules</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {isLoadingModules ? (
              Array.from({ length: 4 }).map((_, i) => (
                 <Card key={i}><CardContent className="p-6 h-28 flex items-center justify-center"><Loader2 className="animate-spin text-muted-foreground" /></CardContent></Card>
              ))
            ) : (
                modules.map((mod, index) => (
                <Card key={index} className="flex items-center transition-all duration-300 hover:shadow-xl hover:shadow-primary/10">
                  <CardHeader className="pr-0">
                    <div className="bg-primary/10 p-4 rounded-lg">
                      <BookOpen className="h-8 w-8 text-primary" />
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow pt-6">
                    <h3 className="font-semibold">{mod.title}</h3>
                    <p className="text-sm text-muted-foreground">{mod.description}</p>
                  </CardContent>
                  <CardFooter className="pr-6">
                    <Button variant="outline" onClick={() => handlePurchaseClick(mod, 'module')} disabled={!user}>
                      <Star className="mr-2 h-4 w-4 text-yellow-400 fill-current" />
                      {mod.cost} Credits
                    </Button>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        </section>
      </div>

      <AlertDialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Your Purchase</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedItem?.type === 'module'
                ? `Are you sure you want to purchase the module "${(selectedItem?.item as LearningModule)?.title}"?`
                : `Are you sure you want to book a session with ${selectedItem?.item.name}?`
              }
              {` This will deduct `}
              <span className="font-bold text-primary">{selectedItem?.item.cost} credits</span> from your account.
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
