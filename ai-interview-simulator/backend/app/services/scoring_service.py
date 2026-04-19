from app.utils.metrics import clamp_score


def calculate_scores(total_words: int, words_per_minute: float, filler_count: int, video_metrics: dict) -> dict:
    eye_contact_score = video_metrics["eye_contact_score"]
    focus_score = video_metrics.get("focus_score", eye_contact_score)
    presence_score = video_metrics.get("presence_score", eye_contact_score)
    stability_score = video_metrics.get("stability_score", eye_contact_score)
    looking_away_ratio = video_metrics.get("looking_away_ratio", max(0.0, 100 - eye_contact_score))

    if total_words == 0:
        communication = clamp_score(8 + presence_score * 0.08)
        confidence = clamp_score(10 + focus_score * 0.18 + stability_score * 0.12)
        clarity = clamp_score(5 + max(0.0, 45 - looking_away_ratio) * 0.25)
        relevance = 0.0
        eye_contact = clamp_score(eye_contact_score)
    else:
        communication = clamp_score(28 + min(total_words, 140) * 0.34 + presence_score * 0.08)

        if 105 <= words_per_minute <= 155:
            pace_score = 90
        elif 90 <= words_per_minute <= 175:
            pace_score = 72
        else:
            pace_score = 50

        confidence = clamp_score(
            20
            + pace_score * 0.25
            + focus_score * 0.32
            + stability_score * 0.16
            + presence_score * 0.12
            - filler_count * 2.7
        )
        clarity = clamp_score(
            46
            + pace_score * 0.18
            + focus_score * 0.08
            - filler_count * 4.2
            - (8 if total_words < 18 else 0)
        )
        relevance = clamp_score(18 + min(total_words, 95) * 0.7 - (12 if total_words < 12 else 0))
        eye_contact = clamp_score(eye_contact_score)

    overall = round(
        (0.24 * communication)
        + (0.24 * confidence)
        + (0.2 * eye_contact)
        + (0.16 * clarity)
        + (0.16 * relevance),
        2,
    )

    return {
        "communication": round(communication, 2),
        "confidence": round(confidence, 2),
        "clarity": round(clarity, 2),
        "relevance": round(relevance, 2),
        "eye_contact": round(eye_contact, 2),
        "overall": overall,
    }
