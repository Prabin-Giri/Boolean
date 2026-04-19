def clamp_score(value: float, minimum: float = 0, maximum: float = 100) -> float:
    return max(minimum, min(maximum, value))
