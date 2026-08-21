import json
import chromadb
from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate
from src.core.config import settings

class AIService:
    def __init__(self):
        self.chroma_client = chromadb.PersistentClient(path=settings.CHROMA_PERSIST_DIR)
        self.llm = ChatOpenAI(
            model=settings.OPENAI_MODEL,
            api_key=settings.OPENAI_API_KEY,
            temperature=0.2
        )

    def get_or_create_collection(self):
        return self.chroma_client.get_or_create_collection(name=settings.CHROMA_COLLECTION_NAME)

    def store_embeddings(self, document_id: str, chunks: list[str]):
        collection = self.get_or_create_collection()
        
        ids = [f"{document_id}_{i}" for i in range(len(chunks))]
        metadatas = [{"document_id": document_id} for _ in chunks]
        
        collection.add(
            documents=chunks,
            metadatas=metadatas,
            ids=ids
        )

    def generate_quiz_questions(self, document_id: str, num_questions: int) -> list[dict]:
        collection = self.get_or_create_collection()
        
        # Get chunks for this document
        results = collection.get(
            where={"document_id": document_id},
            include=["documents"]
        )
        
        documents_text = results.get("documents", [])
        if not documents_text:
            raise ValueError("No content found for this document")
            
        context = "\n\n".join(documents_text[:10])
        
        prompt = PromptTemplate(
            input_variables=["context", "num_questions"],
            template="""
            Bạn là một trợ lý giáo dục chuyên nghiệp.
            Dựa vào nội dung sau đây, hãy tạo ra {num_questions} câu hỏi trắc nghiệm (MCQ).
            
            Nội dung:
            {context}
            
            Yêu cầu:
            - Tạo ra đúng {num_questions} câu hỏi.
            - Trả về danh sách câu hỏi dưới định dạng JSON (một mảng các object).
            - Các thuộc tính bắt buộc của mỗi câu hỏi:
              - "question_text": nội dung câu hỏi
              - "options": một object chứa 4 lựa chọn (các khoá là "A", "B", "C", "D")
              - "correct_answer": một chuỗi là "A", "B", "C", hoặc "D"
              - "explanation": giải thích chi tiết tại sao đáp án lại đúng dựa trên nội dung.
              
            Trả về CHỈ JSON, không bao gồm markdown formatting hay các chữ khác.
            """
        )
        
        chain = prompt | self.llm
        
        response = chain.invoke({
            "context": context,
            "num_questions": num_questions
        })
        
        try:
            content = response.content.strip()
            if content.startswith("```json"):
                content = content[7:-3]
            elif content.startswith("```"):
                content = content[3:-3]
                
            questions = json.loads(content)
            return questions
        except Exception as e:
            print("Failed to parse JSON", response.content)
            raise ValueError("AI did not return valid JSON format")
