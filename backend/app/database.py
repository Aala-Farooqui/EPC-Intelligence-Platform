from typing import Dict
from .models import Resource, Task

# In-memory storage
RESOURCES: Dict[int, Resource] = {}  # id -> Resource
TASKS: Dict[int, Task] = {}  # id -> Task
