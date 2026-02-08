import type { Editor } from "@tiptap/core";
import { EditorContent } from "@tiptap/react";

type Props = {
  editor: Editor | null;
};

export const PlanEditor = ({ editor }: Props) => (
  <div className="border border-[#efe6d6] rounded-xl p-8 bg-[#fbf8f2] h-full">
    <EditorContent
      editor={editor}
      className="tiptap prose prose-sm max-w-none text-[0.8rem] leading-4"
    />
  </div>
);
