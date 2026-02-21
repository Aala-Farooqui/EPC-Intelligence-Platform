from pydantic import BaseModel
from typing import List
from .models import Task, Resource
from typing import Optional

class RiskAnalysisRequest(BaseModel):
    tasks: List[Task]
    resources: Optional[List[Resource]] = []
