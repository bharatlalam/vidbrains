import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { generateConceptGraph } from "../../utils/api";

export default function ConceptGraphPanel({ data }) {
  const svgRef = useRef(null);
  const [graph, setGraph] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [generated, setGenerated] = useState(false);

  const language = data.language || "en";

  async function generate() {
    setLoading(true);
    try {
      const result = await generateConceptGraph({
        title: data.title,
        summary: data.summary,
        keyPoints: data.keyPoints,
        context: data.context,
        language,
      });
      setGraph(result);
      setGenerated(true);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!graph || !svgRef.current) return;
    drawGraph(graph, svgRef.current, setSelectedNode);
  }, [graph]);

  if (!generated) return (
    <div className="text-center py-10">
      <div style={{ fontSize: 56, marginBottom: 12 }}>🕸️</div>
      <h2 className="text-xl font-black mb-2" style={{ letterSpacing: "-0.5px" }}>Concept Graph</h2>
      <p className="text-sm mb-4 max-w-sm mx-auto leading-relaxed" style={{ color: "#9b9a96" }}>
        See how all concepts in this video connect to each other.
      </p>
      {language !== "en" && (
        <p className="text-xs mb-6 px-3 py-1.5 rounded-full inline-block"
          style={{ background: "rgba(224,90,43,0.1)", border: "1px solid rgba(224,90,43,0.25)", color: "#e05a2b" }}>
          🌐 Graph will be in {language.toUpperCase()}
        </p>
      )}
      <button onClick={generate} disabled={loading}
        className="px-8 py-3 rounded-xl text-sm font-bold text-white"
        style={{ background: "#e05a2b", border: "none", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1 }}>
        {loading ? "Building graph..." : "Generate Concept Graph →"}
      </button>
    </div>
  );

  if (loading) return (
    <div className="text-center py-10">
      <div className="w-10 h-10 rounded-full mx-auto mb-4 animate-spin"
        style={{ border: "2px solid rgba(255,255,255,0.07)", borderTopColor: "#e05a2b" }} />
      <p className="text-sm">Building your concept graph...</p>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold tracking-widest uppercase" style={{ color: "#5a5958" }}>
          Concept Graph — click any node to explore
        </p>
        <button onClick={() => { setGenerated(false); setGraph(null); setSelectedNode(null); }}
          className="text-xs px-3 py-1.5 rounded-lg"
          style={{ border: "1px solid rgba(255,255,255,0.07)", background: "transparent", color: "#9b9a96", cursor: "pointer" }}>
          Regenerate
        </button>
      </div>

      <div className="flex gap-3 mb-3 flex-wrap">
        {[
          { color: "#e05a2b", label: "Core Topic" },
          { color: "#4a9eff", label: "Key Concepts" },
          { color: "#3cb87a", label: "Supporting" },
          { color: "#9b6dff", label: "Related" },
          { color: "#f0a030", label: "Examples" },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: l.color }} />
            <span className="text-xs" style={{ color: "#9b9a96" }}>{l.label}</span>
          </div>
        ))}
      </div>

      <svg ref={svgRef} style={{
        width: "100%", height: 420, display: "block",
        background: "#131316", border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 16,
      }} />

      {selectedNode && (
        <div className="mt-3 p-4 rounded-xl animate-fade-in"
          style={{ background: "#131316", border: `1px solid ${selectedNode.color}40` }}>
          <div className="flex items-center gap-2 mb-2">
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: selectedNode.color, flexShrink: 0 }} />
            <p className="text-sm font-bold" style={{ color: selectedNode.color }}>{selectedNode.label}</p>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: "#9b9a96" }}>{selectedNode.description}</p>
        </div>
      )}
    </div>
  );
}

function drawGraph(graph, svgEl, setSelectedNode) {
  const d3Svg = d3.select(svgEl);
  d3Svg.selectAll("*").remove();

  const W = svgEl.clientWidth || 720;
  const H = 420;

  const nodes = [
    { id: graph.centralConcept.id, label: graph.centralConcept.label, description: graph.centralConcept.description, color: graph.centralConcept.color, isRoot: true },
    ...graph.nodes.map((n) => ({ ...n })),
  ];

  const links = graph.edges.map((e) => ({ source: e.from, target: e.to, label: e.label }));

  const simulation = d3.forceSimulation(nodes)
    .force("link", d3.forceLink(links).id((d) => d.id).distance(100))
    .force("charge", d3.forceManyBody().strength(-300))
    .force("center", d3.forceCenter(W / 2, H / 2))
    .force("collision", d3.forceCollide(50));

  const g = d3Svg.append("g");
  const zoom = d3.zoom().scaleExtent([0.4, 2.5]).on("zoom", (e) => g.attr("transform", e.transform));
  d3Svg.call(zoom);

  const link = g.append("g").selectAll("line")
    .data(links).join("line")
    .attr("stroke", "rgba(255,255,255,0.1)")
    .attr("stroke-width", 1.5);

  const edgeLabel = g.append("g").selectAll("text")
    .data(links).join("text")
    .attr("text-anchor", "middle")
    .attr("font-size", 9)
    .attr("fill", "rgba(255,255,255,0.25)")
    .attr("font-family", "Syne, sans-serif")
    .text((d) => d.label);

  const node = g.append("g").selectAll("g")
    .data(nodes).join("g")
    .style("cursor", "pointer")
    .on("click", (_, d) => setSelectedNode(d))
    .call(d3.drag()
      .on("start", (e, d) => { if (!e.active) simulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
      .on("drag", (e, d) => { d.fx = e.x; d.fy = e.y; })
      .on("end", (e, d) => { if (!e.active) simulation.alphaTarget(0); d.fx = null; d.fy = null; })
    );

  node.append("circle")
    .attr("r", (d) => d.isRoot ? 36 : 26)
    .attr("fill", (d) => d.color + "22")
    .attr("stroke", (d) => d.color)
    .attr("stroke-width", (d) => d.isRoot ? 2.5 : 1.5);

  node.append("text")
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "middle")
    .attr("font-family", "Syne, sans-serif")
    .attr("font-size", (d) => d.isRoot ? 11 : 9)
    .attr("font-weight", 700)
    .attr("fill", (d) => d.color)
    .each(function(d) {
      const words = d.label.split(" ");
      const el = d3.select(this);
      if (words.length <= 2) {
        el.text(d.label);
      } else {
        el.append("tspan").attr("x", 0).attr("dy", "-0.5em").text(words.slice(0, 2).join(" "));
        el.append("tspan").attr("x", 0).attr("dy", "1.2em").text(words.slice(2).join(" "));
      }
    });

  simulation.on("tick", () => {
    link
      .attr("x1", (d) => d.source.x).attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x).attr("y2", (d) => d.target.y);
    edgeLabel
      .attr("x", (d) => (d.source.x + d.target.x) / 2)
      .attr("y", (d) => (d.source.y + d.target.y) / 2);
    node.attr("transform", (d) => `translate(${d.x},${d.y})`);
  });
}