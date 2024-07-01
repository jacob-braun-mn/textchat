from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from helpers import store_doc, get_relevant_docs, get_answer
import os

load_dotenv(override=True)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Use hf models here
gpt_client = "instantiate model here"
embedding_client = "instantiate embedding model here"

@app.post("/search_document")
async def retrieve_record(textFile: UploadFile = File(...),
                          userQuery: str = Form(...),
                          chunkLen: int = Form(...),
                          overlapLen: int = Form(...),
                          aiSummaryEnabled: bool = Form(...),
                          topK: int = Form(...)):
    fileContent = await textFile.read()
    fullText = fileContent.decode("utf-8")
    
    db, splits = store_doc(fullText,
                           chunkLen,
                           overlapLen,
                           embedding_client)
    
    highlights, docviewer_text = get_relevant_docs(splits,
                                                    userQuery,
                                                    db,
                                                    topK)
    
    if aiSummaryEnabled:
        model_answer = get_answer(highlights,
                                  userQuery,
                                  gpt_client,
                                  "model_name")
    else:
        model_answer = None

    response_obj = {
        'highlights': highlights,
        'docviewerText': docviewer_text,
        'modelSummary': model_answer,
    }

    return response_obj