'use client'

import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

import Collaboration from '@tiptap/extension-collaboration'
import * as Y from 'yjs'
import { TiptapCollabProvider } from '@hocuspocus/provider'
import { env } from '~/env'

const hocuspocusToken = env.NEXT_PUBLIC_HOCUSPOCUS_JWT_TOKEN;

const TiptapCollab = () => {
  const doc = new Y.Doc() 

  const provider = new TiptapCollabProvider({
    name: "document.name", // Unique document identifier for syncing. 
    appId: 'v91rwzmo', // Cloud Dashboard AppID or `baseURL` for on-premises
    token: hocuspocusToken, // JWT token
    document: doc,

     // The onSynced callback ensures initial content is set only once using editor.setContent(), preventing repetitive content insertion on editor syncs.
    onSynced() {

      if( !doc.getMap('config').get('initialContentLoaded') && editor ){
        doc.getMap('config').set('initialContentLoaded', true);

        editor.commands.setContent(`fountastic!`)
      }
    }
  })

  const editor = useEditor({
  extensions: [
    StarterKit.configure({
      history: false,
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
})

  return (
    <EditorContent editor={editor} />
  )
}

export default TiptapCollab