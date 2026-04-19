from pathlib import Path


def analyze_emotion(video_path: Path | None = None) -> str:
    if not video_path:
        return "visual summary unavailable"

    try:
        import cv2
    except Exception:
        return "visual summary unavailable"

    capture = cv2.VideoCapture(str(video_path))
    if not capture.isOpened():
        return "visual summary unavailable"

    frame_index = 0
    sampled = 0
    brightness_total = 0.0
    motion_total = 0.0
    previous_gray = None

    try:
        while True:
            success, frame = capture.read()
            if not success:
                break

            frame_index += 1
            if frame_index % 18 != 0:
                continue

            frame = cv2.resize(frame, (320, 180))
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            brightness_total += float(gray.mean())
            sampled += 1

            if previous_gray is not None:
                motion_total += float(cv2.absdiff(gray, previous_gray).mean())
            previous_gray = gray

            if sampled >= 10:
                break
    finally:
        capture.release()

    if sampled == 0:
        return "visual summary unavailable"

    average_brightness = brightness_total / sampled
    average_motion = motion_total / max(sampled - 1, 1)

    if average_motion < 4:
        motion_label = "steady"
    elif average_motion < 9:
        motion_label = "balanced"
    else:
        motion_label = "animated"

    if average_brightness < 75:
        light_label = "dim lighting"
    elif average_brightness < 145:
        light_label = "even lighting"
    else:
        light_label = "bright lighting"

    return f"{motion_label} delivery with {light_label}"
