from typing import List, Dict
from .models import Task
from .database import TASKS,RESOURCES
import os
import requests
from dotenv import load_dotenv

load_dotenv() 



def detect_resource_conflicts(tasks: List[Task]) -> List[Dict]:
    """
    Checks if multiple tasks are assigned the same resource
    at overlapping times (simplified: assumes tasks sequentially scheduled).
    """
    conflicts = []
    resource_schedule = {}  # resource_id -> list of task_ids

    for task in tasks:
        for res_id in task.assigned_resources:
            if res_id not in resource_schedule:
                resource_schedule[res_id] = []
            resource_schedule[res_id].append(task.id)

    for res_id, assigned_tasks in resource_schedule.items():
        if len(assigned_tasks) > 1:
            conflicts.append({
                "resource_id": res_id,
                "resource_name": RESOURCES[res_id].name if res_id in RESOURCES else "Unknown",
                "conflicting_tasks": assigned_tasks
            })

    return conflicts


# -----------------------
# 2️⃣ Suggest Resolution
# -----------------------
def suggest_resolution(conflict: Dict) -> Dict:
    """
    Suggests basic resolutions for a resource conflict
    """
    tasks = conflict["conflicting_tasks"]
    return {
        "conflict": conflict,
        "resolution": f"Delay task {tasks[1]} or split shifts / add extra resource"
    }


# -----------------------
# 3️⃣ Generate LLM Explanation via OpenRouter.ai
# -----------------------
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

def generate_llm_explanation(conflicts: List[Dict]) -> str:
    """
    Generate human-readable explanation for resource conflicts using OpenRouter GPT-3o-mini.
    """
    if not OPENROUTER_API_KEY:
        return "OpenRouter API key not set. Please set OPENROUTER_API_KEY in your environment."

    if not conflicts:
        return "No resource conflicts detected."

    # Build the prompt
    prompt_lines = [ "Explain the following resource conflicts in simple, concise terms (limit to 10-15 lines):\n\n"
    "give 1-2 lines practical solution"]
    for conflict in conflicts:
        tasks_str = ", ".join(str(t) for t in conflict.get("conflicting_tasks", []))
        resource_name = conflict.get("resource_name", "Unknown")
        prompt_lines.append(f"- Resource '{resource_name}' assigned to tasks: {tasks_str}")

    prompt = "\n".join(prompt_lines)

    payload = {
        "model": "gpt-4o-mini",
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.5,
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

        # Debugging info
        if response.status_code != 200:
            print("DEBUG: Request payload:", payload)
            print("DEBUG: Response content:", response.text)
            return f"Failed to generate explanation via LLM. Status code: {response.status_code}"

        data = response.json()
        # Safely extract content
        message_content = data.get("choices", [{}])[0].get("message", {}).get("content", "")
        return message_content.strip() if message_content else "LLM returned empty explanation."

    except Exception as e:
        return f"Error calling OpenRouter API: {str(e)}"