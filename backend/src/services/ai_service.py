import json
import re
import chromadb
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import PromptTemplate
from src.core.config import settings

# Các dạng câu hỏi chuẩn để AI gán nhãn (dùng cho phân tích điểm yếu)
QUESTION_CATEGORIES = [
    "Từ vựng",
    "Ngữ pháp",
    "Đọc hiểu",
    "Suy luận",
    "Chi tiết",
    "Khác",
]

class AIService:
    def __init__(self):
        self.chroma_client = chromadb.PersistentClient(path=settings.CHROMA_PERSIST_DIR)
        self.llm = ChatGoogleGenerativeAI(
            model=settings.GEMINI_MODEL,
            google_api_key=settings.GEMINI_API_KEY,
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

    def _get_document_context(self, document_id: str, max_chunks: int = 10) -> str:
        """Lấy nội dung tài liệu từ ChromaDB để làm ngữ cảnh cho prompt."""
        collection = self.get_or_create_collection()
        results = collection.get(
            where={"document_id": document_id},
            include=["documents"]
        )
        documents_text = results.get("documents", [])
        if not documents_text:
            raise ValueError("No content found for this document")
        return "\n\n".join(documents_text[:max_chunks])

    @staticmethod
    def _parse_json_list(content: str) -> list[dict]:
        """Trích mảng JSON từ câu trả lời của LLM, chịu được markdown/whitespace."""
        content = content.strip()
        # Bóc ```json ... ``` hoặc ``` ... ```
        if "```" in content:
            fence = re.search(r"```(?:json)?\s*(.*?)```", content, re.DOTALL)
            if fence:
                content = fence.group(1).strip()
        # Tìm mảng ngoài cùng nhất
        match = re.search(r"\[.*\]", content, re.DOTALL)
        if match:
            content = match.group(0)
        return json.loads(content)

    def generate_quiz_questions(self, document_id: str, num_questions: int) -> list[dict]:
        context = self._get_document_context(document_id)

        prompt = PromptTemplate(
            input_variables=["context", "num_questions", "categories"],
            template="""
            Bạn là một chuyên gia tạo đề thi tiếng Anh (TOEIC) chuyên nghiệp.
            Dựa vào nội dung sau đây, hãy tạo ra {num_questions} câu hỏi trắc nghiệm (MCQ).

            Nội dung:
            {context}

            Yêu cầu:
            - Tạo ra đúng {num_questions} câu hỏi.
            - Trả về danh sách câu hỏi dưới dạng JSON (một mảng các object).
            - Các thuộc tính bắt buộc của mỗi câu hỏi:
              - "question_text": nội dung câu hỏi
              - "options": một object chứa 4 lựa chọn (các khoá là "A", "B", "C", "D")
              - "correct_answer": một chuỗi là "A", "B", "C", hoặc "D"
              - "explanation": giải thích chi tiết tại sao đáp án đúng dựa trên nội dung
              - "category": dạng câu hỏi, CHỈ chọn 1 trong: {categories}

            Trả về CHỈ JSON, không bao gồm markdown formatting hay chữ khác.
            """
        )

        chain = prompt | self.llm

        response = chain.invoke({
            "context": context,
            "num_questions": num_questions,
            "categories": ", ".join(QUESTION_CATEGORIES)
        })

        try:
            return self._parse_json_list(response.content)
        except Exception as e:
            print("Failed to parse JSON from LLM:", response.content)
            raise ValueError("AI did not return valid JSON format") from e

    def generate_flashcards(self, document_id: str, num_cards: int) -> list[dict]:
        """Trích xuất từ vựng tiếng Anh quan trọng từ tài liệu thành flashcard."""
        context = self._get_document_context(document_id)

        prompt = PromptTemplate(
            input_variables=["context", "num_cards"],
            template="""
            Bạn là chuyên gia từ vựng tiếng Anh.
            Đọc nội dung sau và trích xuất {num_cards} từ/cụm từ tiếng Anh quan trọng và đáng học nhất
            (ưu tiên từ học thuật, từ hay gặp trong đề TOEIC).

            Nội dung:
            {context}

            Yêu cầu:
            - Trả về JSON là một mảng object, mỗi object có:
              - "word": từ hoặc cụm từ tiếng Anh
              - "ipa": phiên âm IPA (bắt đầu và kết thúc bằng /)
              - "meaning": nghĩa tiếng Việt, ngắn gọn
              - "example": một câu ví dụ tiếng Anh tự nhiên có dùng từ đó
              - "synonyms": mảng các từ đồng nghĩa tiếng Anh (mảng rỗng nếu không có)
            - Nếu tài liệu ít từ tiếng Anh, có thể bổ sung từ vựng TOEIC liên quan chủ đề.
            - Không trùng lặp từ.

            Trả về CHỈ JSON, không markdown, không chữ khác.
            """
        )

        chain = prompt | self.llm
        response = chain.invoke({"context": context, "num_cards": num_cards})

        try:
            cards = self._parse_json_list(response.content)
        except Exception as e:
            print("Failed to parse flashcards JSON from LLM:", response.content)
            raise ValueError("AI did not return valid JSON format") from e

        # Chuẩn hoá dữ liệu, bỏ card thiếu từ
        cleaned = []
        for c in cards:
            word = (c.get("word") or "").strip()
            if not word:
                continue
            synonyms = c.get("synonyms") or []
            if not isinstance(synonyms, list):
                synonyms = [synonyms]
            cleaned.append({
                "word": word,
                "ipa": (c.get("ipa") or "").strip(),
                "meaning": (c.get("meaning") or "").strip(),
                "example": (c.get("example") or "").strip(),
                "synonyms": [str(s).strip() for s in synonyms if str(s).strip()],
            })
        return cleaned
