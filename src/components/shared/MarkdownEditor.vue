<script setup>
import { watch, onBeforeUnmount } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
import { Markdown } from '@tiptap/markdown'
import { NButton, NButtonGroup, NTooltip } from 'naive-ui'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: 'Write something...',
  },
})

const emit = defineEmits(['update:modelValue'])

// Helper to get markdown from editor
const getMarkdown = (editor) => {
  return editor.markdown.serialize(editor.getJSON())
}

const editor = useEditor({
  extensions: [
    StarterKit.configure({
      heading: {
        levels: [1, 2, 3],
      },
    }),
    Placeholder.configure({
      placeholder: props.placeholder,
    }),
    Link.configure({
      openOnClick: false,
    }),
    Markdown.configure({
      html: false,
      transformPastedText: true,
      transformCopiedText: true,
    }),
  ],
  onCreate: ({ editor }) => {
    if (props.modelValue) {
      editor.commands.setContent(props.modelValue, { contentType: 'markdown' })
    }
  },
  onUpdate: ({ editor }) => {
    if (!editor) return
    const markdown = getMarkdown(editor)
    emit('update:modelValue', markdown)
  },
})

// Watch for external changes to modelValue
watch(
  () => props.modelValue,
  (newValue) => {
    if (editor.value) {
      const currentMarkdown = getMarkdown(editor.value)
      if (newValue !== currentMarkdown) {
        editor.value.commands.setContent(newValue || '', { contentType: 'markdown' })
      }
    }
  }
)

onBeforeUnmount(() => {
  editor.value?.destroy()
})

// Validate URL to prevent XSS
const isValidUrl = (url) => {
  try {
    const parsed = new URL(url, window.location.origin)
    return ['http:', 'https:', 'mailto:'].includes(parsed.protocol)
  } catch {
    return false
  }
}

// Toolbar actions
const setLink = () => {
  const previousUrl = editor.value?.getAttributes('link').href
  const url = window.prompt('URL', previousUrl)

  if (url === null) return
  if (url === '') {
    editor.value?.chain().focus().extendMarkRange('link').unsetLink().run()
    return
  }

  // Validate URL protocol to prevent javascript: XSS
  if (!isValidUrl(url)) {
    window.alert('Only http, https, and mailto links are allowed')
    return
  }

  editor.value?.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
}

// History state helpers
const canUndo = () => editor.value?.can().undo() ?? false
const canRedo = () => editor.value?.can().redo() ?? false
</script>

