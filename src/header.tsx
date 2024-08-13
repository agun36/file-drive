import { OrganizationSwitcher, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Button } from "./components/ui/button";

export function Header() {
    return (
        <header className="border-b py-4 bg-gray-50">
            <div className="container mx-auto flex justify-between items-center">
                <div>
                    FileDrive
                </div>
                <div className="flex gap-2">
                    <OrganizationSwitcher />
                    <UserButton />
                    <SignedOut>
                        <SignInButton>
                            <Button>Sign in</Button>
                        </SignInButton>
                    </SignedOut>
                </div>
            </div>
        </header>
    );
}