'use client'

import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

import Collaboration from '@tiptap/extension-collaboration'
import * as Y from 'yjs'
import { TiptapCollabProvider } from '@hocuspocus/provider'

const TiptapCollab = () => {
  const doc = new Y.Doc() 

  const provider = new TiptapCollabProvider({
    name: "document.name", // Unique document identifier for syncing. 
    appId: 'v91rwzmo', // Cloud Dashboard AppID or `baseURL` for on-premises
    token: 'notoken', // JWT token
    document: doc,

     // The onSynced callback ensures initial content is set only once using editor.setContent(), preventing repetitive content insertion on editor syncs.
    onSynced() {

      if( !doc.getMap('config').get('initialContentLoaded') && editor ){
        doc.getMap('config').set('initialContentLoaded', true);

        editor.commands.setContent(`
        <p>
          This is a radically reduced version of Tiptap. It has support for a document, with paragraphs and text. That’s it. It’s probably too much for real minimalists though.
        </p>
        <p>
          The paragraph extension is not really required, but you need at least one node. Sure, that node can be something different.
        </p>
        `)
      }
    }
  })

  const editor = useEditor({
  extensions: [
    StarterKit.configure({
            history: false, // Disables default history to use Collaboration's history management
    }),
    Paragraph,
    Document,
    Text,
    Collaboration.configure({
        document: doc // Configure Y.Doc for collaboration
      })

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
      I know, I know, this is impressive. It’s only the tip of the iceberg though. Give it a try and click a little bit around. Don’t forget to check the other examples too.
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

export default TiptapCollab