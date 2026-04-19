from collections import Counter

from app.utils.filler_words import FILLER_WORDS


SILENCE_PLACEHOLDERS = {
    "",
    "transcript unavailable. install whisper or provide a transcript hint from the frontend.",
}


def analyze_transcript(transcript: str, duration_seconds: float) -> dict:
    normalized_transcript = (transcript or "").strip()
    if normalized_transcript.lower() in SILENCE_PLACEHOLDERS:
        normalized_transcript = ""

    words = [word.strip(".,!?").lower() for word in normalized_transcript.split() if word.strip()]
    total_words = len(words)
    minutes = max(duration_seconds / 60.0, 15.0 / 60.0)
    words_per_minute = round(total_words / minutes, 2)
    filler_count = sum(1 for word in words if word in FILLER_WORDS)
    common_fillers = Counter(word for word in words if word in FILLER_WORDS).most_common(3)

    return {
        "total_words": total_words,
        "words_per_minute": words_per_minute,
        "filler_count": filler_count,
        "common_fillers": [word for word, _count in common_fillers],
        "speech_detected": total_words > 0,
    }
