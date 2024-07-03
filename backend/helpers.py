from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.schema.document import Document
from langchain_community.vectorstores import FAISS
from typing import List, Dict, Union
import time


def store_doc(fullText, chunkLen, embeddingModel):
    text_splitter = RecursiveCharacterTextSplitter.from_tiktoken_encoder(
        model_name="gpt-4o",
        chunk_size=chunkLen,
        chunk_overlap=0,
        is_separator_regex=False,
    )

    splits = text_splitter.create_documents([fullText])
    for i, split in enumerate(splits):
        split.metadata['idx'] = i
        split.metadata['highlight'] = False
        split.metadata['similarity_rank'] = None
        split.metadata['similarity'] = None

    print(f"SPLIT LENGTH: {len(splits)}")
    print("Embedding and storing documents in memory...")
    if len(splits) > 100:
        db = FAISS.from_documents(splits[:100], embeddingModel)
        print(f"Docs 1 - 100 added to db.  Total docs: {len(splits)}")
        for i in range(100, len(splits), 100):
            db.add_documents(splits[i:i+100])
            print(f"Docs {i} - {i+100} added to db.  Total docs: {len(splits)}")
            time.sleep(2)
    else:
        db = FAISS.from_documents(splits, embeddingModel)
        print(f"Docs 1 - {len(splits)} added to db.  Total docs: {len(splits)}")

    return db, splits

def transform_documents(splits: List[Document]) -> List[Dict[str, Union[int, str, None]]]:
    result = []
    combined_non_highlight_content = ""

    for doc in splits:
        highlight_idx = doc.metadata['similarity_rank'] if doc.metadata['highlight'] else None
        if highlight_idx is not None:
            if combined_non_highlight_content:
                result.append(
                    {"highlight_idx": None, "page_content": combined_non_highlight_content.strip()}
                )
                combined_non_highlight_content = ""

            result.append({"highlight_idx": highlight_idx, "page_content": doc.page_content.strip()})
    
    if combined_non_highlight_content:
        result.append(
            {"highlight_idx": None, "page_content": combined_non_highlight_content.strip()}
        )

    return result

def get_relevant_docs(splits, userQuery, db, topK):
    print("Searching for relevant documents...")
    docs = db.similarity_search_with_relevance_scores(query=userQuery, k=topK)

    highlights = []
    for i, doc in enumerate(docs):
        doc[0].metadata['similarity'] = doc[1]
        doc[0].metadata['similarity_rank'] = i
        doc[0].metadata['highlight'] = True
        highlights.append({
            'page_content': doc[0].page_content,
            'similarity': doc[1],
            'similarity_rank': i,
            'highlight': True})

    docviewer_text = transform_documents(splits)

    return highlights, docviewer_text



def get_answer(highlights, question, model_pipe):
    instructions = """
    # INSTRUCTIONS\n\nYou are a helpful assistant that reviews relevant sections of clinical notes to answer user questions.  First, review the text provided under the # Highlighted Sections in the user message to familiarize yourself with the content.  Then, read the user question under the # Question section and think step by step through what information you need to answer their question.  Next, review the provided Highlighted Sections for context again and find the relevant information for the user's question.  Finally, synthesize that relevant information to answer the user's question.  Keep your answer fully grounded in the facts from the Highlight Sections and reply at a 10th grade reading level.  Keep your answer as concise as possible and only use relevant information from the provided documents.  If the Highlighted Sections do not contain the necessary facts to answer the user's question, please respond with 'I didn't find the necessary information.  Please try rephrasing your question or providing additional text.'  Provide your summary in markdown format but do not use H1 (#) or H2 (##) headers. 
    """

    documents = "# Highlighted Sections\n\n"
    for i, highlight in enumerate(highlights):
        documents += f"## Highlight {i+1}\n\n"
        documents += highlight['page_content'] + "\n\n"

    question = "# Question\n\n" + question + "\n\n"

    reminder = "REMEMBER:  Please keep your answer concise and fully grounded in the facts from the provided Highlighted Sections.  Do not provide your own opinion or add information that is not supported by the Highlighted Sections.  Provide your answer in markdown format but do not use H1 (#) or H2 (##) headers."

    messages = [
        {"role": "system", "content": instructions},
        {"role": "user", "content": documents + question + reminder}
    ]

    response = model_pipe(messages, max_length=4096, temperature=0.7, num_return_sequences=1)

    return response[0]['generated_text'][-1]['content']

