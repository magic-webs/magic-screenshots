"use client";

import { useConvexAuth, useMutation } from "convex/react";
import { useEffect, useRef } from "react";
import { api } from "@/convex/_generated/api";
import { clearLegacyOwnerKey, readLegacyOwnerKey } from "@/hooks/legacy-owner-key";
import { toast } from "@/components/ui/toast";

/** Once signed in, moves projects made anonymously in this browser to the account. */
export function ClaimAnonymousProjects() {
  const { isAuthenticated } = useConvexAuth();
  const claim = useMutation(api.projects.claimAnonymous);
  const started = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || started.current) return;
    const ownerKey = readLegacyOwnerKey();
    if (!ownerKey) return;
    started.current = true;
    claim({ ownerKey })
      .then((count) => {
        clearLegacyOwnerKey();
        if (count > 0) {
          toast.add({
            type: "success",
            title: `Moved ${count} project${count === 1 ? "" : "s"} to your account`,
          });
        }
      })
      .catch(() => {
        started.current = false;
      });
  }, [isAuthenticated, claim]);

  return null;
}
