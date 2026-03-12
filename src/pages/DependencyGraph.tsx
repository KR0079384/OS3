import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Network } from "lucide-react";
import PageTransition from "@/components/PageTransition";

const DependencyGraph = () => {

  const location = useLocation();
  const graph = location.state?.graph;

  if (!graph) {
    return (
      <PageTransition>
        <div className="container pt-24">
          <h1>No dependency graph available</h1>
        </div>
      </PageTransition>
    );
  }

  const nodes = graph.nodes || [];
  const edges = graph.edges || [];

  const root = nodes[0];
  const dependencies = nodes.slice(1);

  const width = 1000;
  const rootX = width / 2;
  const rootY = 80;

  const perRow = 8;
  const rowSpacing = 120;
  const colSpacing = width / (perRow + 1);

  const totalRows = Math.ceil(dependencies.length / perRow);

  const svgHeight = 220 + totalRows * rowSpacing + 120;

  const positionedNodes = [
    { ...root, x: rootX, y: rootY },

    ...dependencies.map((node: any, i: number) => {

      const row = Math.floor(i / perRow);
      const col = i % perRow;

      return {
        ...node,
        x: colSpacing * (col + 1),
        y: 220 + row * rowSpacing
      };

    })
  ];

  const findNode = (id: string) =>
    positionedNodes.find(n => n.id === id);

  return (
    <PageTransition>

      <div className="container pt-24">

        <div className="flex items-center gap-3 mb-6">
          <Network className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold">Dependency Graph</h1>
        </div>

        <Card className="bg-card/40 backdrop-blur-sm border-border/50">
          <CardContent>

            <svg width={width} height={svgHeight}>

              {edges.map((edge: any, i: number) => {

                const source = findNode(edge.source);
                const target = findNode(edge.target);

                if (!source || !target) return null;

                return (
                  <line
                    key={i}
                    x1={source.x}
                    y1={source.y}
                    x2={target.x}
                    y2={target.y}
                    stroke="#888"
                    strokeWidth="1.5"
                  />
                );

              })}

              {positionedNodes.map((node: any, i: number) => (

                <motion.g
                  key={node.id}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.03 }}
                >

                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={node.type === "root" ? 16 : 10}
                    fill="#00e0ff"
                  />

                  <text
                    x={node.x}
                    y={node.y + 22}
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

      </div>

    </PageTransition>
  );

};

export default DependencyGraph;