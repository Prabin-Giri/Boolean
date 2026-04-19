from __future__ import annotations

from pathlib import Path


LEFT_EYE_H = (33, 133)
RIGHT_EYE_H = (362, 263)
LEFT_EYE_V = (159, 145)
RIGHT_EYE_V = (386, 374)
LEFT_IRIS = (468, 469, 470, 471, 472)
RIGHT_IRIS = (473, 474, 475, 476, 477)
NOSE_TIP = 1
TARGET_SAMPLES_PER_SECOND = 6


def _default_metrics(
    eye_contact_score: float,
    focus_score: float,
    presence_score: float,
    looking_away_ratio: float,
    stability_score: float,
    focus_status: str,
    investigation_summary: str,
) -> dict:
    return {
        "eye_contact_score": round(eye_contact_score, 2),
        "focus_score": round(focus_score, 2),
        "presence_score": round(presence_score, 2),
        "looking_away_ratio": round(looking_away_ratio, 2),
        "stability_score": round(stability_score, 2),
        "focus_status": focus_status,
        "investigation_summary": investigation_summary,
    }


def _average_point(landmarks, indices):
    xs = [landmarks[index].x for index in indices]
    ys = [landmarks[index].y for index in indices]
    return sum(xs) / len(xs), sum(ys) / len(ys)


def _normalized_ratio(value: float, first: float, second: float) -> float:
    low = min(first, second)
    high = max(first, second)
    span = high - low
    if span < 1e-6:
        return 0.5
    ratio = (value - low) / span
    return max(0.0, min(1.0, ratio))


def _is_gaze_centered(
    left_horizontal: float,
    right_horizontal: float,
    left_vertical: float,
    right_vertical: float,
) -> bool:
    horizontal_midpoint = (left_horizontal + right_horizontal) / 2
    vertical_midpoint = (left_vertical + right_vertical) / 2
    horizontal_balance = abs(left_horizontal - right_horizontal)
    vertical_balance = abs(left_vertical - right_vertical)

    return (
        abs(horizontal_midpoint - 0.5) <= 0.26
        and abs(vertical_midpoint - 0.5) <= 0.30
        and horizontal_balance <= 0.36
        and vertical_balance <= 0.36
    )


def _describe_focus(focus_score: float, looking_away_ratio: float, presence_score: float) -> str:
    if presence_score < 45:
        return "Face missing often"
    if focus_score >= 78 and looking_away_ratio <= 20:
        return "Locked in"
    if focus_score >= 58 and looking_away_ratio <= 38:
        return "Mostly focused"
    if looking_away_ratio >= 55:
        return "Frequently looking away"
    return "Focus drifted"


