from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.upload import router as upload_router
from routes.chat import router as user_chat_router
from routes.auth import router as auth_router
from routes.summary import router as summary_router

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload_router)
app.include_router(user_chat_router)
app.include_router(auth_router)
app.include_router(summary_router)

@app.get("/")
def home():
    return {
        "message": "Legal Document Analyzer API"
    }