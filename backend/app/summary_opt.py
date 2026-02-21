import os
import requests

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

def generate_project_summary(critical_path, total_duration, tasks_analysis):
    high_risk = [t for t in tasks_analysis if t["risk_score"] >= 70]
    zero_slack = [t for t in tasks_analysis if t["slack"] == 0]

    context_lines = [
        "You are an EPC project AI analyst.",
        f"Total Project Duration: {total_duration} days",
        f"Critical Path Tasks: {critical_path}",
        f"Number of High Risk Tasks: {len(high_risk)}",
        f"Number of Zero Slack Tasks: {len(zero_slack)}",
        "",
        "Task Breakdown:"
    ]

    for t in tasks_analysis:
        context_lines.append(
            f"- {t['name']} | Duration: {t['duration']} days | "
            f"Slack: {t['slack']} | Risk: {t['risk_score']}"
        )

    context_lines.append(
        "\nWrite a professional executive summary for management. "
        "Highlight risks, dependencies,slack,critical tasks and overall project health."
        "Do not cut off mid-sentence."
    )

    prompt = "\n".join(context_lines)

    payload = {
        "model": "openai/gpt-4o-mini",
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.4,
        "max_tokens": 400
    }

    response = requests.post(
        "https://openrouter.ai/api/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type": "application/json"
        },
        json=payload
    )

    data = response.json()
    return data["choices"][0]["message"]["content"]