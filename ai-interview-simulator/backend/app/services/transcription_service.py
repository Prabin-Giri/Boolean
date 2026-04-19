from pathlib import Path


EMPTY_TRANSCRIPT_MARKERS = {
    "transcript unavailable. install whisper or provide a transcript hint from the frontend.",
}


def transcribe_audio(audio_path: Path | None = None, transcript_hint: str | None = None) -> str:
    if transcript_hint and transcript_hint.strip():
        text = transcript_hint.strip()
        if text.lower() not in EMPTY_TRANSCRIPT_MARKERS:
            return text

    if audio_path:
        try:
            import whisper

            model = whisper.load_model("base")
            result = model.transcribe(str(audio_path))
            text = result.get("text", "").strip()
            if text and text.lower() not in EMPTY_TRANSCRIPT_MARKERS:
                return text
        except Exception:
            pass

    return ""
