import React, { useState } from "react";

export default function QAPanel({ data }) {
  const [open, setOpen] = useState(null);

  return (
    <div>
      <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: "#5a5958" }}>
        Auto-generated questions from the video
      </p>
      <div className="flex flex-col gap-2">
        {data.qa.map((item, i) => (
          <div key={i} className="rounded-2xl overflow-hidden"
            style={{ background: "#131316", border: `1px solid ${open === i ? "#e05a2b" : "rgba(255,255,255,0.07)"}` }}>
            <div className="flex justify-between items-center gap-3 px-4 py-3 cursor-pointer select-none"
              onClick={() => setOpen(open === i ? null : i)}>
              <span className="text-sm font-semibold">{item.question}</span>
              <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-sm transition-all"
                style={{ border: "1px solid rgba(255,255,255,0.07)", background: open === i ? "#e05a2b" : "transparent", color: open === i ? "white" : "#9b9a96", transform: open === i ? "rotate(45deg)" : "none" }}>
                +
              </div>
            </div>
            {open === i && (
              <div className="px-4 pb-4 pt-3 text-sm animate-fade-in"
                style={{ borderTop: "1px solid rgba(255,255,255,0.07)", color: "#9b9a96", lineHeight: "1.7" }}>
                {item.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}