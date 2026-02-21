# test_llm.py
from dotenv import load_dotenv
import os

# Load .env file so your API key is available
load_dotenv()

from app.resource_opt import generate_llm_explanation

# Sample conflict to test
sample_conflicts = [
    {"resource_id": 1, "resource_name": "Crane 1", "conflicting_tasks": [1, 5]}
]

# Call the function
explanation = generate_llm_explanation(sample_conflicts)

# Print the result
print("LLM Explanation:\n", explanation)