def analyze_eye_contact(video_path: Path | None = None) -> dict:
    if not video_path:
        return _default_metrics(
            0,
            0,
            0,
            100,
            0,
            "No video submitted",
            "INTERVAI could not inspect the video because no recording was submitted.",
        )

    try:
        import cv2
        import mediapipe as mp
        # Verify the mediapipe version has the solutions API
        _face_mesh_cls = mp.solutions.face_mesh.FaceMesh
    except Exception:
        return _default_metrics(
            50,
            50,
            50,
            50,
            50,
            "Video analysis unavailable",
            "INTERVAI could not load the video-analysis model, so eye-focus scoring stayed neutral.",
        )

    capture = cv2.VideoCapture(str(video_path))
    if not capture.isOpened():
        return _default_metrics(
            15,
            15,
            10,
            85,
            10,
            "Video unreadable",
            "INTERVAI could not open the recording to inspect eye movement or camera focus.",
        )

    mesh = _face_mesh_cls(
        static_image_mode=False,
        max_num_faces=1,
        refine_landmarks=True,
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5,
    )

    sampled_frames = 0
    detected_frames = 0
    total_frame_count = int(capture.get(cv2.CAP_PROP_FRAME_COUNT) or 0)
    fps = float(capture.get(cv2.CAP_PROP_FPS) or 0.0)
    if fps <= 0:
        fps = 24.0
    sample_every_n_frames = max(1, round(fps / TARGET_SAMPLES_PER_SECOND))
    seconds_per_sample = sample_every_n_frames / fps

    visible_seconds = 0.0
    focused_seconds = 0.0
    looking_away_seconds = 0.0
    stable_movements = []
    last_nose = None
    frame_index = 0

    try:
        while True:
            success, frame = capture.read()
            if not success:
                break

            frame_index += 1
            if frame_index % sample_every_n_frames != 0:
                continue

            height, width = frame.shape[:2]
            if width > 640:
                scaled_height = int(height * (640 / width))
                frame = cv2.resize(frame, (640, scaled_height))

            sampled_frames += 1
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            result = mesh.process(rgb_frame)
            if not result.multi_face_landmarks:
                continue

            detected_frames += 1
            visible_seconds += seconds_per_sample
            landmarks = result.multi_face_landmarks[0].landmark
            nose = landmarks[NOSE_TIP]

            left_iris_x, left_iris_y = _average_point(landmarks, LEFT_IRIS)
            right_iris_x, right_iris_y = _average_point(landmarks, RIGHT_IRIS)

            left_horizontal = _normalized_ratio(
                left_iris_x,
                landmarks[LEFT_EYE_H[0]].x,
                landmarks[LEFT_EYE_H[1]].x,
            )
            right_horizontal = _normalized_ratio(
                right_iris_x,
                landmarks[RIGHT_EYE_H[0]].x,
                landmarks[RIGHT_EYE_H[1]].x,
            )
            left_vertical = _normalized_ratio(
                left_iris_y,
                landmarks[LEFT_EYE_V[0]].y,
                landmarks[LEFT_EYE_V[1]].y,
            )
            right_vertical = _normalized_ratio(
                right_iris_y,
                landmarks[RIGHT_EYE_V[0]].y,
                landmarks[RIGHT_EYE_V[1]].y,
            )
            gaze_centered = _is_gaze_centered(
                left_horizontal,
                right_horizontal,
                left_vertical,
                right_vertical,
            )
            head_centered = abs(nose.x - 0.5) < 0.25 and abs(nose.y - 0.5) < 0.30
            focus_frame = gaze_centered and head_centered

            if focus_frame:
                focused_seconds += seconds_per_sample
            else:
                looking_away_seconds += seconds_per_sample

            if last_nose is not None:
                movement = abs(nose.x - last_nose[0]) + abs(nose.y - last_nose[1])
                stable_movements.append(movement)
            last_nose = (nose.x, nose.y)
    finally:
        mesh.close()
        capture.release()

    if sampled_frames == 0:
        return _default_metrics(
            15,
            15,
            15,
            85,
            15,
            "No usable frames",
            "INTERVAI could not read enough frames from the recording to inspect focus.",
        )

    presence_score = (detected_frames / sampled_frames) * 100
    if detected_frames == 0:
        return _default_metrics(
            10,
            10,
            presence_score,
            100,
            0,
            "Face missing often",
            "INTERVAI inspected the video but could not detect a usable face in most sampled frames.",
        )

    estimated_total_seconds = total_frame_count / fps if total_frame_count > 0 else sampled_frames * seconds_per_sample
    presence_score = (visible_seconds / estimated_total_seconds) * 100 if estimated_total_seconds > 0 else 0.0
    focus_score = (focused_seconds / visible_seconds) * 100 if visible_seconds > 0 else 0.0
    looking_away_ratio = (looking_away_seconds / visible_seconds) * 100 if visible_seconds > 0 else 100.0
    average_motion = sum(stable_movements) / len(stable_movements) if stable_movements else 0.04
    stability_score = max(0.0, min(100.0, 100 - (average_motion * 900)))
    eye_contact_score = max(
        0.0,
        min(
            100.0,
            (focus_score * 0.58)
            + (presence_score * 0.18)
            + (stability_score * 0.14)
            + ((100 - looking_away_ratio) * 0.10),
        ),
    )
    focus_status = _describe_focus(focus_score, looking_away_ratio, presence_score)
    investigation_summary = (
        f"INTERVAI reviewed about {visible_seconds:.1f}s with your face on screen. "
        f"You looked away for about {looking_away_seconds:.1f}s during that visible time "
        f"({round(looking_away_ratio)}%), and focus held for about {focused_seconds:.1f}s."
    )
    if visible_seconds < 1.5:
        investigation_summary += " Confidence is limited because too little face-visible time was captured."

    return _default_metrics(
        eye_contact_score,
        focus_score,
        presence_score,
        looking_away_ratio,
        stability_score,
        focus_status,
        investigation_summary,
    )
