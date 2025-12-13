# FeatureFlow-AI 🚀

> **An automated roadmap engine that turns raw user feedback into a prioritized strategy using AI-driven RICE scoring.**

![Dashboard Preview](public/screenshots/dashboard.png)

## 1. The Automated Workflow
The core of FeatureFlow-AI is a "set it and forget it" pipeline that autonomously processes feedback.

![n8n Workflow](public/screenshots/n8n_workflow.png)

**How it works:**
1.  **Ingestion:** The system receives raw user feedback (via Tally Form webhook or API).
2.  **AI Reasoning:** A **Google Gemini Agent** analyzes the unstructured text to intelligently extract the "Feature Name" and categorize it (e.g., "Feature", "Bug").
3.  **RICE Scoring:** The agent mathematically calculates a value score based on:
    *   **Reach:** User impact radius.
    *   **Impact:** Conversion/Retention value.
    *   **Confidence:** Clarity of the request.
    *   **Effort:** Estimated complexity.
4.  **Storage:** THe structured, scored data is inserted directly into **Supabase**.

## 2. Tech Stack
*   **Frontend:** React + Vite + Tailwind CSS (Glassmorphism UI)
*   **Visualization:** Recharts (Scatter Plot Matrix)
*   **Backend:** Supabase (PostgreSQL)
*   **Automation:** n8n (Workflow Orchestration)
*   **AI Model:** Google Gemini Pro (Logic & Scoring)

## 3. Problem Statement
Product Managers are drowning in unstructured feedback from sources like Slack, Email, and Support tickets.
*   **The "Gut Feel" Trap:** Without data, prioritization is often based on instinct rather than value.
*   **Manual Overload:** Organizing hundreds of requests into spreadsheets is slow and error-prone.
*   **Bad Decisions:** Important features get lost in the noise, leading to inefficient roadmaps.

## 4. The Solution
FeatureFlow-AI eliminates the noise by autonomously triaging every request.

### Strategy Matrix (Scatter Plot)
The dashboard visualizes the **ROI** of your roadmap.
*   **Value vs. Effort:** Features are plotted to reveal "Quick Wins" (High RICE Score, Low Effort).
*   **Focus Areas:** Easily identify time sinks (Low Value, High Effort) to avoid.

### Kanban Board
![Kanban Board](public/screenshots/kanban.png)
*   **Lifecycle Management:** visually manage features from **New 📥** to **Planned 🗓️** to **In Progress 🚀**.
*   **Context Aware:** "New" items are auto-sorted by their AI-generated RICE score.

## 5. Database Schema
Reliable data storage using Postgres via Supabase.

![Supabase Grid](public/screenshots/supabase_grid.png)

**`feature_requests` Table:**
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `int8` | Unique ID |
| `raw_feedback` | `text` | Original user input |
| `feature_name` | `text` | AI-extracted title |
| `final_rice_score` | `float` | Calculated priority score |
| `effort_score` | `int` | AI-estimated effort (1-10) |
| `status` | `text` | Lifecycle stage |

## 6. Setup Instructions

### Frontend
1.  **Install Dependencies:**
    ```bash
    npm install
    ```
2.  **Run Development Server:**
    ```bash
    npm run dev
    ```

### Environment
Create a `.env` file with your Supabase credentials:
```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```
