// Defines a parser and serializer for [CommonMark](http://commonmark.org/) text.
import removeMarkdown from "markdown-to-text"

export {schema} from "./schema"
export {defaultMarkdownParser, MarkdownParser} from "./from_markdown"
export {MarkdownSerializer, defaultMarkdownSerializer, MarkdownSerializerState} from "./to_markdown"
export const to_plain_text = removeMarkdown

