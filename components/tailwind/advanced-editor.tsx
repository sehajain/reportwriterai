"use client";
import { defaultEditorContent } from "@/lib/content";
import {
  EditorCommand,
  EditorCommandEmpty,
  EditorCommandItem,
  EditorCommandList,
  EditorContent,
  type EditorInstance,
  EditorRoot,
  type JSONContent,
} from "novel";
import { ImageResizer, handleCommandNavigation } from "novel/extensions";
import { useDropzone } from "react-dropzone";
import { useEffect, useState, useCallback } from "react";
import { useDebouncedCallback } from "use-debounce";
import { defaultExtensions } from "./extensions";
import { ColorSelector } from "./selectors/color-selector";
import { LinkSelector } from "./selectors/link-selector";
import { NodeSelector } from "./selectors/node-selector";
import { Separator } from "./ui/separator";
import { handleImageDrop, handleImagePaste } from "novel/plugins";
import GenerativeMenuSwitch from "./generative/generative-menu-switch";
import { uploadFn } from "./image-upload";
import { TextButtons } from "./selectors/text-buttons";
import { slashCommand, suggestionItems } from "./slash-command";
import { useAtom } from 'jotai';
import { generatedContent, initialContent as initialContentAtom } from "@/lib/atom";
import CrazySpinner from "@/components/tailwind/ui/icons/crazy-spinner";
import { aiOptions as options } from "@/components/tailwind/generative/ai-selector-options";
import { Button } from "@/components/tailwind/ui/button";
import { useCompletion } from "ai/react";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/tailwind/ui/popover";
import { Check, ChevronDown } from "lucide-react";
type FileWithPreview = File & {
  preview: string;
};

const extensions = [...defaultExtensions, slashCommand];

