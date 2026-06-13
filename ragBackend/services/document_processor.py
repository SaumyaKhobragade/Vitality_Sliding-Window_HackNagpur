import io
from typing import List
from pypdf import PdfReader
from docx import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
import config

class DocumentProcessor:
    def __init__(self):
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=config.CHUNK_SIZE,
            chunk_overlap=config.CHUNK_OVERLAP,
            length_function=len,
        )

    def extract_text_from_pdf(self, file_bytes: bytes) -> str:
        """Extract text from PDF file bytes."""
        try:
            pdf_file = io.BytesIO(file_bytes)
            reader = PdfReader(pdf_file)
            text = ""
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
            return text
        except Exception as e:
            print(f"Error extracting PDF text: {e}")
            raise ValueError(f"Failed to process PDF file: {str(e)}")

    def extract_text_from_docx(self, file_bytes: bytes) -> str:
        """Extract text from DOCX file bytes."""
        try:
            docx_file = io.BytesIO(file_bytes)
            doc = Document(docx_file)
            text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
            return text
        except Exception as e:
            print(f"Error extracting DOCX text: {e}")
            raise ValueError(f"Failed to process DOCX file: {str(e)}")

    def extract_text_from_txt(self, file_bytes: bytes) -> str:
        """Extract text from plain text file bytes."""
        try:
            return file_bytes.decode("utf-8", errors="ignore")
        except Exception as e:
            print(f"Error extracting TXT text: {e}")
            raise ValueError(f"Failed to process TXT file: {str(e)}")

    def extract_text(self, filename: str, file_bytes: bytes) -> str:
        """Automatically select extraction method based on filename extension."""
        ext = filename.split(".")[-1].lower()
        if ext == "pdf":
            return self.extract_text_from_pdf(file_bytes)
        elif ext in ["docx", "doc"]:
            return self.extract_text_from_docx(file_bytes)
        elif ext == "txt":
            return self.extract_text_from_txt(file_bytes)
        else:
            raise ValueError(f"Unsupported file format: .{ext}")

    def chunk_text(self, text: str, metadata: dict = None) -> List[dict]:
        """Split text into chunks with associated metadata."""
        if not text or not text.strip():
            return []
        
        chunks = self.text_splitter.split_text(text)
        chunk_docs = []
        for i, chunk in enumerate(chunks):
            chunk_metadata = (metadata or {}).copy()
            chunk_metadata["chunk_index"] = i
            chunk_docs.append({
                "page_content": chunk,
                "metadata": chunk_metadata
            })
        return chunk_docs
