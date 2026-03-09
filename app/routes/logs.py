from fastapi import APIRouter
from app.models import LogAnalysisRequest
from app.logger import get_logger
from app.auth import get_current_user

router = APIRouter(prefix="/logs", tags=["Log Analysis"])
logger = get_logger("logs")


@router.post("/analyze")
def analyze_log(data: LogAnalysisRequest):
    lines = data.content.splitlines()
    errors = [l for l in lines if "ERROR" in l.upper()]
    warnings = [l for l in lines if "WARN" in l.upper()]
    timeouts = [l for l in lines if "TIMEOUT" in l.upper()]
    auth_failures = [l for l in lines if "401" in l or "UNAUTHORIZED" in l.upper()]

    issues_found = len(errors) > 0 or len(timeouts) > 0 or len(auth_failures) > 0
    status = "issues detected" if issues_found else "clean"

    logger.info(f"Log analyzed: {len(errors)} errors, {len(warnings)} warnings")

    return {
        "status": status,
        "total_lines": len(lines),
        "errors": len(errors),
        "warnings": len(warnings),
        "timeouts": len(timeouts),
        "auth_failures": len(auth_failures),
        "error_lines": errors[:5]
    }