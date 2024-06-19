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
    token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE3MTg4MzE0MjgsIm5iZiI6MTcxODgzMTQyOCwiZXhwIjoxNzE4OTE3ODI4LCJpc3MiOiJodHRwczovL2Nsb3VkLnRpcHRhcC5kZXYiLCJhdWQiOiJ2OTFyd3ptbyJ9.z0bALIoyGgAGQ6CdDzwgSi7e3A66yLaFu-Lla_ld5oI', // JWT token
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
})

  return (
    <EditorContent editor={editor} />
  )
}

export default TiptapCollab