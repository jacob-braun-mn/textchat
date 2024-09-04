# TextChat

## Description

This application is a simple POC to demonstrate how in-memory vector search can be implemented to perform RAG.  The frontend is built with React and published via Github Pages.  The backend is built using FastAPI and hosted on Huggingface Spaces.  **NOTE:** If the app has not been used for 72 hours, the backend will need to spin up on HF Spaces before use.

## Instructions

When the application launches, a user can add/edit text to search against using the button in the top right of the UI.  For example, one could copy a research paper, news article, or medical journal.  The user can then type a query in the searchbox, which will be used as the input for RAG.  Vector search is performed in-memory and the generation component is executed using Qwen2-1dot5B-Instruct.

## Links

- [TextChat Application](https://jacob-braun-mn.github.io/textchat/)
- [TextChat API](https://huggingface.co/spaces/jacob-braun-mn/TextChatAPI)
