@echo off
echo 🚀 Starting AI Bridge (CLIP Service)...
set CLIP_PORT=5005
python src/modules/ai/vision/clip_service.py
pause
