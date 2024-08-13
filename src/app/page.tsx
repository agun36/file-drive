"use client";
import { Button } from "@/components/ui/button";
import { SignInButton, useSession, SignedIn, SignedOut, SignOutButton, useOrganization, useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import Image from "next/image";
import { api } from "../../convex/_generated/api";

export default function Home() {
  const organization = useOrganization();
  const user = useUser();
  let orgId: string | undefined = undefined;
  if (organization.isLoaded && user.isLoaded) {
    orgId = organization.organization?.id ?? user.user?.id;
  }
  const { session } = useSession();
  const files = useQuery(api.file.getFiles, orgId ? { orgId } : "skip");
  const createFile = useMutation(api.file.createTask);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      {files?.map(file => (
        <div key={file._id}>{file.text}</div>
      ))}
      <Button
        onClick={() => createFile({
          name: "Hello world",
          orgId: orgId ?? "",
        })}
        disabled={!session}
      >
        Click me
      </Button>
    </main>
  );
}