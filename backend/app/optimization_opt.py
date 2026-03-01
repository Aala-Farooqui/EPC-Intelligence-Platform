import os
import requests

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")


def _build_optimization_data(total_duration, tasks_analysis, critical_path):
    """
    Identify compression opportunities on critical path.
    """

    critical_tasks = [
        t for t in tasks_analysis if t["id"] in critical_path
    ]

    # Sort by longest duration first (highest impact)
    critical_tasks.sort(key=lambda x: x["duration"], reverse=True)

    optimization_data = []

    for task in critical_tasks:

        duration = task["duration"]
        slack = task["slack"]
        risk = task["risk_score"]

        # Heuristic compression potential
        if duration >= 20:
            action = "Crash by adding additional skilled crews and parallel work fronts."
            reduction_estimate = "10-20%"
        elif duration >= 10:
            action = "Apply fast-tracking by overlapping successor activities."
            reduction_estimate = "5-15%"
        elif duration >= 5:
            action = "Optimize sequencing and improve productivity."
            reduction_estimate = "3-8%"
        else:
            action = "Limited compression potential; monitor execution efficiency."
            reduction_estimate = "0-3%"

        optimization_data.append({
            "name": task["name"],
            "duration": duration,
            "risk": risk,
            "slack": slack,
            "suggested_action": action,
            "estimated_reduction": reduction_estimate
        })

    return optimization_data


def generate_time_optimization_summary(total_duration, tasks_analysis, critical_path):
    """
    Generates AI-driven time optimization strategy.
    """

    if not OPENROUTER_API_KEY:
        return "OpenRouter API key not configured."

    optimization_data = _build_optimization_data(
        total_duration,
        tasks_analysis,
        critical_path
    )

    prompt_lines = [
        "You are a senior EPC schedule optimization expert.",
        "",
        f"Current Total Project Duration: {total_duration} days",
        "",
        "Critical Path Optimization Opportunities:"
    ]

    for task in optimization_data:
        prompt_lines.append(
            f"- {task['name']} | Duration: {task['duration']} days | "
            f"Risk: {task['risk']} | Slack: {task['slack']} | "
            f"Suggested: {task['suggested_action']} | "
            f"Potential Reduction: {task['estimated_reduction']}"
        )

    prompt_lines.append(
        "\nProvide a structured optimization strategy including:"
        "\n1. Key compression targets"
        "\n2. Recommended crashing or fast-tracking approach"
        "\n3. Resource implications"
        "\n4. Risk trade-offs"
        "\n5. Estimated achievable overall schedule reduction percentage"
        "\nEnsure the response is complete and professional."
    )

    prompt = "\n".join(prompt_lines)

    payload = {
        "model": "openai/gpt-4o-mini",
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.4,
        "max_tokens": 900
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

        if response.status_code != 200:
            return f"OpenRouter Error: {response.text}"

        data = response.json()
        return data["choices"][0]["message"]["content"].strip()

    except Exception as e:
        return f"Error generating optimization summary: {str(e)}"