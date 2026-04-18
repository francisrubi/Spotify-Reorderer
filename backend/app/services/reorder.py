from typing import List, Dict, Any, Tuple
from bisect import bisect_left

ALBUM_FIELDS = ("album", "release_date")


def sort_tracks(tracks: List[Dict[str, Any]], criteria: List[Any]) -> List[Dict[str, Any]]:
    """
    Sorts a list of tracks based on multiple criteria.

    Strategy: apply `sorted()` once per criterion, from least to most significant.
    Python's sort is stable, so earlier (less significant) orderings are preserved
    when later (more significant) criteria produce ties. This avoids tuple-key hacks
    for mixed asc/desc orders across different value types.

    Supported fields: name, artist, album, release_date, track_position, duration,
    added_at. The `track_position` key is (disc_number, track_number) so multi-disc
    albums sort correctly. The `release_date` key is a normalized (year, month, day)
    tuple — Spotify returns release dates with variable precision.
    """
    if not criteria:
        return tracks

    result = list(tracks)
    for c in reversed(criteria):
        field = c.field if hasattr(c, "field") else c["field"]
        order = c.order if hasattr(c, "order") else c.get("order", "asc")
        result = sorted(
            result,
            key=lambda t, f=field: _extract_key(t, f),
            reverse=(order == "desc"),
        )
    return result


def _extract_key(track: Dict[str, Any], field: str):
    """Returns a sortable key for a track, given a criterion field name."""
    if field == "release_date":
        return _parse_release_date(
            track.get("release_date", ""),
            track.get("release_date_precision", "day"),
        )

    if field == "track_position":
        disc = track.get("disc_number") or 0
        num = track.get("track_number") or 0
        return (disc, num)

    if field == "duration":
        return track.get("duration_ms", 0)

    value = track.get(field, "")
    if value is None:
        return ""
    if isinstance(value, str):
        return value.lower()
    return value


def _parse_release_date(date_str: str, precision: str) -> Tuple[int, int, int]:
    """
    Normalizes a Spotify release_date into a (year, month, day) tuple.
    Spotify returns "YYYY", "YYYY-MM", or "YYYY-MM-DD" depending on precision;
    missing components default to 1 so year-only releases sort as Jan 1st of that year.
    """
    if not date_str:
        return (0, 0, 0)
    parts = date_str.split("-")
    try:
        year = int(parts[0]) if len(parts) >= 1 else 0
        month = int(parts[1]) if len(parts) >= 2 and precision != "year" else 1
        day = int(parts[2]) if len(parts) >= 3 and precision == "day" else 1
        return (year, month, day)
    except (ValueError, IndexError):
        return (0, 0, 0)


def calculate_movements(
    current_list: List[Dict[str, Any]],
    target_list: List[Dict[str, Any]]
) -> List[Dict[str, int]]:
    """
    Calculates the movements needed to transform current_list into target_list.
    Uses the Longest Increasing Subsequence (LIS) algorithm to minimize movements.

    Tracks that are already in correct relative order (LIS) don't need to be moved;
    only the ones outside the LIS are rearranged.
    """
    if not current_list or not target_list:
        return []

    id_to_target_position = {track["id"]: i for i, track in enumerate(target_list)}

    target_positions = [id_to_target_position[track["id"]] for track in current_list]

    lis_indices = _find_lis_indices(target_positions)
    tracks_in_lis = set(current_list[i]["id"] for i in lis_indices)

    movements = []
    current_state = [track["id"] for track in current_list]

    for track_id in [track["id"] for track in target_list]:
        if track_id in tracks_in_lis:
            continue

        current_position = current_state.index(track_id)
        target_position = id_to_target_position[track_id]

        insert_position = 0
        for i, tid in enumerate(current_state):
            if id_to_target_position[tid] < target_position:
                insert_position = i + 1

        if current_position != insert_position:
            movements.append({
                "range_start": current_position,
                "insert_before": insert_position
            })

            item = current_state.pop(current_position)
            actual_insert = insert_position if insert_position <= current_position else insert_position - 1
            current_state.insert(actual_insert, item)

    return movements


def _find_lis_indices(arr: List[int]) -> List[int]:
    """Finds indices of elements forming the Longest Increasing Subsequence (O(n log n))."""
    if not arr:
        return []

    n = len(arr)
    tails = []
    tail_indices = []
    predecessors = [-1] * n

    for i, val in enumerate(arr):
        pos = bisect_left(tails, val)

        if pos == len(tails):
            tails.append(val)
            tail_indices.append(i)
        else:
            tails[pos] = val
            tail_indices[pos] = i

        if pos > 0:
            predecessors[i] = tail_indices[pos - 1]

    lis_indices = []
    idx = tail_indices[-1] if tail_indices else -1
    while idx >= 0:
        lis_indices.append(idx)
        idx = predecessors[idx]

    return list(reversed(lis_indices))
