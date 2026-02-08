import { useEffect, useRef, useState } from "react";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import {
  convertHtmlToMarkdown,
  convertMarkdownToHtml,
  getInitialPlanState,
  loadPlanPathList,
  loadPlanState,
  resolveSelectedPath,
  savePlanContent,
} from "./scripts";
import { PlanEditor } from "./PlanEditor";
import { PlanSelector } from "./PlanSelector";
import { PlanSkeleton } from "./PlanSkeleton";
import { PlanStatus } from "./PlanStatus";

type Props = {
  title?: string;
};

export const App = ({ title = "Markdown Studio" }: Props) => {
  const [planState, setPlanState] = useState(getInitialPlanState);
  const [planPathList, setPlanPathList] = useState<Array<string>>([]);
  const [selectedPath, setSelectedPath] = useState<string | undefined>(undefined);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const latestMarkdownRef = useRef<string>("");
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "plan.md を編集できます。",
      }),
    ],
    content: "",
    onFocus: () => setIsEditing(true),
    onBlur: () => setIsEditing(false),
  });

  useEffect(() => {
    let mounted = true;

    // 外部ファイルの変更を取り込むため、一定間隔で再読込する。
    const updatePlanState = async () => {
      const nextState = await loadPlanState({
        pathValue: selectedPath,
      });
      if (mounted) {
        setPlanState(nextState);
        latestMarkdownRef.current = nextState.content;
        if (editor && !isEditing) {
          const html = convertMarkdownToHtml({
            markdown: nextState.content,
          });
          editor.commands.setContent(html, false);
        }
      }
    };

    const intervalId = window.setInterval(updatePlanState, 1000);
    updatePlanState();

    return () => {
      mounted = false;
      window.clearInterval(intervalId);
    };
  }, [editor, isEditing, selectedPath]);

  useEffect(() => {
    let mounted = true;

    // 参照可能な plan 一覧を取得し、選択状態を安定させる。
    const updatePlanList = async () => {
      const nextList = await loadPlanPathList();
      if (!mounted) {
        return;
      }
      setPlanPathList(nextList);
      setSelectedPath((currentPath) =>
        resolveSelectedPath({
          currentPath,
          pathList: nextList,
        }),
      );
    };

    updatePlanList();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!editor || !selectedPath) {
      return;
    }

    // エディタの更新ごとに保存し、ファイル内容と同期する。
    const handleUpdate = () => {
      const html = editor.getHTML();
      const markdown = convertHtmlToMarkdown({
        html,
      });
      latestMarkdownRef.current = markdown;
      setIsSaving(true);
      setSaveError(null);
      savePlanContent({
        path: selectedPath,
        content: latestMarkdownRef.current,
      })
        .catch((error) => {
          setSaveError(error instanceof Error ? error.message : "Unknown error");
        })
        .finally(() => {
          setIsSaving(false);
        });
    };

    editor.on("update", handleUpdate);

    return () => {
      editor.off("update", handleUpdate);
    };
  }, [editor, selectedPath]);

  useEffect(() => {
    // タブ切り替え時に編集中状態を解除する。
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        setIsEditing(false);
        editor?.commands.blur();
      }
    };

    window.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [editor]);

  return (
    <main className="min-h-screen grid place-items-center px-6 py-12">
      <section className="bg-white border border-[#e6dfd3] rounded-2xl p-8 w-full h-full shadow-card flex flex-col">
        <h1 className="mb-3 text-[2.2rem]">{title}</h1>
        <div className="mt-6 border-t border-[#efe6d6] pt-4 gap-3 flex flex-col flex-1">
          <PlanSelector
            pathList={planPathList}
            selectedPath={selectedPath}
            onSelect={(nextPath) => setSelectedPath(nextPath)}
          />
          <div className="flex-1">
            {planState.loading || planPathList.length === 0 ? (
              <PlanSkeleton />
            ) : (
              <PlanEditor editor={editor} />
            )}
          </div>
          <PlanStatus isSaving={isSaving} loadError={planState.error} saveError={saveError} />
        </div>
      </section>
    </main>
  );
};
