import json
from typing import Iterable

from sqlalchemy.orm import Session

from app.config import OPENAI_API_KEY, OPENAI_MODEL
from app.config import DATA_DIR
from app.models.question import Question


QUESTION_COUNT_CHOICES = {3, 5, 8}


def _normalize_career_focus(career_focus: str | None) -> str:
    return (career_focus or "").strip()


def _build_role_context(
    career_focus: str,
    seniority: str,
    tech_stack: str,
    target_market: str,
    company_type: str,
    interview_emphasis: str,
) -> str:
    stack_text = tech_stack.strip() or "the candidate's core tools"
    return (
        f"{seniority} {career_focus} role targeting the {target_market} market, "
        f"with focus on {stack_text}, for a {company_type} interview process, "
        f"and a {interview_emphasis} interview emphasis"
    )


def _coerce_question_list(value: object, total_questions: int) -> list[str]:
    if not isinstance(value, list):
        raise ValueError("Model output was not a list.")
    questions = [str(item).strip() for item in value if str(item).strip()]
    unique_questions = list(dict.fromkeys(questions))
    if len(unique_questions) < total_questions:
        raise ValueError("Model returned too few questions.")
    return unique_questions[:total_questions]


def _generate_openai_questions(
    career_focus: str,
    category: str,
    difficulty: str,
    total_questions: int,
    seniority: str,
    tech_stack: str,
    target_market: str,
    company_type: str,
    interview_emphasis: str,
) -> list[str]:
    if not OPENAI_API_KEY:
        raise RuntimeError("OPENAI_API_KEY is not configured in backend/.env.")

    try:
        from openai import OpenAI
    except ImportError as exc:
        raise RuntimeError("OpenAI SDK is not installed.") from exc

    role_context = _build_role_context(
        career_focus=career_focus,
        seniority=seniority,
        tech_stack=tech_stack,
        target_market=target_market,
        company_type=company_type,
        interview_emphasis=interview_emphasis,
    )
    prompt = (
        f"Generate exactly {total_questions} interview questions for a candidate targeting a {role_context}. "
        f"The interview category is '{category}' and the difficulty is '{difficulty}'. "
        f"The user's submitted tech stack is '{tech_stack or 'not specified'}'. "
        f"The target company type is '{company_type}' and the interview emphasis is '{interview_emphasis}'. "
        f"Use the current {target_market} job market as context. Questions should sound realistic, role-specific, and suitable for a mock interview. "
        "Tailor the questions to the submitted options instead of generating generic prompts. "
        'Return only a JSON array of question strings, with no numbering, no markdown, and no extra text.'
    )

    client = OpenAI(api_key=OPENAI_API_KEY)
    response = client.responses.create(
        model=OPENAI_MODEL,
        input=prompt,
    )
    raw_output = (response.output_text or "").strip()
    try:
        return _coerce_question_list(json.loads(raw_output), total_questions)
    except Exception as exc:
        raise RuntimeError("OpenAI returned an invalid question payload.") from exc


def _save_generated_questions(
    db: Session,
    category: str,
    difficulty: str,
    question_texts: Iterable[str],
) -> list[Question]:
    questions = [
        Question(category=category, difficulty=difficulty, text=text)
        for text in question_texts
    ]
    db.add_all(questions)
    db.commit()
    for question in questions:
        db.refresh(question)
    return questions

def list_questions(db: Session) -> list[Question]:
    return db.query(Question).order_by(Question.id.asc()).all()


def get_questions_for_session(
    db: Session,
    category: str,
    difficulty: str,
    total_questions: int,
    career_focus: str | None = None,
    seniority: str = "mid-level",
    tech_stack: str = "",
    target_market: str = "United States",
    company_type: str = "product company",
    interview_emphasis: str = "balanced",
) -> list[Question]:
    if total_questions not in QUESTION_COUNT_CHOICES:
        raise ValueError("Only 3, 5, or 8 questions are supported.")

    normalized_career_focus = _normalize_career_focus(career_focus)
    if not normalized_career_focus:
        raise ValueError("Career focus is required for AI question generation.")

    question_texts = _generate_openai_questions(
        career_focus=normalized_career_focus,
        category=category,
        difficulty=difficulty,
        total_questions=total_questions,
        seniority=seniority,
        tech_stack=tech_stack,
        target_market=target_market,
        company_type=company_type,
        interview_emphasis=interview_emphasis,
    )
    return _save_generated_questions(db, category, difficulty, question_texts)
