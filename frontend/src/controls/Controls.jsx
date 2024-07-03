import React, { useState } from "react"
import Markdown from "react-markdown"
import "./Controls.scss"

function Controls({
  onAddEditText,
  onSearch,
  highlights,
  modelSummary,
  onHighlightClick,
}) {
  const [userQuery, setUserQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [chunkLength, setChunkLength] = useState(300)
  const [aiSummaryEnabled, setAISummaryEnabled] = useState(true)
  const [topK, setTopK] = useState(3)

  const handleQueryChange = (e) => {
    setUserQuery(e.target.value)
  }

  const handleSearchClick = () => {
    setIsLoading(true)
    onSearch(userQuery, chunkLength, aiSummaryEnabled, topK).finally(() => {
      setIsLoading(false)
    })
  }

  const handleHighlightClick = (index) => {
    onHighlightClick(index)
  }

  const handleChunkLengthChange = (e) => {
    setChunkLength(e.target.value)
  }

  const handleAISummaryChange = (e) => {
    setAISummaryEnabled(e.target.checked)
  }

  const handleTopKChange = (e) => {
    setTopK(e.target.value)
  }

  const sortedAndLinkedHighlights = highlights.map((highlight) => (
    <a
      key={highlight.similarity_rank}
      href="#!"
      onClick={() => handleHighlightClick(highlight.similarity_rank)}
      className="similarity-link"
    >
      Source {highlight.similarity_rank + 1}: Similarity{" "}
      {highlight.similarity.toFixed(3)}
    </a>
  ))

  return (
    <div className="controls">
      <h1>User Controls:</h1>
      <hr />
      <div className="input-group">
        <button className="add-text" onClick={onAddEditText}>
          Add/Edit Text
        </button>
      </div>
      <hr />
      <h2>Search Your Data</h2>
      <div className="checkbox-group">
        <input
          id="ai-summary-checkbox"
          type="checkbox"
          checked={aiSummaryEnabled}
          onChange={handleAISummaryChange}
        />
        <label htmlFor="ai-summary-checkbox">AI Summary</label>
      </div>
      <div className="dropdown-group">
        <div className="dropdown-item">
          <label htmlFor="chunk-length-dropdown">Search Chunk Length: </label>
          <select
            id="chunk-length-dropdown"
            value={chunkLength}
            onChange={handleChunkLengthChange}
            className="dropdown"
          >
            <option value="100">100</option>
            <option value="200">200</option>
            <option value="300">300</option>
            <option value="400">400</option>
            <option value="500">500</option>
          </select>
        </div>
        <div className="dropdown-item">
          <label htmlFor="top-k-dropdown">Matches Retrieved: </label>
          <select
            id="top-k-dropdown"
            value={topK}
            onChange={handleTopKChange}
            className="dropdown"
          >
            <option value="1">1</option>
            <option value="3">3</option>
            <option value="5">5</option>
          </select>
        </div>
      </div>
      <div className="search-group">
        <textarea
          placeholder="Ask your question here..."
          value={userQuery}
          onChange={handleQueryChange}
        />
        <button
          onClick={handleSearchClick}
          disabled={isLoading}
          className={isLoading ? "loading" : ""}
        >
          {isLoading ? <div className="spinner"></div> : "Search"}
        </button>
      </div>
      {highlights.length > 0 && (
        <div className="search-results">
          <h2>Search Results</h2>
          {sortedAndLinkedHighlights}
          <div className="model-summary">
            <Markdown>{modelSummary}</Markdown>
          </div>
        </div>
      )}
    </div>
  )
}

export default Controls
