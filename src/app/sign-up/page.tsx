"use client";
import { signup } from "./actions";
/**
 * v0 by Vercel.
 * @see https://v0.dev/t/y71wwxpKfsO
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import Logo from "../../../public/dapoer-j21.png";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EyeClosedIcon, EyeOpenIcon } from "@radix-ui/react-icons";

export default function SignUpPage() {
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [hidden, setHidden] = useState(true);

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setLoading(true);
      const formData = new FormData(e.currentTarget);
      await signup(formData);
      setOpenDialog(true);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setOpenDialog(true);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="mx-auto w-full max-w-md space-y-6">
        <div className="flex flex-col items-center space-y-2">
          <Image src={Logo} alt="Dapoer J-21" width={200} height={200} />
          <p className="text-muted-foreground">
            Enter your email and password to sign up.
          </p>
        </div>
        <Card>
          <form onSubmit={handleSignUp}>
            <CardContent className="space-y-4 mt-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@gmail.com"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative flex items-center">
                  <Input
                    id="password"
                    name="password"
                    type={hidden ? "password" : "text"}
                    required
                  />
                  {hidden ? (
                    <EyeClosedIcon
                      className="cursor-pointer active:text-blue-700 absolute right-5"
                      onClick={() => setHidden(false)}
                    />
                  ) : (
                    <EyeOpenIcon
                      className="cursor-pointer active:text-blue-700 absolute right-5"
                      onClick={() => setHidden(true)}
                    />
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Link
                href="/login"
                className="text-sm text-muted-foreground"
                prefetch={false}
              >
                Already have an account?
              </Link>
              <div className="space-x-2">
                <Button type="submit" disabled={loading}>
                  {loading ? "Loading" : "Sign up"}
                </Button>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>

      <Dialog open={openDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xs md:text-lg text-left">
              Success
            </DialogTitle>
            <DialogDescription className="text-xs md:text-sm text-left">
              Check your email for a confirmation link.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Link href="/login">
              <Button variant="outline">Close</Button>
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
