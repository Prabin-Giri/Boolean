from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import API_TITLE, API_VERSION
from app.database import Base, engine
from app.routes.analysis_routes import router as analysis_router
from app.routes.question_routes import router as question_router
from app.routes.scoring_routes import router as scoring_router
from app.routes.session_routes import router as session_router


Base.metadata.create_all(bind=engine)

app = FastAPI(title=API_TITLE, version=API_VERSION)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(session_router)
app.include_router(question_router)
app.include_router(analysis_router)
app.include_router(scoring_router)


@app.get("/")
def root():
    return {"message": "AI Interview Simulator API is running."}
