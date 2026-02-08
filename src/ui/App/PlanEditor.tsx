import type { Editor } from "@tiptap/core";
import { EditorContent } from "@tiptap/react";
import { appTheme } from "./theme";

type Props = {
  editor: Editor | null;
};

export const PlanEditor = ({ editor }: Props) => (
  <div
    className={`border ${appTheme.panel.border} rounded-xl p-8 ${appTheme.panel.background} h-full ${appTheme.text.primary}`}
  >
    <EditorContent
      editor={editor}
      className="tiptap prose prose-sm prose-invert max-w-none text-[0.8rem] leading-4"
    />
  </div>
);
