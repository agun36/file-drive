"use client";
import { Button } from "@/components/ui/button";
import { useSession, useOrganization, useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  title: z.string().min(1).max(200),
  file: z
    .custom<FileList>((val) => val instanceof FileList && val.length > 0, "File is required")
});

export default function Home() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const organization = useOrganization();
  const user = useUser();
  const generateUploadUrl = useMutation(api.file.generateUploadUrl);
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      file: undefined,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Handle form submission
    const postUrl = await generateUploadUrl();
    const result = await fetch(postUrl, {
      method: "POST",
      headers: { "Content-Type": values.file[0]!.type },
      body: values.file[0],
    });
    const { storageId } = await result.json();
    if (!orgId) return;
    try {
      await createFile({
        orgId,
        fileId: storageId,
        name: values.title,
      });
      form.reset();
      console.log(values);
      setIsDialogOpen(false);
      toast(
        {
          variant: "success",
          title: "File uploaded",
          description: "Everyone can view your file"
        }
      )
    } catch (e) {
      toast(
        {
          variant: "destructive",
          title: "Something went wrong",
          description: "Your file could not be uploaded, try again later"
        }
      )
    }

  }

  let orgId: string | undefined = undefined;
  if (organization.isLoaded && user.isLoaded) {
    orgId = organization.organization?.id ?? user.user?.id;
  }
  const { session } = useSession();
  const files = useQuery(api.file.getFiles, orgId ? { orgId } : "skip");

  const createFile = useMutation(api.file.createTask);

  return (
    <main className="container mx-auto pt-12">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">Your files</h1>

        <Dialog
          open={isDialogOpen}
          onOpenChange={(isOpen) => {
            setIsDialogOpen(isOpen);
            form.reset();
          }}>
          <DialogTrigger asChild>
            <Button
              disabled={!session}
            >
              Upload file
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="mb-8">Upload Your file</DialogTitle>
              <DialogDescription>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="file"
                      render={({ field: { onChange, value }, fieldState }) => (
                        <FormItem>
                          <FormLabel>File</FormLabel>
                          <FormControl>
                            <Input
                              type="file"
                              onChange={(event) => {
                                const files = event.target.files;
                                if (files && files.length > 0) {
                                  onChange(files);
                                }
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      disabled={form.formState.isSubmitting}
                      // disabled={true}
                      type="submit"
                      className="flex gap-1 items-center"
                    >
                      {form.formState.isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                      Submit
                    </Button>
                  </form>
                </Form>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>

      {files?.map(file => (
        <div key={file._id}>{file.name}</div>
      ))}
      {!files && <p>Loading files or no organization selected...</p>}
    </main>
  );
}

