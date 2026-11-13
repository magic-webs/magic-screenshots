import { Suspense } from "react";
import { Editor, EditorSkeleton } from "@/components/editor/editor";

export default function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<EditorSkeleton />}>
      {params.then(({ id }) => (
        <Editor projectId={id} />
      ))}
    </Suspense>
  );
}
