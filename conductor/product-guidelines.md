# Product Guidelines

## Design Principles
- **Existing Framework:** Adhere strictly to the established **Next.js, Tailwind CSS, and Shadcn/UI** implementation.
- **Non-Intrusive Authentication:** Prefer graceful UI states (e.g., overlays, blurred content) over hard redirects for unauthenticated access to dashboard views, maintaining context for the user.
- **Contextual Awareness:** Use clear, prominent labeling (e.g., "LIVE STATUS", "SIMULATION MODE") to ensure users can immediately distinguish between real-time operational data and simulated scenarios.
- **Data Integrity:** Prioritize accuracy and clarity in data visualization to support high-stakes clinical decision-making.

## Visual Identity
- **Alert Hierarchy:** Implement a strict hierarchy of urgency using standardized color-coding:
    - **Critical (Red):** Immediate action required (e.g., bed capacity exceeded).
    - **Warning (Yellow):** Potential bottleneck or threshold approaching.
    - **Info (Blue/Gray):** General operational updates and status changes.
- **UI Consistency:** Maintain the current clean, professional aesthetic while ensuring critical data points have high visibility.

## Communication & Tone
- **Clinical Precision:** Use objective, clinical, and operational terminology (e.g., *triage*, *throughput*, *acuity*, *wait time thresholds*). Avoid overly casual or ambiguous language.
- **Actionable Alerts:** Ensure all system notifications provide clear, objective status updates that align with hospital protocols.

## Technical Documentation
- **Domain-First Logic:** Align code comments and internal documentation with clinical domain concepts. Variable and function names should reflect the hospital management context where appropriate.
