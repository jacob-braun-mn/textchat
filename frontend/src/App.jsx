import React, { useState } from "react"
import axios from "axios"
import "./App.scss"
import DocViewer from "./docViewer/DocViewer"
import Controls from "./controls/Controls"
import Modal from "./modal/Modal"

function App() {
  const [documentText, setDocumentText] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [highlightChunks, setHighlightChunks] = useState([])
  const [highlights, setHighlights] = useState([])
  const [modelSummary, setModelSummary] = useState("")

  const handleTextSave = (newText) => {
    setDocumentText(newText)
    setHighlightChunks([])
    setHighlights([])
    setModelSummary("")
    setIsModalOpen(false)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
  }

  const handleAddEditText = () => {
    setIsModalOpen(true)
  }

  const handleSearch = async (
    userQuery,
    chunkLength,
    aiSummaryEnabled,
    topK
  ) => {
    try {
      const textBlob = new Blob([documentText], { type: "text/plain" })

      const formData = new FormData()
      formData.append("textFile", textBlob, "document.txt")
      formData.append("userQuery", userQuery)
      formData.append("chunkLen", chunkLength)
      formData.append("aiSummaryEnabled", aiSummaryEnabled)
      formData.append("topK", topK)

      const response = await axios.post(
        "https://jacob-braun-mn-textchatapi.hf.space/search_document",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      )
      setHighlightChunks(response.data.docviewerText)
      setHighlights(response.data.highlights)
      setModelSummary(response.data.modelSummary)
      console.log(response.data)
    } catch (error) {
      console.error("Search failed: ", error)
    }
  }

  const scrollToHighlight = (highlightIndex) => {
    const element = document.getElementById(`highlight-${highlightIndex}`)
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" })

      element.classList.add("animate-highlight")

      setTimeout(() => {
        element.classList.remove("animate-highlight")
      }, 2000)
    }
  }

  return (
    <div className="app-container">
      <div className="left-pane">
        <DocViewer content={documentText} highlightChunks={highlightChunks} />
      </div>
      <div className="right-pane">
        <Controls
          highlights={highlights}
          modelSummary={modelSummary}
          onHighlightClick={scrollToHighlight}
          onAddEditText={handleAddEditText}
          onSearch={handleSearch}
        />
      </div>
      {isModalOpen && (
        <Modal
          initialText={documentText}
          onSave={handleTextSave}
          onClose={handleModalClose}
        />
      )}
    </div>
  )
}

export default App
