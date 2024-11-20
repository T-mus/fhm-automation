import { Injectable } from '@nestjs/common'
import { BlockObjectRequest } from '@notionhq/client/build/src/api-endpoints'
import { CustomRichTextItemRequest } from './notion-blocks.types'
import { Token } from 'markdown-it'

@Injectable()
export class NotionBlocksService {
    createParagraphBlock(content: CustomRichTextItemRequest[]): BlockObjectRequest {
        return {
            object: 'block',
            type: 'paragraph',
            paragraph: {
                rich_text: content,
            },
        }
    }

    createHeadingBlock(
        level: number | string,
        content: CustomRichTextItemRequest[],
    ): BlockObjectRequest {
        return {
            object: 'block',
            type: `heading_${level}`,
            [`heading_${level}`]: {
                rich_text: content,
            },
        } as BlockObjectRequest
    }

    createBulletedListItem(content: CustomRichTextItemRequest[]): BlockObjectRequest {
        return {
            object: 'block',
            type: 'bulleted_list_item',
            bulleted_list_item: {
                rich_text: content,
            },
        }
    }

    createNumberedListItem(content: CustomRichTextItemRequest[]): BlockObjectRequest {
        return {
            object: 'block',
            type: 'numbered_list_item',
            numbered_list_item: {
                rich_text: content,
            },
        }
    }

    buildRichText(tokens: Token[]) {
        if (!tokens) return []

        const richTextArray = []
        const activeAnnotations = {
            bold: false,
            italic: false,
            underline: false,
            strikethrough: false,
            code: false,
        }

        tokens.forEach((token) => {
            switch (token.type) {
                case 'strong_open':
                    activeAnnotations.bold = true
                    break
                case 'strong_close':
                    activeAnnotations.bold = false
                    break
                case 'em_open':
                    activeAnnotations.italic = true
                    break
                case 'em_close':
                    activeAnnotations.italic = false
                    break
                case 'underline_open':
                    activeAnnotations.underline = true
                    break
                case 'underline_close':
                    activeAnnotations.underline = false
                    break
                case 'text':
                    richTextArray.push({
                        type: 'text',
                        text: {
                            content: token.content,
                        },
                        annotations: { ...activeAnnotations },
                    })
                    break
            }
        })

        return richTextArray
    }
}
