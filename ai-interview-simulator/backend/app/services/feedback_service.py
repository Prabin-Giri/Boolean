import json

from app.config import OPENAI_API_KEY, OPENAI_MODEL


def _rule_feedback(
    transcript: str,
    question_text: str,
    total_words: int,
    words_per_minute: float,
    filler_count: int,
    common_fillers: list[str],
    video_metrics: dict,
    emotion_summary: str,
) -> list[str]:
    feedback: list[str] = []

    focus_score = video_metrics.get("focus_score", 0)
    presence_score = video_metrics.get("presence_score", 0)
    looking_away_ratio = video_metrics.get("looking_away_ratio", 0)
    focus_status = video_metrics.get("focus_status", "")

    if total_words == 0:
        feedback.append(
            "No spoken answer was detected in this recording, so INTERVAI skipped normal answer-content feedback."
        )
        if presence_score < 45:
            feedback.append(
                "Your face was missing from much of the video, which limited eye-focus analysis for this attempt."
            )
        elif looking_away_ratio >= 45:
            feedback.append(
                "The video review showed frequent gaze drift or off-camera attention, so try staying locked on the camera before speaking."
            )
        else:
            feedback.append(
                "You were visible on camera, but the response still needs spoken content to produce meaningful delivery and relevance feedback."
            )
        return feedback[:5]

    if 105 <= words_per_minute <= 155:
        feedback.append("Your speaking pace stayed in a strong interview range.")
    elif words_per_minute < 105:
        feedback.append("Your answer came across a little slow, so add more energy to sound more decisive.")
    else:
        feedback.append("Your answer moved quickly, so slow down slightly to make your points easier to track.")

    if filler_count == 0:
        feedback.append("You kept filler words under control, which made the answer sound cleaner.")
    elif filler_count <= 3:
        feedback.append("A few filler words showed up, but they did not overwhelm the answer.")
    else:
        filler_note = f" Most common fillers: {', '.join(common_fillers)}." if common_fillers else ""
        feedback.append(f"Filler words noticeably broke the flow of the answer.{filler_note}")

    if presence_score < 45:
        feedback.append("Your face left the frame too often, which made the confidence read less reliable.")
    elif focus_score >= 75 and looking_away_ratio <= 20:
        feedback.append("You stayed visually engaged with the camera for most of the answer, which helped your presence.")
    elif looking_away_ratio >= 45:
        feedback.append("You looked away from the camera frequently, so the answer felt less focused on delivery.")
    else:
        feedback.append("Your camera focus was mixed, so keeping your eyes centered more consistently would help.")

    if emotion_summary:
        feedback.append(f"Recorded expression trend: {emotion_summary}.")

    if focus_status and focus_status not in {"Locked in", "Mostly focused"}:
        feedback.append(f"Video review note: {focus_status}.")

    return feedback[:5]


def _generate_openai_feedback(
    transcript: str,
    question_text: str,
    total_words: int,
    words_per_minute: float,
    filler_count: int,
    common_fillers: list[str],
    video_metrics: dict,
    emotion_summary: str,
    score_summary: dict,
) -> list[str]:
    if not OPENAI_API_KEY:
        raise RuntimeError("OPENAI_API_KEY is not configured in backend/.env.")

    try:
        from openai import OpenAI
    except ImportError as exc:
        raise RuntimeError("OpenAI SDK is not installed.") from exc

    prompt = f"""
You are evaluating a mock interview answer. Generate exactly 5 concise feedback points for the candidate.

Question:
{question_text or "Unknown interview question"}

Transcript:
{transcript or "[No spoken transcript detected]"}

Interview metrics:
- Total words: {total_words}
- Words per minute: {round(words_per_minute, 2)}
- Filler count: {filler_count}
- Common fillers: {", ".join(common_fillers) if common_fillers else "none"}
- Eye contact score: {round(video_metrics.get("eye_contact_score", 0), 2)}
- Focus score: {round(video_metrics.get("focus_score", 0), 2)}
- Presence score: {round(video_metrics.get("presence_score", 0), 2)}
- Looking away ratio: {round(video_metrics.get("looking_away_ratio", 0), 2)}
- Stability score: {round(video_metrics.get("stability_score", 0), 2)}
- Focus status: {video_metrics.get("focus_status", "")}
- Emotion summary: {emotion_summary or "not available"}

Scores:
- Communication: {round(score_summary.get("communication", 0), 2)}
- Confidence: {round(score_summary.get("confidence", 0), 2)}
- Clarity: {round(score_summary.get("clarity", 0), 2)}
- Relevance: {round(score_summary.get("relevance", 0), 2)}
- Eye contact: {round(score_summary.get("eye_contact", 0), 2)}
- Overall: {round(score_summary.get("overall", 0), 2)}

Requirements:
- Be specific to this answer, not generic.
- Cover answer quality, delivery, relevance, pacing, and camera presence when relevant.
- If the answer had little or no speech, say that directly.
- Keep each point short and actionable.
- Return only a JSON array of 5 strings.
""".strip()

    client = OpenAI(api_key=OPENAI_API_KEY)
    response = client.responses.create(
        model=OPENAI_MODEL,
        input=prompt,
    )
    raw_output = (response.output_text or "").strip()
    try:
        parsed = json.loads(raw_output)
    except Exception as exc:
        raise RuntimeError("OpenAI returned an invalid feedback payload.") from exc

    if not isinstance(parsed, list):
        raise RuntimeError("OpenAI feedback response was not a list.")

    feedback = [str(item).strip() for item in parsed if str(item).strip()]
    if len(feedback) < 3:
        raise RuntimeError("OpenAI returned too little feedback.")
    return feedback[:5]


def generate_feedback(
    transcript: str,
    question_text: str,
    total_words: int,
    words_per_minute: float,
    filler_count: int,
    common_fillers: list[str],
    video_metrics: dict,
    emotion_summary: str,
    score_summary: dict,
) -> list[str]:
    try:
        return _generate_openai_feedback(
            transcript=transcript,
            question_text=question_text,
            total_words=total_words,
            words_per_minute=words_per_minute,
            filler_count=filler_count,
            common_fillers=common_fillers,
            video_metrics=video_metrics,
            emotion_summary=emotion_summary,
            score_summary=score_summary,
        )
    except Exception:
        return _rule_feedback(
            transcript=transcript,
            question_text=question_text,
            total_words=total_words,
            words_per_minute=words_per_minute,
            filler_count=filler_count,
            common_fillers=common_fillers,
            video_metrics=video_metrics,
            emotion_summary=emotion_summary,
        )
