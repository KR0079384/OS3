"""
OSV.dev API client and normalized vulnerability records for OS³ CLI.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional

import requests

OSV_API_URL = "https://api.osv.dev/v1/query"

_SEVERITY_RANK = {"LOW": 1, "MEDIUM": 2, "HIGH": 3, "CRITICAL": 4}


def get_vulnerabilities(package_name: str, ecosystem: str = "npm") -> List[Dict[str, Any]]:
    """POST to OSV query API; return raw vuln dicts or []."""
    payload = {"package": {"name": package_name, "ecosystem": ecosystem}}
    try:
        response = requests.post(OSV_API_URL, json=payload, timeout=15)
        if response.status_code != 200:
            return []
        data = response.json()
    except (requests.RequestException, ValueError):
        return []
    return data.get("vulns") or []


def _normalize_label(label: str) -> Optional[str]:
    u = label.upper().strip()
    if u == "MODERATE":
        u = "MEDIUM"
    if u in ("INFO", "INFORMATIONAL", "NONE"):
        u = "LOW"
    if u in _SEVERITY_RANK:
        return u
    return None


def _bucket_from_cvss_vector(vector: str) -> str:
    v = vector.upper()
    if "C:H" in v and "I:H" in v and "A:H" in v:
        return "CRITICAL"
    if "C:H" in v or "I:H" in v or "A:H" in v:
        return "HIGH"
    if "C:L" in v or "I:L" in v:
        return "MEDIUM"
    return "LOW"


def _bucket_from_cvss_score_string(score: str) -> str:
    s = score.strip()
    if not s:
        return "LOW"
    if "/" in s or s.upper().startswith("CVSS"):
        return _bucket_from_cvss_vector(s)
    try:
        val = float(s)
    except ValueError:
        return "LOW"
    if val >= 9.0:
        return "CRITICAL"
    if val >= 7.0:
        return "HIGH"
    if val >= 4.0:
        return "MEDIUM"
    return "LOW"


def _severity_from_osv_record(vuln: Dict[str, Any]) -> str:
    ds = vuln.get("database_specific")
    if isinstance(ds, dict):
        raw = ds.get("severity")
        if isinstance(raw, str) and raw.strip():
            normalized = _normalize_label(raw)
            if normalized:
                return normalized

    buckets: List[str] = []
    for entry in vuln.get("severity") or []:
        if not isinstance(entry, dict):
            continue
        score = entry.get("score")
        if isinstance(score, (int, float)):
            buckets.append(_bucket_from_cvss_score_string(str(score)))
        elif isinstance(score, str) and score.strip():
            buckets.append(_bucket_from_cvss_score_string(score))

    if not buckets:
        return "LOW"
    return max(buckets, key=lambda b: _SEVERITY_RANK[b])


def parse_vulnerabilities(vulns: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Each item: {"id": str, "summary": str, "severity": CRITICAL|HIGH|MEDIUM|LOW}
    """
    out: List[Dict[str, Any]] = []
    for v in vulns:
        if not isinstance(v, dict):
            continue
        vid = v.get("id")
        if vid is None:
            continue
        summary = v.get("summary") or ""
        if not isinstance(summary, str):
            summary = str(summary)
        out.append(
            {
                "id": str(vid),
                "summary": summary,
                "severity": _severity_from_osv_record(v),
            }
        )
    return out


def count_severity(vulns: List[Dict[str, Any]]) -> Dict[str, int]:
    counts = {"CRITICAL": 0, "HIGH": 0, "MEDIUM": 0, "LOW": 0}
    for v in vulns:
        s = v.get("severity", "LOW")
        if not isinstance(s, str):
            s = "LOW"
        key = s.upper()
        if key == "MODERATE":
            key = "MEDIUM"
        if key not in counts:
            key = "LOW"
        counts[key] += 1
    return counts


def deduplicate_vulnerabilities(vulns: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    seen: set = set()
    unique: List[Dict[str, Any]] = []
    for v in vulns:
        vid = v.get("id")
        if not vid:
            continue
        sid = str(vid)
        if sid in seen:
            continue
        seen.add(sid)
        unique.append(v)
    return unique
