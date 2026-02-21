import networkx as nx
from typing import List, Dict
from .models import Task, Resource



def compute_critical_path(tasks: List[Task], resources: List[Resource]) -> Dict:
    if not tasks:
        return {"critical_path": [], "total_duration": 0, "tasks_analysis": []}

    resource_map = {r.id: r.name for r in resources}

    G = nx.DiGraph()

    for task in tasks:
        G.add_node(task.id, name=task.name, duration=task.duration)

    for task in tasks:
        if task.dependencies:
            for dep in task.dependencies:
                if any(t.id == dep for t in tasks):
                    G.add_edge(dep, task.id)

    if not nx.is_directed_acyclic_graph(G):
        return {"critical_path": [], "total_duration": 0, "tasks_analysis": []}

    topo_order = list(nx.topological_sort(G))

    ES, EF = {}, {}
    for node in topo_order:
        preds = list(G.predecessors(node))
        ES[node] = max([EF[p] for p in preds], default=0)
        EF[node] = ES[node] + G.nodes[node]["duration"]

    total_duration = max(EF.values())

    LS, LF = {}, {}
    for node in reversed(topo_order):
        succs = list(G.successors(node))
        LF[node] = min([LS[s] for s in succs], default=total_duration)
        LS[node] = LF[node] - G.nodes[node]["duration"]

    tasks_analysis = []

    for task in tasks:
        slack = LS[task.id] - ES[task.id]
        dependency_count = len(task.dependencies) if task.dependencies else 0

        resource_names = [
            resource_map[rid]
            for rid in task.assigned_resources
            if rid in resource_map
        ]

        resource_count = len(resource_names)

        # 1. Slack impact (MOST IMPORTANT)
        if slack == 0:
            slack_factor = 50
        elif slack <= 2:
            slack_factor = 35
        else:
            slack_factor = max(5, 30 - slack * 5)

    # 2. Duration impact (longer tasks = more exposure)
        duration_factor = min(task.duration * 2, 20)

    # 3. Dependency complexity
        complexity_factor = dependency_count * 5

    # 4. Resource exposure
        resource_factor = resource_count * 4

    # --- Final Score ---
        risk_score = slack_factor + duration_factor + complexity_factor + resource_factor

    # Normalize safely
        risk_score = max(5, min(int(risk_score), 95))

        task.risk_score = risk_score

        recommendations = []
        if risk_score >= 80:
            recommendations.append("Immediate mitigation planning required")
        if slack == 0:
            recommendations.append("Zero float - high schedule sensitivity")
        if resource_count == 0:
            recommendations.append("No resources assigned")
        if dependency_count > 0:
            recommendations.append("Dependency-driven exposure")

        tasks_analysis.append({
            "id": task.id,
            "name": task.name,
            "duration": task.duration,
            "slack": slack,
            "resources": resource_names,
            "risk_score": risk_score,
            "recommendations": recommendations
        })

    critical_path = [n for n in topo_order if LS[n] - ES[n] == 0]

    return {
        "critical_path": critical_path,
        "total_duration": total_duration,
        "tasks_analysis": tasks_analysis
    }
