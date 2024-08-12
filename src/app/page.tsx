"use client";
import { Button } from "@/components/ui/button";
import { SignInButton, useSession, SignedIn, SignedOut, SignOutButton } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import Image from "next/image";
import { api } from "../../convex/_generated/api";

export default function Home() {
  const files = useQuery(api.file.getFiles)
  const createFile = useMutation(api.file.createTask)
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <SignedIn>
        <SignOutButton >
          <Button variant="destructive">Sign out</Button>
        </SignOutButton>
      </SignedIn>
      <SignedOut>
        <SignInButton mode="modal">
          <Button variant="default">Sign in</Button>
        </SignInButton>
      </SignedOut>
      {
        files?.map(file => {
          return <div key={file._id}>{file.text}</div>
        })
      }
      <Button onClick={() => createFile({
        name: "Hello world"
      })} >Click me </Button>
    </main>
  );
}
