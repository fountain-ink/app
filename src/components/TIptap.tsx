'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

const Tiptap = () => {
  const editor = useEditor({
  extensions: [
    StarterKit,
  ],
  editorProps: {
    attributes: {
      class: 'prose prose-sm sm:prose-base lg:prose-lg m-5 focus:outline-none rounded-lg p-8',
    },
  },

  content: `
    <h2>
      Hi there,
    </h2>
    <p>
      your fountastic 🖋  journey starts here.
    </p>
    <ul>
      <li>
        That’s a bullet list with one …
      </li>
      <li>
        … or two list items.
      </li>
    </ul>
    <p>
      Isn’t that great? And all of that is editable. But wait, there’s more. Let’s try a code block:
    </p>
<pre><code class="language-css">body {
  display: none;
}</code></pre>
    <p>
      I know, I know, this is impressive. It’s only the tip of the iceberg though. Give it a try and click a little bit around.
    </p>
    <blockquote>
      Wow, that’s amazing. Good work! 👏
      <br />
      — Mom
    </blockquote>
  `,
})

  return (
    <EditorContent editor={editor} />
  )
}

export default Tiptap