from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.database import init_db
from app.routes import incidents, health, monitoring, logs, auth

app = FastAPI(
    title="Support Operations API",
    description="Incident management, service monitoring and log analysis.",
    version="1.0.0"
)

init_db()

app.mount("/static", StaticFiles(directory="static"), name="static")


@app.get("/")
def dashboard():
    return FileResponse("static/index.html")


@app.get("/login")
def login_page():
    return FileResponse("static/login.html")


app.include_router(auth.router)
app.include_router(incidents.router)
app.include_router(health.router)
app.include_router(monitoring.router)
app.include_router(logs.router)