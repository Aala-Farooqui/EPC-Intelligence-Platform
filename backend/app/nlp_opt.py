import os
import requests

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

def generate_nlp_response(query, critical_path, total_duration, tasks_analysis):
    if not OPENROUTER_API_KEY:
        return "OpenRouter API key not configured."

    # Build structured context for LLM
    context_lines = [
        "You are an AI assistant for an EPC (Engineering, Procurement, Construction) project.",
        f"Total Project Duration: {total_duration} days",
        f"Critical Path Task IDs: {critical_path}",
        "\nTasks Summary:"
    ]

    for task in tasks_analysis:
        context_lines.append(
            f"- {task['name']} (ID {task['id']}): "
            f"Duration {task['duration']} days, "
            f"Slack {task['slack']} days, "
            f"Risk {task['risk_score']}, "
            f"Resources {', '.join(task['resources']) if task['resources'] else 'None'}"
        )

    context_lines.append(f"\nUser Question: {query}")
    context_lines.append("\nAnswer concisely using only the provided project data. Do not invent new tasks.")

    prompt = "\n".join(context_lines)

    payload = {
        "model": "gpt-4o-mini",
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.3,
        "max_tokens": 300
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
        return f"Error generating AI response: {str(e)}"