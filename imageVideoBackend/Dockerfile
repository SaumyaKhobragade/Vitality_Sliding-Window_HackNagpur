FROM python:3.11-slim

# Install system dependencies for OpenCV, ffmpeg, and PyTorch
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements and install Python dependencies
COPY requirements.txt .

# Install PyTorch CPU-only version (much smaller than CUDA version)
RUN pip install --no-cache-dir torch torchvision --index-url https://download.pytorch.org/whl/cpu

# Install other dependencies
RUN pip install --no-cache-dir \
    opencv-python-headless>=4.8.0 \
    numpy>=1.24.0 \
    fastapi>=0.109.0 \
    uvicorn[standard]>=0.27.0 \
    python-multipart>=0.0.6 \
    pydantic>=2.5.0 \
    pillow>=10.0.0

# Copy application code
COPY . .

# Expose port (Railway will set $PORT)
EXPOSE 8000

# Run the application
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
