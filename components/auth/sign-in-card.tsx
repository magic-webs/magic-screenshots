"use client";

import { useSignInWithUsernamePasskey } from "@convex-dev/auth/methods/username-passkey/react";
import { KeyRoundIcon } from "lucide-react";
import { useState } from "react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

const MESSAGES: Record<string, string> = {
  USERNAME_TOO_SHORT: "Enter a username.",
  USERNAME_TOO_LONG: "That username is too long.",
  USERNAME_HAS_SURROUNDING_WHITESPACE: "Remove spaces at the start or end.",
  USERNAME_HAS_INVALID_CHARACTERS: "That username has characters we can't use.",
  USERNAME_TAKEN: "That username is taken.",
  CEREMONY_ABORTED: "The passkey request was cancelled.",
  PASSKEY_ALREADY_REGISTERED:
    "This device already has a passkey for that account. Try signing in again.",
  WEBAUTHN_UNSUPPORTED: "This browser doesn't support passkeys.",
  UNKNOWN_CREDENTIAL: "That passkey isn't registered for this account.",
  CHALLENGE_EXPIRED: "The request timed out. Please try again.",
  ALREADY_PENDING: "A passkey request is already in progress.",
};

function messageFor(code: string) {
  return MESSAGES[code] ?? "Sign-in failed. Please try again.";
}

export function SignInCard({
  title = "Sign in to continue",
  description = "Use a passkey, so there's no password to remember. A new username creates an account.",
}: {
  title?: string;
  description?: string;
}) {
  const { signIn, pending, autofill } = useSignInWithUsernamePasskey(api.auth);
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const result = await signIn({ username: username.trim() });
    if (result.status === "error") setError(messageFor(result.userError.error));
  }

  const shownError =
    error ?? (autofill.lastError ? messageFor(autofill.lastError.error) : null);

  return (
    <Card>
      <form onSubmit={onSubmit}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <FieldGroup>
            <Field data-invalid={shownError ? true : undefined}>
              <FieldLabel htmlFor="username">Username</FieldLabel>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username webauthn"
                placeholder="e.g. jane"
                maxLength={100}
                required
                disabled={pending}
                aria-invalid={shownError ? true : undefined}
              />
              {shownError ? (
                <FieldError>{shownError}</FieldError>
              ) : (
                <FieldDescription>
                  Your browser or password manager keeps the passkey.
                </FieldDescription>
              )}
            </Field>
          </FieldGroup>
        </CardContent>
        <CardFooter className="pt-4">
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={pending || !username.trim()}
          >
            {pending ? <Spinner /> : <KeyRoundIcon />}
            {pending ? "Waiting for your passkey…" : "Continue with a passkey"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
