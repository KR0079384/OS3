import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Network } from "lucide-react";
import PageTransition from "@/components/PageTransition";
import { useState } from "react";

interface GraphNode {
  id: string;
  type: string;
  x?: number;
  y?: number;
}

interface GraphEdge {
  source: string;
  target: string;
}

interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

const DependencyGraph = () => {

  const location = useLocation();

  const initialGraph: GraphData =
    location.state?.graph ?? { nodes: [], edges: [] };

  const attackPaths: string[][] =
    location.state?.attackPaths ?? [];

  const [graph, setGraph] = useState<GraphData>(initialGraph);

  const [showAttackPaths, setShowAttackPaths] = useState(false);

  if (!graph.nodes.length) {

    return (
      <PageTransition>
        <div className="container pt-24">
          <h1 className="text-xl font-bold">No dependency graph available</h1>
        </div>
      </PageTransition>
    );

  }

  const nodes = graph.nodes;
  const edges = graph.edges;

  const width = 1000;

  const perRow = 8;
  const rowSpacing = 140;
  const colSpacing = width / (perRow + 1);

  const totalRows = Math.ceil((nodes.length - 1) / perRow);

  const svgHeight = 260 + totalRows * rowSpacing + 200;

  /* -----------------------------
     Dynamic Node Layout
  ----------------------------- */

  const positionedNodes: GraphNode[] = nodes.map((node, i) => {

    if (i === 0) {
      return {
        ...node,
        x: width / 2,
        y: 100
      };
    }

    const row = Math.floor((i - 1) / perRow);
    const col = (i - 1) % perRow;

    return {
      ...node,
      x: colSpacing * (col + 1),
      y: 260 + row * rowSpacing
    };

  });

  const findNode = (id: string) =>
    positionedNodes.find(n => n.id === id);

  /* -----------------------------
     Attack Path Highlighting
  ----------------------------- */

  const attackEdgeSet = new Set<string>();

  attackPaths.forEach(path => {

    for (let i = 0; i < path.length - 1; i++) {

      const key = `${path[i]}->${path[i + 1]}`;

      attackEdgeSet.add(key);

    }

  });

  /* -----------------------------
     Detect Attack Nodes
  ----------------------------- */

  const attackNodeSet = new Set<string>();

  attackPaths.forEach(path => {
    path.forEach(node => attackNodeSet.add(node));
  });

  /* -----------------------------
     Risk Color Logic
  ----------------------------- */

  const getNodeColor = (node: GraphNode) => {

    if (node.type === "root") return "#00e0ff";

    if (showAttackPaths && attackNodeSet.has(node.id)) {
      return "#ef4444"; // red = high risk
    }

    return "#38bdf8"; // normal dependency
  };

  /* -----------------------------
     Expand Node
  ----------------------------- */

  const expandNode = async (nodeId: string) => {

    try {

      const res = await fetch(
        `http://127.0.0.1:8000/api/expand-node?package=${nodeId}`
      );

      const data = await res.json();

      const newNodes = data.nodes.filter(
        (n: GraphNode) =>
          !graph.nodes.some(existing => existing.id === n.id)
      );

      const newEdges = data.edges.filter(
        (e: GraphEdge) =>
          !graph.edges.some(
            existing =>
              existing.source === e.source &&
              existing.target === e.target
          )
      );

      if (newNodes.length === 0) return;

      setGraph({
        nodes: [...graph.nodes, ...newNodes],
        edges: [...graph.edges, ...newEdges]
      });

    } catch (err) {

      console.error("Expansion error:", err);

    }

  };

  return (

    <PageTransition>

      <div className="container pt-24">

        <div className="flex items-center gap-3 mb-6">
          <Network className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold">Dependency Graph</h1>
        </div>

        <Card className="bg-card/40 backdrop-blur-sm border-border/50">

          <CardContent className="overflow-x-auto">

            <svg width={width} height={svgHeight}>

              {/* -----------------------------
                   EDGES
              ----------------------------- */}

              {edges.map((edge, i) => {

                const source = findNode(edge.source);
                const target = findNode(edge.target);

                if (!source || !target) return null;

                const key = `${edge.source}->${edge.target}`;

                const isAttackEdge =
                  showAttackPaths && attackEdgeSet.has(key);

                return (

                  <line
                    key={i}
                    x1={source.x}
                    y1={source.y}
                    x2={target.x}
                    y2={target.y}
                    stroke={isAttackEdge ? "#ef4444" : "#6b7280"}
                    strokeWidth={isAttackEdge ? "3" : "1.5"}
                  />

                );

              })}

              {/* -----------------------------
                   NODES
              ----------------------------- */}

              {positionedNodes.map((node, i) => (

                <motion.g
                  key={node.id}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => expandNode(node.id)}
                  style={{ cursor: "pointer" }}
                >

                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={node.type === "root" ? 18 : 10}
                    fill={getNodeColor(node)}
                  />

                  {/* Tooltip */}

                  <title>
                    {node.id}
                    {attackNodeSet.has(node.id)
                      ? " (High Risk Dependency)"
                      : " (Dependency)"}
                  </title>

                  <text
                    x={node.x}
                    y={node.y + 26}
                    textAnchor="middle"
                    fill="white"
                    fontSize="11"
                  >
                    {node.id}
                  </text>

                </motion.g>

              ))}

            </svg>

          </CardContent>

        </Card>

        {/* -----------------------------
            Show Attack Path Button
        ----------------------------- */}

        {nodes.length > 6 && (

          <div className="flex justify-center mt-6">

            <button
              onClick={() => setShowAttackPaths(true)}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
            >
              Highlight Attack Paths
            </button>

          </div>

        )}

      </div>

    </PageTransition>

  );

};

export default DependencyGraph;