const TailwindAdvancedEditor = () => {
  const [initialContent, setInitialContent] = useAtom(initialContentAtom); // useState<null | JSONContent>(null);
  const [saveStatus, setSaveStatus] = useState("Saved");
  const [charsCount, setCharsCount] = useState();

  const [openNode, setOpenNode] = useState(false);
  const [openColor, setOpenColor] = useState(false);
  const [openLink, setOpenLink] = useState(false);
  const [openAI, setOpenAI] = useState(false);
  const [content, setContent] = useAtom(generatedContent);
  const [file, setFile] = useState<FileWithPreview | null>(null);
  const [uploadStatus, setUploadStatus] = useState<
    "success" | "failure" | null
  >(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [base64URL, setBase64URL] = useState<string | null>(null);
  const [response, setResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const debouncedUpdates = useDebouncedCallback(async (editor: EditorInstance) => {
    const json = editor.getJSON();
    setCharsCount(editor.storage.characterCount.words());
    window.localStorage.setItem("html-content", editor.getHTML());
    window.localStorage.setItem("novel-content", JSON.stringify(json));
    window.localStorage.setItem("markdown", editor.storage.markdown.getMarkdown());
    if(json) setContent(JSON.parse(window.localStorage.getItem("novel-content")));
    setSaveStatus("Saved");
  }, 500);

  useEffect(() => {
    const content = window.localStorage.getItem("novel-content");
    if (content){
      setInitialContent(JSON.parse(content));
      setContent(JSON.parse(content));
    } 
    else{
      setInitialContent(defaultEditorContent);
      setContent(defaultEditorContent);
    } 
  }, []);

  // useEffect(() => {
  //   if (content) {
  //     // Create a new object reference to ensure re-render
  //     setInitialContent({ ...content });
  //   }
  // }, [content]);

  
  const Dropzone = () => {
    const onDrop = useCallback((acceptedFiles) => {
      if (acceptedFiles.length) {
        const uploadedFile = acceptedFiles[0];
        if (uploadedFile.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
          setFile(uploadedFile);
          convertToBase64(uploadedFile);
        } else {
          setAlertMessage("Please select a .docx file");
        }
      }
    }, []);
  
    const convertToBase64 = (file) => {
      setIsLoading(true);
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        try {
          const base64String = reader.result as string;
          const base64URL = base64String.split(",")[1];
          setBase64URL(base64URL);
  
          const res = await fetch("/api/upload-file", {
            method: "POST",
            body: JSON.stringify({ file: base64URL }),
            headers: {
              'Content-Type': 'application/json'
            }
          });
  
          if (!res.ok) {
            throw new Error(`Error: ${res.statusText}`);
          }
  
          const data = await res.json();
          setInitialContent(data.content);
  
          setResponse(data);
          setUploadStatus("success");
        } catch (error) {
          console.error("Error uploading file:", error);
          setAlertMessage(`Error uploading file: ${error.message}`);
          setUploadStatus("failure");
        } finally {
          setIsLoading(false);
        }
      };
  
      reader.onerror = (error) => {
        console.error("Error converting file to base64:", error);
        setAlertMessage("Error converting file to base64");
        setIsLoading(false);
      };
    };
  
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      accept: {
        "application/msword": [".doc"],
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      },
      maxFiles: 1,
      onDrop,
    });
  
    return (
      <section>
        <div {...getRootProps()}>
          <button
            className="bg-gray-500 flex w-full justify-center items-center text-white py-1 px-6 rounded-lg ${
              isLoad ? 'cursor-not-allowed' : ''
            }`"
            disabled={isLoading}
          >
            <input {...getInputProps({ multiple: false })} />
            {isLoading ? "Importing..." : "Import"}
          </button>
        </div>
        {alertMessage && <div className="alert">{alertMessage}</div>}
      </section>
    );
  }

  if (!initialContent) return null;

  return (
    <div className="relative w-full">
      <div className="bg-custom-gradient rounded flex m-auto">
        {/* <Section /> */}
      </div>
      <EditorRoot>
        <EditorContent
          key={JSON.stringify(initialContent)} // Use a key to force re-initialization
          initialContent={initialContent}
          extensions={extensions}
          className="border-muted bg-background rounded-lg h-[calc(100vh-100px)] overflow-y-auto"
          // className="relative h-full w-full shadow-blue-900 border-muted bg-background sm:rounded-lg sm:border sm:shadow-lg"
          editorProps={{
            handleDOMEvents: {
              keydown: (_view, event) => handleCommandNavigation(event),
            },
            handlePaste: (view, event) => handleImagePaste(view, event, uploadFn),
            handleDrop: (view, event, _slice, moved) => handleImageDrop(view, event, moved, uploadFn),
            attributes: {
              class:
                "prose prose-lg dark:prose-invert prose-headings:font-title font-default focus:outline-none max-w-full",
            },
          }}
          onUpdate={({ editor }) => {
            debouncedUpdates(editor);
            setSaveStatus("Unsaved");
          }}
          slotAfter={<ImageResizer />}
        >
          <div className="flex absolute right-5 top-5 z-10 mb-5 gap-2">
            <Dropzone />
          {/* <div className="mt-3 text-sm text-muted-foreground"><CrazySpinner color="black" /></div> */}
            <div className="relative bg-accent px-2 py-1 text-sm text-muted-foreground">{saveStatus}</div>
            <div className={charsCount ? "rounded-lg bg-accent px-2 py-1 text-sm text-muted-foreground" : "hidden"}>
              {charsCount} Words
            </div>
          </div>
          <EditorCommand className="z-50 h-auto max-h-[330px] overflow-y-auto rounded-md border border-muted bg-background px-1 py-2 shadow-md transition-all">
            <EditorCommandEmpty className="px-2 text-muted-foreground">No results</EditorCommandEmpty>
            <EditorCommandList>
              {suggestionItems.map((item) => (
                <EditorCommandItem
                  value={item.title}
                  onCommand={(val) => item.command(val)}
                  className="flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm hover:bg-accent aria-selected:bg-accent"
                  key={item.title}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-md border border-muted bg-background">
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                </EditorCommandItem>
              ))}
            </EditorCommandList>
          </EditorCommand>

          <GenerativeMenuSwitch open={openAI} onOpenChange={setOpenAI}>
            <Separator orientation="vertical" />
            <NodeSelector open={openNode} onOpenChange={setOpenNode} />
            <Separator orientation="vertical" />
            <LinkSelector open={openLink} onOpenChange={setOpenLink} />
            <Separator orientation="vertical" />
            <TextButtons />
            <Separator orientation="vertical" />
            <ColorSelector open={openColor} onOpenChange={setOpenColor} />
          </GenerativeMenuSwitch>
        </EditorContent>
      </EditorRoot>
    </div>
  );
};

export default TailwindAdvancedEditor;
