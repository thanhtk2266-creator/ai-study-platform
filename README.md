# AI Study Platform - Nền tảng ôn thi thông minh với AI

Nền tảng ôn thi/luyện đề sử dụng AI để tự động sinh câu hỏi trắc nghiệm từ tài liệu người dùng upload.

## 🚀 Tính năng

- **Upload tài liệu**: Hỗ trợ PDF, PowerPoint (PPTX)
- **AI tạo câu hỏi**: Tự động sinh bộ câu hỏi trắc nghiệm (MCQ) từ nội dung tài liệu
- **Luyện đề**: Giao diện làm bài trực quan, có đếm giờ
- **Chấm điểm & giải thích**: Xem kết quả chi tiết với giải thích đáp án từng câu
- **Dashboard**: Quản lý tài liệu và lịch sử làm bài

## 🏗 Kiến trúc

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    Frontend     │     │    Backend      │     │    Storage      │
│   Next.js 14    │───> │    FastAPI      │───> |  PostgreSQL     │
│   TypeScript    │     │    LangChain    │     │  ChromaDB       │
│   Tailwind CSS  │     │   Google Gemini │     │  File System    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## 📋 Yêu cầu

- **Node.js** >= 18.0
- **Python** >= 3.11
- **PostgreSQL** >= 15
- **Docker & Docker Compose** (khuyên dùng)

## 🔧 Cài đặt & Chạy

### Cách 1: Docker Compose (Khuyên dùng)

```bash
# Clone project
git clone <repo-url>
cd ai-study-platform

# Copy env file
cp .env.example .env
# Chỉnh sửa .env, thêm GEMINI_API_KEY

# Chạy tất cả services
docker-compose up -d

# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Cách 2: Chạy thủ công

#### Backend
```bash
cd backend

# Tạo virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# hoặc: venv\Scripts\activate  # Windows

# Cài đặt dependencies
pip install -r requirements.txt

# Chạy server
uvicorn src.main:app --reload --port 8000
```

#### Frontend
```bash
cd frontend

# Cài đặt dependencies
npm install

# Chạy dev server
npm run dev
```

## 📁 Cấu trúc thư mục

```
ai-study-platform/
├── frontend/                # Next.js 14 application
│   ├── src/
│   │   ├── app/             # App Router pages
│   │   ├── components/      # React components
│   │   │   ├── ui/          # Reusable UI components
│   │   │   ├── layout/      # Header, Footer
│   │   │   ├── upload/      # File upload components
│   │   │   └── quiz/        # Quiz-related components
│   │   ├── lib/             # Utilities & API client
│   │   └── types/           # TypeScript definitions
│   └── package.json
│
├── backend/                 # FastAPI application
│   ├── src/
│   │   ├── api/v1/          # API endpoints
│   │   ├── core/            # Config & database
│   │   ├── models/          # SQLAlchemy models
│   │   ├── schemas/         # Pydantic schemas
│   │   ├── services/        # Business logic
│   │   └── main.py          # App entry point
│   └── requirements.txt
│
├── docker-compose.yml
├── .env.example
└── README.md
```

## 🔌 API Endpoints

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| `POST` | `/api/v1/documents/upload` | Upload tài liệu |
| `GET` | `/api/v1/documents` | Danh sách tài liệu |
| `GET` | `/api/v1/documents/{id}` | Chi tiết tài liệu |
| `POST` | `/api/v1/quizzes/generate` | Tạo quiz từ tài liệu |
| `GET` | `/api/v1/quizzes/{id}` | Lấy quiz (làm bài) |
| `POST` | `/api/v1/quizzes/{id}/submit` | Nộp bài & chấm điểm |
| `GET` | `/api/v1/quizzes/{id}/results` | Xem kết quả chi tiết |

## 🤖 AI Pipeline

1. **Upload** → Người dùng tải lên PDF/PPTX
2. **Parse** → Trích xuất văn bản từ tài liệu
3. **Chunk** → Chia văn bản thành các đoạn nhỏ (1000 ký tự, overlap 200)
4. **Embed** → Tạo embeddings và lưu vào ChromaDB
5. **RAG** → Retrieve relevant chunks khi tạo câu hỏi
6. **Generate** → GPT sinh câu hỏi trắc nghiệm dựa trên context
7. **Score** → Chấm điểm và giải thích đáp án

## 📝 License

MIT
