import { Editor } from "@tinymce/tinymce-react";
import type { Editor as TinyMCEEditor } from "tinymce";
import { useRef } from "react";

// TinyMCE self-hosted (GPL) — no cloud API key required.
import "tinymce/tinymce";
import "tinymce/models/dom";
import "tinymce/themes/silver";
import "tinymce/icons/default";
import "tinymce/skins/ui/oxide/skin.min.css";
import "tinymce/plugins/advlist";
import "tinymce/plugins/autolink";
import "tinymce/plugins/lists";
import "tinymce/plugins/link";
import "tinymce/plugins/image";
import "tinymce/plugins/charmap";
import "tinymce/plugins/anchor";
import "tinymce/plugins/searchreplace";
import "tinymce/plugins/visualblocks";
import "tinymce/plugins/code";
import "tinymce/plugins/fullscreen";
import "tinymce/plugins/insertdatetime";
import "tinymce/plugins/media";
import "tinymce/plugins/table";
import "tinymce/plugins/preview";
import "tinymce/plugins/help";
import "tinymce/plugins/wordcount";
import "tinymce/plugins/directionality";
import "tinymce/skins/content/default/content.js";
import "tinymce/skins/ui/oxide/content.js";

import { articleRichTextEditorVariants } from "./ArticleRichTextEditor.styles";
import type { ArticleRichTextEditorProps } from "./ArticleRichTextEditor.types";

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
        value={value}
        onEditorChange={(content) => onChange(content)}
        onInit={(_evt, editor) => {
          editorRef.current = editor;
        }}
        init={{
          height: 420,
          menubar: false,
          branding: false,
          promotion: false,
          directionality: "rtl",
          language: "en",
          plugins: [
            "advlist",
            "autolink",
            "lists",
            "link",
            "image",
            "charmap",
            "anchor",
            "searchreplace",
            "visualblocks",
            "code",
            "fullscreen",
            "insertdatetime",
            "media",
            "table",
            "preview",
            "help",
            "wordcount",
            "directionality",
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
