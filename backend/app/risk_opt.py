from typing import List, Dict
import os
import requests
from .models import Task
from .database import TASKS,RESOURCES
import json

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

def generate_risk_llm_explanation(tasks_analysis):
    if not tasks_analysis:
        return "No tasks to analyze."

    prompt_lines = [
    "You are a senior EPC risk analyst.",
    "Provide a maximum 70-word explanation overall.",
    "Analyze each high-risk task listed below (risk_score >= 60).",
    "Do NOT ask for additional information.",
    "Provide practical strategies to reduce risk by increasing slack, optimizing resources, and improving dependencies.",
    "Be specific. Avoid generic statements.",
    "Keep it concise and structured in markdown.",
    "",
    "Tasks Data:",
    json.dumps(tasks_analysis, indent=2)
]
    for task in tasks_analysis:
        risk = task.get("risk_score") or 0

        if risk >= 70:
        # include task
            resources = task.get("resources", [])
            resources_str = ", ".join(map(str, resources)) if resources else "No resources listed"
            recommendations_str = "\n    - ".join(task.get("recommendations", [])) or "No recommendations provided"

            prompt_lines.append(
                f"- Task '{task['name']}':\n"
                f"    Risk Score: {task['risk_score']}\n"
                f"    Duration: {task.get('duration', 'Unknown')} days\n"
                f"    Slack: {task.get('slack', 'Unknown')} days\n"
                f"    Resources: {resources_str}\n"
                f"    Recommendations:\n    - {recommendations_str}"
            )

    prompt = "\n".join(prompt_lines)

    payload = {
        "model": "gpt-4o-mini",
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.5,
        "max_tokens": 500
    }

    try:
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "Content-Type": "application/json"
            },
            json=payload
        )

        data = response.json()
        return data.get("choices", [{}])[0].get("message", {}).get("content", "").strip()

    except Exception as e:
        return f"Error calling OpenRouter API: {str(e)}"