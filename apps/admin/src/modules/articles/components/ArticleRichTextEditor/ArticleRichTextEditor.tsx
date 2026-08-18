import { Editor } from "@tinymce/tinymce-react";
import type { Editor as TinyMCEEditor } from "tinymce";
import { useRef } from "react";

import { articleRichTextEditorVariants } from "./ArticleRichTextEditor.styles";
import type { ArticleRichTextEditorProps } from "./ArticleRichTextEditor.types";

const tinymceBase = `${import.meta.env.BASE_URL}tinymce`;

export function ArticleRichTextEditor({
  value,
  onChange,
  disabled,
  className,
}: ArticleRichTextEditorProps) {
  const styles = articleRichTextEditorVariants();
  const editorRef = useRef<TinyMCEEditor | null>(null);

  return (
    <div className={styles.root({ className })}>
      <Editor
        disabled={disabled}
        licenseKey="gpl"
        tinymceScriptSrc={`${tinymceBase}/tinymce.min.js`}
        value={value}
        onEditorChange={(content) => onChange(content)}
        onInit={(_evt, editor) => {
          editorRef.current = editor;
        }}
        init={{
          base_url: tinymceBase.replace(/\/$/, ""),
          suffix: ".min",
          height: 420,
          menubar: false,
          branding: false,
          promotion: false,
          directionality: "rtl",
          language: "en",
          plugins: [
            "lists",
            "link",
            "image",
            "table",
            "directionality",
            "code",
            "fullscreen",
          ],
          toolbar:
            "undo redo | blocks | bold italic underline forecolor | " +
            "alignright aligncenter alignleft alignjustify | " +
            "bullist numlist outdent indent | link image table | " +
            "ltr rtl | removeformat code fullscreen",
          content_style:
            "body { font-family: Vazirmatn, Tahoma, sans-serif; font-size: 15px; direction: rtl; }",
          skin: false,
          content_css: false,
        }}
      />
    </div>
  );
}
