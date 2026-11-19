import { Suspense } from "react";
import { AuthGate } from "@/components/auth/auth-gate";
import { Editor, EditorSkeleton } from "@/components/editor/editor";

export default function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<EditorSkeleton />}>
      {params.then(({ id }) => (
        <AuthGate fallback={<EditorSkeleton />}>
          <Editor projectId={id} />
        </AuthGate>
      ))}
    </Suspense>
  );
}
