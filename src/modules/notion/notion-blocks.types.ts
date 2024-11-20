export type CustomRichTextItemRequest = {
    type: 'text'
    text: { content: string }
    annotations?: {
        bold?: boolean
        italic?: boolean
        underline?: boolean
        strikethrough?: boolean
        code?: boolean
    }
}
