# Vitality - Adaptive City-Scale Hospital Triage System

<div align="center">

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Java](https://img.shields.io/badge/Java-17+-orange.svg)
![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)

**A real-time, distributed, and ethically grounded decision-support platform for hospital triage and emergency surge handling.**

</div>

---

## 🎯 Overview

Vitality transforms hospital triage from a local, reactive process into a **city-scale, adaptive, ethical, and explainable system**. It provides operational intelligence to assist hospital staff in making faster, fairer, and more transparent decisions.

### Key Capabilities

- **Multi-Hospital Coordination** - Intelligent patient redirection across facilities
- **Behavioral Distress Detection** - CCTV-based detection with human-in-the-loop confirmation
- **Injury Severity Analysis** - AI-powered image analysis for visible injuries
- **Surge Detection** - Real-time overload prediction and graceful degradation
- **Explainable Scheduling** - Policy-driven, transparent priority decisions

> ⚠️ **Important**: Vitality is a **decision-support tool only**. It does not diagnose, prescribe, or override clinical judgment.

---

## 🏗️ Architecture

```
                    City Triage Orchestrator
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
   Hospital A          Hospital B          Hospital C
   (Local Triage)      (Local Triage)     (Local Triage)
        │                   │                   │
    ┌───┴───┐           ┌───┴───┐          ┌───┴───┐
    │ CCTV  │           │ CCTV  │          │ CCTV  │
    │ Feed  │           │ Feed  │          │ Feed  │
    └───────┘           └───────┘          └───────┘
```

---

## 📁 Project Structure

```
Vitality_Sliding-Window_HackNagpur/
├── frontend/              # Next.js Dashboard & Patient Interface
├── Vitality/              # Java Spring Boot - Core Triage Engine
├── surge_detector/        # Java - Surge Detection Service
├── imageVideoBackend/     # Python FastAPI - AI Analysis Backend
│   ├── Video Analysis     # Behavioral distress detection (VBDD)
│   └── Image Analysis     # Injury severity assist (ISA)
└── prd.md                 # Product Requirements Document
```

---

## 🚀 Quick Start

### Prerequisites

- **Java 17+** (for Vitality & Surge Detector)
- **Python 3.11+** (for Image/Video Backend)
- **Node.js 18+** (for Frontend)

### 1. Start the AI Backend

```bash
cd imageVideoBackend
pip install -r requirements.txt
uvicorn main:app --reload --port 8001
```

### 2. Start the Core Triage Engine

```bash
cd Vitality
./gradlew bootRun
```

### 3. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 🔌 API Endpoints

### Video Analysis (Behavioral Distress)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/analyze` | POST | Upload video for distress detection |
| `/events` | GET | List detected distress events |

### Image Analysis (Injury Severity)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/isa/analyze` | POST | Upload injury image for severity assessment |
| `/isa/results` | GET | List analysis results |
| `/isa/health` | GET | Module health check |

---

## 🧠 AI Detection Capabilities

### Video-Based Distress Signals
- `PROLONGED_IMMOBILITY` - Person stationary for extended time
- `SUDDEN_COLLAPSE` - Rapid downward movement
- `REPEATED_BENDING` - Oscillatory vertical movement
- `ERRATIC_PACING` - High velocity with direction changes
- `CROWD_FORMATION` - People converging around a point

### Image-Based Injury Analysis
Uses **ResNet-34** for feature extraction:
- Wound area ratio
- Bleeding intensity
- Edge irregularity
- Color contrast

**Severity Levels**: LOW (0-30) → MEDIUM (30-70) → HIGH (70+)

---

## ⚖️ Ethical Safeguards

- ✅ **Advisory-only** - Never makes medical decisions
- ✅ **Human-in-the-loop** - Staff confirmation required for high-impact actions
- ✅ **No identity tracking** - No facial recognition or patient identification
- ✅ **Transparent scoring** - All decisions are explainable
- ✅ **No long-term storage** - Images/videos processed in-memory only

---

## 🛠️ Technology Stack

| Component | Technology |
|-----------|------------|
| Core Engine | Java 17, Spring Boot |
| AI Backend | Python 3.11, FastAPI, OpenCV, PyTorch |
| Frontend | Next.js 15, React, TypeScript |
| ML Models | ResNet-34 (pretrained on ImageNet) |
| Concurrency | PriorityBlockingQueue, ThreadPoolExecutor |

---

## 📊 Priority Calculation

```
FinalPriority = BaseSeverity + WaitingTimeBoost + DistressBoost - StabilityPenalty
```

---

## 🤝 Team

Built with ❤️ for **HackNagpur 2025**

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.