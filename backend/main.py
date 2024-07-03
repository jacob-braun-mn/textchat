from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from langchain_huggingface import HuggingFaceEmbeddings
from transformers import pipeline
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

model_pipe = pipeline("text-generation", model="./models/Qwen2-1dot5B-Instruct")
embeddings = HuggingFaceEmbeddings(model_name="all-mpnet-base-v2")

@app.post("/search_document")
async def retrieve_record(textFile: UploadFile = File(...),
                          userQuery: str = Form(...),
                          chunkLen: int = Form(...),
                          aiSummaryEnabled: bool = Form(...),
                          topK: int = Form(...)):
    
    fileContent = await textFile.read()
    fullText = fileContent.decode("utf-8")
    
    db, splits = store_doc(fullText,
                           chunkLen,
                           embeddings)
    
    highlights, docviewer_text = get_relevant_docs(splits,
                                                    userQuery,
                                                    db,
                                                    topK)
    
    if aiSummaryEnabled:
        model_answer = get_answer(highlights,
                                  userQuery,
                                  model_pipe)
    else:
        model_answer = None

    response_obj = {
        'highlights': highlights,
        'docviewerText': docviewer_text,
        'modelSummary': model_answer,
    }

    return response_obj