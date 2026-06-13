@echo off
echo ==========================================
echo Starting Vitality RAG Medical History Backend
echo ==========================================
cd ragBackend
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)
echo Activating virtual environment...
call venv\Scripts\activate
echo Installing/Checking dependencies...
pip install -r requirements.txt
echo Starting FastAPI server on port 8002...
python main.py
pause
