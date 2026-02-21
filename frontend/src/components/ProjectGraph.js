import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const ProjectGraph = ({ tasks, criticalPath }) => {
  const svgRef = useRef();
  const containerRef = useRef();

  useEffect(() => {
    if (!tasks || tasks.length === 0) return;

    const width = containerRef.current.clientWidth;
    const height = Math.max(500, tasks.length * 120);

    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    // -----------------------------
    // STEP 1: Compute Levels (DAG)
    // -----------------------------

    const nodeMap = {};
    tasks.forEach((task) => {
      nodeMap[task.id] = { ...task };
    });

    const levels = {};

    function getLevel(task) {
      if (!task.dependencies || task.dependencies.length === 0) return 0;
      return (
        Math.max(
          ...task.dependencies.map((depId) =>
            getLevel(nodeMap[depId])
          )
        ) + 1
      );
    }

    tasks.forEach((task) => {
      levels[task.id] = getLevel(task);
    });

    const maxLevel = Math.max(...Object.values(levels));

    // -----------------------------
    // STEP 2: Group By Level
    // -----------------------------

    const levelGroups = {};

    tasks.forEach((task) => {
      const level = levels[task.id];
      if (!levelGroups[level]) {
        levelGroups[level] = [];
      }
      levelGroups[level].push(task);
    });

    // -----------------------------
    // STEP 3: Position Nodes
    // -----------------------------

    const nodes = [];
    const horizontalSpacing = width / (maxLevel + 2);

    Object.keys(levelGroups).forEach((levelKey) => {
      const level = Number(levelKey);
      const group = levelGroups[level];
      const verticalSpacing = height / (group.length + 1);

      group.forEach((task, index) => {
        nodes.push({
          ...task,
          x: (level + 1) * horizontalSpacing,
          y: (index + 1) * verticalSpacing
        });
      });
    });

    // -----------------------------
    // STEP 4: Build Links
    // -----------------------------

    const links = [];
    tasks.forEach((task) => {
      if (task.dependencies) {
        task.dependencies.forEach((dep) => {
          links.push({
            source: dep,
            target: task.id
          });
        });
      }
    });

    // -----------------------------
    // STEP 5: Draw Links
    // -----------------------------

    svg
      .append("g")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("x1", (d) => nodes.find(n => n.id === d.source)?.x)
      .attr("y1", (d) => nodes.find(n => n.id === d.source)?.y)
      .attr("x2", (d) => nodes.find(n => n.id === d.target)?.x)
      .attr("y2", (d) => nodes.find(n => n.id === d.target)?.y)
      .attr("stroke", (d) =>
        criticalPath &&
        criticalPath.includes(d.source) &&
        criticalPath.includes(d.target)
          ? "red"
          : "#aaa"
      )
      .attr("stroke-width", (d) =>
        criticalPath &&
        criticalPath.includes(d.source) &&
        criticalPath.includes(d.target)
          ? 3
          : 1.5
      );

    // -----------------------------
    // STEP 6: Draw Nodes
    // -----------------------------

    svg
      .append("g")
      .selectAll("circle")
      .data(nodes)
      .join("circle")
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y)
      .attr("r", 28)
      .attr("fill", (d) =>
        criticalPath && criticalPath.includes(d.id)
          ? "#dc2626"
          : "#2563eb"
      );

    // -----------------------------
    // STEP 7: Labels
    // -----------------------------

    svg
      .append("g")
      .selectAll("text")
      .data(nodes)
      .join("text")
      .attr("x", (d) => d.x)
      .attr("y", (d) => d.y + 5)
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .attr("font-size", "12px")
      .text((d) => d.name);

  }, [tasks, criticalPath]);

  return (
    <div
      ref={containerRef}
      className="w-full overflow-auto"
      style={{ maxHeight: "500px" }}
    >
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default ProjectGraph;
