from fastapi import APIRouter, HTTPException
from typing import List
from .models import Task, Resource
from .critical_path import compute_critical_path
from .resource_opt import detect_resource_conflicts, suggest_resolution,generate_llm_explanation
from .risk_sim import monte_carlo_simulation, project_completion_stats
from .database import RESOURCES, TASKS
from fastapi import Body
from .risk_opt import generate_risk_llm_explanation
from .schemas import RiskAnalysisRequest
from .nlp_opt import generate_nlp_response
from .summary_opt import generate_project_summary

router = APIRouter()

@router.post("/nlp-query")
def nlp_query(payload: dict):
    query = payload.get("query")

    cp_data = compute_critical_path(
        list(TASKS.values()),
        list(RESOURCES.values())
    )

    answer = generate_nlp_response(
        query=query,
        critical_path=cp_data["critical_path"],
        total_duration=cp_data["total_duration"],
        tasks_analysis=cp_data["tasks_analysis"]
    )

    return {"answer": answer}

# -------------------
# ROOT
# -------------------
@router.get("/")
def root():
    return {"status": "Backend running"}


# -------------------
# TASK Endpoints
# -------------------

@router.get("/tasks", response_model=List[Task])
def get_tasks():
    return list(TASKS.values())


@router.post("/tasks", response_model=Task)
def add_task(task: Task):
    new_id = max(TASKS.keys(), default=0) + 1
    task.id = new_id
    TASKS[new_id] = task
    return task


# -------------------
# RESOURCE Endpoints
# -------------------

@router.get("/resources", response_model=List[Resource])
def list_resources():
    return list(RESOURCES.values())

@router.post("/resources")
def add_resource(resource: Resource):
    if resource.id in RESOURCES:
        return {"message": "Resource already exists"}

    RESOURCES[resource.id] = resource
    return {"message": "Resource added", "resource": resource}


# -------------------
# CRITICAL PATH
# -------------------
@router.get("/critical-path")
def get_critical_path():
    try:
        tasks = list(TASKS.values())
        resources = list(RESOURCES.values())

        result = compute_critical_path(tasks, resources)

        return result

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))




# -------------------
# RESOURCE CONFLICTS
# -------------------
# -----------------------
# Endpoint to get resource conflicts
@router.get("/resource-conflicts")
def get_resource_conflicts():
    tasks = list(TASKS.values())
    conflicts = detect_resource_conflicts(tasks)

    # Attach suggested resolution for each conflict
    conflicts_with_resolution = []
    for conflict in conflicts:
        conflicts_with_resolution.append(
            suggest_resolution(conflict)  # returns {"conflict":..., "resolution":...}
        )

    return {"conflicts": conflicts_with_resolution}



# -----------------------
# Endpoint to generate LLM explanation for conflicts
# -----------------------


@router.post("/resource-conflicts/explain")
def explain_resource_conflicts(conflicts: list = Body(...)):
    if not conflicts:
        return {"explanation": "No resource conflicts detected."}

    try:
        explanation = generate_llm_explanation([c["conflict"] for c in conflicts])
        return {"explanation": explanation}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LLM explanation failed: {str(e)}")


# -------------------
# RISK SIMULATION
# -------------------

@router.post("/risk-analysis/explain")
def explain_risks(payload: RiskAnalysisRequest):
    if not payload.tasks:
        return {"explanation": "No tasks provided."}

    try:
        # Step 1: Compute critical path + slack + risk
        result = compute_critical_path(
            payload.tasks,
            payload.resources
        )

        tasks_analysis = result["tasks_analysis"]

        print("DEBUG: Enriched tasks_analysis:", tasks_analysis)

        # Step 2: Send enriched data to LLM
        explanation = generate_risk_llm_explanation(tasks_analysis)

        return {
            "critical_path": result["critical_path"],
            "total_duration": result["total_duration"],
            "explanation": explanation
        }

    except Exception as e:
        import traceback
        print("ERROR in explain_risks:", traceback.format_exc())
        raise HTTPException(
            status_code=500,
            detail=f"LLM risk explanation failed: {str(e)}"
        )


@router.get("/risk-simulation")
def run_risk_simulation(iterations: int = 1000):
    sims = monte_carlo_simulation(list(TASKS.values()), iterations)
    stats = project_completion_stats(sims)
    return stats

@router.post("/generate-summary")
def generate_summary():
    try:
        cp_data = compute_critical_path(
            list(TASKS.values()),
            list(RESOURCES.values())
        )

        summary = generate_project_summary(
            critical_path=cp_data["critical_path"],
            total_duration=cp_data["total_duration"],
            tasks_analysis=cp_data["tasks_analysis"]
        )

        return {"summary": summary}

    except Exception as e:
        return {"summary": f"Error generating summary: {str(e)}"}
