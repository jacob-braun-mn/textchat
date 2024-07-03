import React from "react"
import Markdown from "react-markdown"
import "./DocViewer.scss"

function DocViewer({ content, highlightChunks }) {
  const renderHighlights = highlightChunks.map((highlight, index) => {
    if (highlight.highlight_idx !== null) {
      return (
        <div
          className="highlight"
          id={`highlight-${highlight.highlight_idx}`}
          key={index}
        >
          <Markdown>{highlight.page_content}</Markdown>
        </div>
      )
    } else {
      return <Markdown key={index}>{highlight.page_content}</Markdown>
    }
  })

  return (
    <div className="doc-viewer">
      <h1>Document Viewer:</h1>
      <hr />
      {highlightChunks.length > 0 ? (
        renderHighlights
      ) : (
        <Markdown>{content}</Markdown>
      )}
    </div>
  )
}

export default DocViewer
