from typing import List, Optional
from pydantic import BaseModel, Field


class Resource(BaseModel):
    id: Optional[int] = None
    name: str
    type: str  # "Labor", "Equipment", etc.


class Task(BaseModel):
    id: Optional[int] = None
    name: str
    duration: int = Field(..., gt=0)
    assigned_resources: List[int] = Field(default_factory=list)
    dependencies: List[int] = Field(default_factory=list)
    slack: Optional[int] = None
    risk_score: Optional[int] = None
    actionable_step: Optional[str] = None

