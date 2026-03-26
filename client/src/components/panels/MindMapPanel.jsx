import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const COLORS = ["#e05a2b","#4a9eff","#3cb87a","#9b6dff","#f0a030","#e05a80"];

export default function MindMapPanel({ data, showToast }) {
  const svgRef = useRef(null);
  const zoomRef = useRef(null);

  useEffect(() => {
    if (!data?.mindmap || !svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    const W = svgRef.current.clientWidth || 720, H = 480;
    const cx = W / 2, cy = H / 2;
    const g = svg.append("g");
    const zoom = d3.zoom().scaleExtent([0.35, 3]).on("zoom", (e) => g.attr("transform", e.transform));
    svg.call(zoom);
    zoomRef.current = { svg, zoom };

    const { branches, center } = data.mindmap;
    const step = (2 * Math.PI) / branches.length;

    g.append("circle").attr("cx", cx).attr("cy", cy).attr("r", 44).attr("fill", "#e05a2b").attr("opacity", 0.12);
    g.append("circle").attr("cx", cx).attr("cy", cy).attr("r", 40).attr("fill", "none").attr("stroke", "#e05a2b").attr("stroke-width", 1.5);
    center.split(" ").forEach((w, i, arr) => {
      g.append("text").attr("x", cx).attr("y", cy - (arr.length - 1) * 7 + i * 15)
        .attr("text-anchor", "middle").attr("dominant-baseline", "middle")
        .attr("fill", "#f0efe8").attr("font-family", "Syne, sans-serif").attr("font-size", 12).attr("font-weight", 700).text(w);
    });

    branches.forEach((branch, bi) => {
      const angle = bi * step - Math.PI / 2;
      const bx = cx + Math.cos(angle) * 145, by = cy + Math.sin(angle) * 145;
      const color = COLORS[bi % COLORS.length];
      const bw = Math.max(branch.label.length * 7.5 + 24, 80);

      g.append("line").attr("x1", cx + Math.cos(angle) * 42).attr("y1", cy + Math.sin(angle) * 42)
        .attr("x2", bx).attr("y2", by).attr("stroke", color).attr("stroke-width", 1.5).attr("opacity", 0.45);

      g.append("rect").attr("x", bx - bw / 2).attr("y", by - 14).attr("width", bw).attr("height", 28).attr("rx", 8).attr("fill", color).attr("opacity", 0.14);
      g.append("rect").attr("x", bx - bw / 2).attr("y", by - 14).attr("width", bw).attr("height", 28).attr("rx", 8).attr("fill", "none").attr("stroke", color).attr("stroke-width", 1.2);
      g.append("text").attr("x", bx).attr("y", by).attr("text-anchor", "middle").attr("dominant-baseline", "middle")
        .attr("fill", color).attr("font-family", "Syne, sans-serif").attr("font-size", 11).attr("font-weight", 700).text(branch.label);

      const children = branch.children || [];
      const spread = Math.PI * 0.55;
      const childStep = children.length > 1 ? spread / (children.length - 1) : 0;
      children.forEach((child, ci) => {
        const ca = children.length > 1 ? (angle - spread / 2) + ci * childStep : angle;
        const ccx = cx + Math.cos(ca) * 235, ccy = cy + Math.sin(ca) * 235;
        const cw = Math.max(child.length * 6.5 + 20, 60);

        g.append("line").attr("x1", bx).attr("y1", by).attr("x2", ccx).attr("y2", ccy)
          .attr("stroke", color).attr("stroke-width", 0.8).attr("opacity", 0.28).attr("stroke-dasharray", "3,3");
        g.append("rect").attr("x", ccx - cw / 2).attr("y", ccy - 11).attr("width", cw).attr("height", 22).attr("rx", 6)
          .attr("fill", "#1a1a1f").attr("stroke", color).attr("stroke-width", 0.7);
        g.append("text").attr("x", ccx).attr("y", ccy).attr("text-anchor", "middle").attr("dominant-baseline", "middle")
          .attr("fill", "#9b9a96").attr("font-family", "Syne, sans-serif").attr("font-size", 10).text(child);
      });
    });
  }, [data]);

  function resetZoom() {
    if (zoomRef.current) zoomRef.current.svg.transition().duration(400).call(zoomRef.current.zoom.transform, d3.zoomIdentity);
  }

  function downloadSVG() {
    const s = new XMLSerializer().serializeToString(svgRef.current);
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(new Blob([s], { type: "image/svg+xml" })), download: "vidbrain-mindmap.svg" });
    a.click();
    showToast("Mind map saved!");
  }

  return (
    <div>
      <div className="flex justify-end gap-2 mb-3">
        <button onClick={resetZoom} className="text-xs font-semibold px-3 py-1.5 rounded-lg"
          style={{ border: "1px solid rgba(255,255,255,0.07)", background: "transparent", color: "#9b9a96", cursor: "pointer" }}>⊙ Reset zoom</button>
        <button onClick={downloadSVG} className="text-xs font-semibold px-3 py-1.5 rounded-lg"
          style={{ border: "1px solid rgba(255,255,255,0.07)", background: "transparent", color: "#9b9a96", cursor: "pointer" }}>⬇ Save SVG</button>
      </div>
      <svg ref={svgRef} style={{ width: "100%", height: 480, display: "block", background: "#131316", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16 }} />
      <p className="text-xs text-center mt-2" style={{ color: "#5a5958" }}>Scroll to zoom · drag to pan</p>
    </div>
  );
}