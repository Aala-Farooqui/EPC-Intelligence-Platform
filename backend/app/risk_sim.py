import numpy as np
from typing import List, Dict
from .models import Task

def pert_task_duration(task: Task) -> float:
    """
    PERT formula: Expected duration = (O + 4M + P) / 6
    For MVP, we simulate min=0.8*duration, mode=duration, max=1.2*duration
    """
    O = 0.8 * task.duration
    M = task.duration
    P = 1.2 * task.duration
    return (O + 4*M + P) / 6

def monte_carlo_simulation(tasks: List[Task], iterations: int = 1000) -> List[int]:
    """
    Run Monte Carlo simulation on project tasks
    Returns simulated project durations
    """
    results = []

    for _ in range(iterations):
        total_duration = 0
        for task in tasks:
            # Random sample based on PERT-like beta distribution approximation
            sample_duration = np.random.beta(2, 2) * (1.2*task.duration - 0.8*task.duration) + 0.8*task.duration
            total_duration += sample_duration
        results.append(int(total_duration))
    
    return results

def project_completion_stats(simulations: List[int]) -> Dict:
    """
    Returns basic statistics
    """
    return {
        "min_duration": int(np.min(simulations)),
        "max_duration": int(np.max(simulations)),
        "mean_duration": int(np.mean(simulations)),
        "median_duration": int(np.median(simulations)),
        "p90_duration": int(np.percentile(simulations, 90))
    }
