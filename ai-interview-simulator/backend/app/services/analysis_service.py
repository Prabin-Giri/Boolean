import json

from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.config import UPLOAD_DIR
from app.models.question import Question
from app.models.response import Response
from app.services.audio_analysis_service import analyze_transcript
from app.services.emotion_service import analyze_emotion
from app.services.eye_contact_service import analyze_eye_contact
from app.services.feedback_service import generate_feedback
from app.services.scoring_service import calculate_scores
from app.services.session_service import refresh_session_score
from app.services.transcription_service import transcribe_audio
from app.utils.file_helpers import safe_unlink, save_upload_file


async def analyze_submission(
    db: Session,
    session_id: int,
    question_id: int,
    duration_seconds: float,
    transcript_hint: str | None,
    audio_file: UploadFile | None,
    video_file: UploadFile | None,
) -> dict:
    audio_path = save_upload_file(audio_file, UPLOAD_DIR) if audio_file else None
    video_path = save_upload_file(video_file, UPLOAD_DIR) if video_file else None

    try:
        transcript = transcribe_audio(audio_path=audio_path, transcript_hint=transcript_hint)
        audio_metrics = analyze_transcript(transcript, duration_seconds)
        video_metrics = analyze_eye_contact(video_path)
        emotion_summary = analyze_emotion(video_path)
        score_summary = calculate_scores(
            total_words=audio_metrics["total_words"],
            words_per_minute=audio_metrics["words_per_minute"],
            filler_count=audio_metrics["filler_count"],
            video_metrics=video_metrics,
        )
        question = db.query(Question).filter(Question.id == question_id).first()
        feedback = generate_feedback(
            transcript=transcript,
            question_text=question.text if question else "",
            total_words=audio_metrics["total_words"],
            words_per_minute=audio_metrics["words_per_minute"],
            filler_count=audio_metrics["filler_count"],
            common_fillers=audio_metrics["common_fillers"],
            video_metrics=video_metrics,
            emotion_summary=emotion_summary,
            score_summary=score_summary,
        )

        response = (
            db.query(Response)
            .filter(Response.session_id == session_id, Response.question_id == question_id)
            .first()
        )
        if response is None:
            response = Response(session_id=session_id, question_id=question_id)
            db.add(response)

        response.transcript = transcript
        response.filler_count = audio_metrics["filler_count"]
        response.words_per_minute = audio_metrics["words_per_minute"]
        response.eye_contact_score = video_metrics["eye_contact_score"]
        response.communication_score = score_summary["communication"]
        response.confidence_score = score_summary["confidence"]
        response.clarity_score = score_summary["clarity"]
        response.relevance_score = score_summary["relevance"]
        response.overall_score = score_summary["overall"]
        response.emotion_summary = emotion_summary
        response.feedback = json.dumps(feedback)

        db.commit()
        db.refresh(response)
        refresh_session_score(db, session_id)
    finally:
        safe_unlink(audio_path)
        safe_unlink(video_path)

    return {
        "transcript": transcript,
        "metrics": {
            "filler_count": audio_metrics["filler_count"],
            "words_per_minute": audio_metrics["words_per_minute"],
            "eye_contact_score": video_metrics["eye_contact_score"],
            "emotion_summary": emotion_summary,
            "common_fillers": audio_metrics["common_fillers"],
            "focus_score": video_metrics["focus_score"],
            "presence_score": video_metrics["presence_score"],
            "looking_away_ratio": video_metrics["looking_away_ratio"],
            "stability_score": video_metrics["stability_score"],
            "focus_status": video_metrics["focus_status"],
            "investigation_summary": video_metrics["investigation_summary"],
            "silence_detected": not audio_metrics["speech_detected"],
        },
        "scores": score_summary,
        "feedback": feedback,
    }