<template>
  <div class="markdown-editor">
    <div class="toolbar" role="toolbar" aria-label="Text formatting">
      <n-button-group size="small">
        <n-tooltip trigger="hover">
          <template #trigger>
            <n-button
              :type="editor?.isActive('bold') ? 'primary' : 'default'"
              aria-label="Bold"
              @click="editor?.chain().focus().toggleBold().run()"
            >
              B
            </n-button>
          </template>
          Bold
        </n-tooltip>

        <n-tooltip trigger="hover">
          <template #trigger>
            <n-button
              :type="editor?.isActive('italic') ? 'primary' : 'default'"
              aria-label="Italic"
              @click="editor?.chain().focus().toggleItalic().run()"
            >
              <em>I</em>
            </n-button>
          </template>
          Italic
        </n-tooltip>

        <n-tooltip trigger="hover">
          <template #trigger>
            <n-button
              :type="editor?.isActive('strike') ? 'primary' : 'default'"
              aria-label="Strikethrough"
              @click="editor?.chain().focus().toggleStrike().run()"
            >
              <s>S</s>
            </n-button>
          </template>
          Strikethrough
        </n-tooltip>
      </n-button-group>

      <n-button-group size="small">
        <n-tooltip trigger="hover">
          <template #trigger>
            <n-button
              :type="editor?.isActive('heading', { level: 1 }) ? 'primary' : 'default'"
              aria-label="Heading 1"
              @click="editor?.chain().focus().toggleHeading({ level: 1 }).run()"
            >
              H1
            </n-button>
          </template>
          Heading 1
        </n-tooltip>

        <n-tooltip trigger="hover">
          <template #trigger>
            <n-button
              :type="editor?.isActive('heading', { level: 2 }) ? 'primary' : 'default'"
              aria-label="Heading 2"
              @click="editor?.chain().focus().toggleHeading({ level: 2 }).run()"
            >
              H2
            </n-button>
          </template>
          Heading 2
        </n-tooltip>

        <n-tooltip trigger="hover">
          <template #trigger>
            <n-button
              :type="editor?.isActive('heading', { level: 3 }) ? 'primary' : 'default'"
              aria-label="Heading 3"
              @click="editor?.chain().focus().toggleHeading({ level: 3 }).run()"
            >
              H3
            </n-button>
          </template>
          Heading 3
        </n-tooltip>
      </n-button-group>

      <n-button-group size="small">
        <n-tooltip trigger="hover">
          <template #trigger>
            <n-button
              :type="editor?.isActive('bulletList') ? 'primary' : 'default'"
              aria-label="Bullet list"
              @click="editor?.chain().focus().toggleBulletList().run()"
            >
              &bull;
            </n-button>
          </template>
          Bullet List
        </n-tooltip>

        <n-tooltip trigger="hover">
          <template #trigger>
            <n-button
              :type="editor?.isActive('orderedList') ? 'primary' : 'default'"
              aria-label="Numbered list"
              @click="editor?.chain().focus().toggleOrderedList().run()"
            >
              1.
            </n-button>
          </template>
          Numbered List
        </n-tooltip>
      </n-button-group>

      <n-button-group size="small">
        <n-tooltip trigger="hover">
          <template #trigger>
            <n-button
              :type="editor?.isActive('code') ? 'primary' : 'default'"
              aria-label="Inline code"
              @click="editor?.chain().focus().toggleCode().run()"
            >
              &lt;&gt;
            </n-button>
          </template>
          Inline Code
        </n-tooltip>

        <n-tooltip trigger="hover">
          <template #trigger>
            <n-button
              :type="editor?.isActive('codeBlock') ? 'primary' : 'default'"
              aria-label="Code block"
              @click="editor?.chain().focus().toggleCodeBlock().run()"
            >
              { }
            </n-button>
          </template>
          Code Block
        </n-tooltip>

        <n-tooltip trigger="hover">
          <template #trigger>
            <n-button
              :type="editor?.isActive('link') ? 'primary' : 'default'"
              aria-label="Insert link"
              @click="setLink"
            >
              Link
            </n-button>
          </template>
          Add Link
        </n-tooltip>
      </n-button-group>

      <n-button-group size="small">
        <n-tooltip trigger="hover">
          <template #trigger>
            <n-button
              :disabled="!canUndo()"
              aria-label="Undo"
              @click="editor?.chain().focus().undo().run()"
            >
              Undo
            </n-button>
          </template>
          Undo
        </n-tooltip>

        <n-tooltip trigger="hover">
          <template #trigger>
            <n-button
              :disabled="!canRedo()"
              aria-label="Redo"
              @click="editor?.chain().focus().redo().run()"
            >
              Redo
            </n-button>
          </template>
          Redo
        </n-tooltip>
      </n-button-group>
    </div>

    <editor-content :editor="editor" class="editor-content" role="textbox" aria-multiline="true" />
  </div>
</template>

<style scoped>
.markdown-editor {
  border: 1px solid var(--n-border-color);
  border-radius: 4px;
  background: var(--n-color);
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px;
  border-bottom: 1px solid var(--n-border-color);
  background: var(--n-color-modal);
}

.editor-content {
  min-height: 200px;
  padding: 12px;
}

.editor-content :deep(.tiptap) {
  outline: none;
  min-height: 180px;
}

.editor-content :deep(.tiptap p.is-editor-empty:first-child::before) {
  content: attr(data-placeholder);
  float: left;
  color: var(--n-placeholder-color);
  pointer-events: none;
  height: 0;
}

.editor-content :deep(.tiptap h1) {
  font-size: 1.5em;
  font-weight: bold;
  margin: 0.5em 0;
}

.editor-content :deep(.tiptap h2) {
  font-size: 1.3em;
  font-weight: bold;
  margin: 0.5em 0;
}

.editor-content :deep(.tiptap h3) {
  font-size: 1.1em;
  font-weight: bold;
  margin: 0.5em 0;
}

.editor-content :deep(.tiptap ul),
.editor-content :deep(.tiptap ol) {
  padding-left: 1.5em;
  margin: 0.5em 0;
}

.editor-content :deep(.tiptap code) {
  background: var(--n-color-modal);
  padding: 2px 4px;
  border-radius: 3px;
  font-family: monospace;
}

.editor-content :deep(.tiptap pre) {
  background: var(--n-color-modal);
  padding: 12px;
  border-radius: 4px;
  overflow-x: auto;
}

.editor-content :deep(.tiptap pre code) {
  background: none;
  padding: 0;
}

.editor-content :deep(.tiptap a) {
  color: var(--n-text-color-primary);
  text-decoration: underline;
}

.editor-content :deep(.tiptap blockquote) {
  border-left: 3px solid var(--n-border-color);
  padding-left: 1em;
  margin: 0.5em 0;
  color: var(--n-text-color-secondary);
}
</style>
