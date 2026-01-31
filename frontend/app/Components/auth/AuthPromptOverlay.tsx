'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock } from 'lucide-react';
import Link from 'next/link';

export function AuthPromptOverlay() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm transition-all duration-300">
      <Card className="w-full max-w-md border-2 border-primary/20 shadow-2xl animate-in fade-in zoom-in duration-300">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Lock className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-bold">Authentication Required</CardTitle>
          <CardDescription>
            You need to be signed in to access the Vitality dashboard and monitoring tools.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-6">
          <p className="text-sm text-muted-foreground">
            Sign in to your account to view real-time hospital status, patient flow analysis, and redirection monitors.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button asChild className="w-full font-bold py-6">
            <Link href="/auth">Sign In Now</Link>
          </Button>
          <Button asChild variant="ghost" className="w-full">
            <Link href="/">Back to Landing Page</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
