import { useEffect, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import {
  convertHtmlToMarkdown,
  convertMarkdownToHtml,
  getInitialPlanState,
  loadPlanPathList,
  loadPlanState,
  savePlanContent,
} from "./scripts";

type Props = {
  title?: string;
};

const resolveSelectedPath = ({
  currentPath,
  pathList,
}: {
  currentPath?: string;
  pathList: Array<string>;
}) => {
  if (currentPath && pathList.includes(currentPath)) {
    return currentPath;
  }
  const [firstPath] = pathList;
  return firstPath;
};

const buildProjectLabel = ({ pathValue }: { pathValue: string }) => {
  const segmentList = pathValue.split("/");
  const baseIndex = segmentList.findIndex((segment) => segment === "Projects");
  const projectName = baseIndex >= 0 ? segmentList[baseIndex + 1] : undefined;
  return projectName ?? pathValue;
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
          {planPathList.length ? (
            <label className="grid gap-1.5 text-[0.85rem] text-[#5b4f43]">
              <span className="text-[0.8rem] text-[#7a6a58]">読み込むplan.md</span>
              <select
                className="appearance-none border border-[#e6dfd3] rounded-[10px] px-3 py-2 bg-white text-[0.9rem] text-[#2e241c]"
                value={selectedPath ?? ""}
                onChange={(event) => setSelectedPath(event.target.value)}
              >
                {planPathList.map((pathValue) => (
                  <option key={pathValue} value={pathValue}>
                    {buildProjectLabel({
                      pathValue,
                    })}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <div className="h-[65px] bg-gradient-to-r from-[#f0e7d7] via-[#fff6e6] to-[#f0e7d7] bg-[length:200%_100%] rounded-md" />
          )}
          <div className="flex-1">
            {planState.loading || planPathList.length === 0 ? (
              <div
                className="border border-[#efe6d6] rounded-xl p-4 bg-[#fbf8f2] flex flex-col gap-1 h-full"
                aria-label="Loading plan"
              >
                {Array.from({
                  length: 10,
                }).map((_, index) => (
                  <div key={index} className="flex flex-col gap-4">
                    <div className="h-3.5 rounded-full bg-gradient-to-r from-[#f0e7d7] via-[#fff6e6] to-[#f0e7d7] bg-[length:200%_100%] animate-shimmer w-full" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="border border-[#efe6d6] rounded-xl p-8 bg-[#fbf8f2] h-full">
                <EditorContent
                  editor={editor}
                  className="tiptap prose prose-sm max-w-none text-[0.8rem] leading-4"
                />
              </div>
            )}
          </div>
          {planState.error ? (
            <p className="m-0 text-[0.8rem] text-[#b33030]">{planState.error}</p>
          ) : null}
          {isSaving ? <p className="m-0 text-[0.8rem] text-[#7a6a58]">保存中...</p> : null}
          {saveError ? <p className="m-0 text-[0.8rem] text-[#b33030]">{saveError}</p> : null}
        </div>
      </section>
    </main>
  );
};
