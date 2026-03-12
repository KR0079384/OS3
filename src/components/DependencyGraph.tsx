import React from "react";
import ReactFlow from "reactflow";
import "reactflow/dist/style.css";

type NodeType = {
  id: string;
  type: string;
};

type EdgeType = {
  source: string;
  target: string;
};

type Props = {
  nodes: NodeType[];
  edges: EdgeType[];
};

const DependencyGraph: React.FC<Props> = ({ nodes, edges }) => {

  const graphNodes = nodes.map((node, index) => ({
    id: node.id,
    data: { label: node.id },
    position: { x: 250, y: index * 80 },
  }));

  const graphEdges = edges.map((edge, index) => ({
    id: `e${index}`,
    source: edge.source,
    target: edge.target,
  }));

  return (
    <div style={{ height: 500, border: "1px solid #eee" }}>
      <ReactFlow nodes={graphNodes} edges={graphEdges} />
    </div>
  );
};

export default DependencyGraph;