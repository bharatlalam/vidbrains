import React, { useState, useEffect } from "react";
import { getCollections, createCollection, deleteCollection, getCollectionItems, removeFromCollection } from "../utils/api";

const EMOJIS = ["📚", "💻", "🧠", "🎯", "🔬", "📊", "🎨", "🌍", "💡", "🚀", "🏆", "🎓"];

export default function CollectionsView({ onBack, onReanalyze }) {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmoji, setNewEmoji] = useState("📚");
  const [newDesc, setNewDesc] = useState("");
  const [openCollection, setOpenCollection] = useState(null);
  const [items, setItems] = useState([]);

  useEffect(() => { loadCollections(); }, []);

  async function loadCollections() {
    setLoading(true);
    getCollections().then(setCollections).finally(() => setLoading(false));
  }

  async function handleCreate() {
    if (!newName.trim()) return;
    const col = await createCollection({ name: newName.trim(), emoji: newEmoji, description: newDesc });
    setCollections((c) => [{ ...col, item_count: 0 }, ...c]);
    setNewName(""); setNewDesc(""); setCreating(false);
  }

  async function handleOpen(col) {
    setOpenCollection(col);
    const data = await getCollectionItems(col.id);
    setItems(data);
  }

  async function handleRemove(itemId) {
    await removeFromCollection(openCollection.id, itemId);
    setItems((i) => i.filter((x) => x.id !== itemId));
    setCollections((c) => c.map((col) => col.id === openCollection.id ? { ...col, item_count: col.item_count - 1 } : col));
  }

  async function handleDelete(id) {
    if (!confirm("Delete this collection?")) return;
    await deleteCollection(id);
    setCollections((c) => c.filter((col) => col.id !== id));
    if (openCollection?.id === id) setOpenCollection(null);
  }

  // Collection detail view
  if (openCollection) return (
    <div className="pt-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setOpenCollection(null)} className="text-xs px-3 py-1.5 rounded-lg"
          style={{ border: "1px solid rgba(255,255,255,0.07)", color: "#9b9a96", background: "transparent", cursor: "pointer" }}>
          ← Back
        </button>
        <div className="flex items-center gap-2">
          <span style={{ fontSize: 24 }}>{openCollection.emoji}</span>
          <div>
            <h2 className="text-lg font-black" style={{ letterSpacing: "-0.5px" }}>{openCollection.name}</h2>
            <p className="text-xs" style={{ color: "#9b9a96" }}>{items.length} videos</p>
          </div>
        </div>
        <button onClick={() => handleDelete(openCollection.id)} className="ml-auto text-xs px-3 py-1.5 rounded-lg"
          style={{ border: "1px solid rgba(224,90,43,0.2)", color: "#e05a2b", background: "transparent", cursor: "pointer" }}>
          🗑 Delete
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12" style={{ background: "#131316", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16 }}>
          <p style={{ fontSize: 36, marginBottom: 10 }}>📭</p>
          <p className="text-sm font-semibold mb-1">No videos yet</p>
          <p className="text-xs" style={{ color: "#5a5958" }}>Analyze a video and save it to this collection</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl"
              style={{ background: "#131316", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="w-16 h-10 rounded-lg overflow-hidden flex-shrink-0" style={{ background: "#1a1a1f" }}>
                {item.thumbnail && <img src={item.thumbnail} alt="" className="w-full h-full object-cover" onError={(e) => e.target.style.display = "none"} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate">{item.video_title}</p>
                <p className="text-xs" style={{ color: "#9b9a96" }}>{item.channel} · {item.duration}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => onReanalyze && onReanalyze(item)}
                  className="text-xs px-2 py-1 rounded-lg"
                  style={{ border: "1px solid rgba(255,255,255,0.07)", color: "#9b9a96", background: "transparent", cursor: "pointer" }}>
                  Open →
                </button>
                <button onClick={() => handleRemove(item.id)}
                  className="text-xs px-2 py-1 rounded-lg"
                  style={{ border: "1px solid rgba(224,90,43,0.2)", color: "#e05a2b", background: "transparent", cursor: "pointer" }}>
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Collections list view
  return (
    <div className="pt-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-xs px-3 py-1.5 rounded-lg"
            style={{ border: "1px solid rgba(255,255,255,0.07)", color: "#9b9a96", background: "transparent", cursor: "pointer" }}>
            ← Back
          </button>
          <div>
            <h2 className="text-lg font-black" style={{ letterSpacing: "-0.5px" }}>📚 Collections</h2>
            <p className="text-xs" style={{ color: "#9b9a96" }}>Organize your learning library</p>
          </div>
        </div>
        <button onClick={() => setCreating(true)}
          className="text-xs font-bold px-4 py-2 rounded-lg"
          style={{ background: "#e05a2b", color: "white", border: "none", cursor: "pointer" }}>
          + New Collection
        </button>
      </div>

      {/* Create form */}
      {creating && (
        <div className="p-5 rounded-2xl mb-5 animate-fade-in"
          style={{ background: "#131316", border: "1px solid rgba(224,90,43,0.3)" }}>
          <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: "#5a5958" }}>New Collection</p>

          <div className="flex flex-wrap gap-2 mb-3">
            {EMOJIS.map((e) => (
              <button key={e} onClick={() => setNewEmoji(e)}
                style={{ fontSize: 20, width: 36, height: 36, borderRadius: 8, border: `1px solid ${newEmoji === e ? "#e05a2b" : "rgba(255,255,255,0.07)"}`, background: newEmoji === e ? "rgba(224,90,43,0.1)" : "transparent", cursor: "pointer" }}>
                {e}
              </button>
            ))}
          </div>

          <input value={newName} onChange={(e) => setNewName(e.target.value)}
            placeholder="Collection name (e.g. DSA Prep, ML Course)"
            className="w-full rounded-lg px-4 py-3 text-sm outline-none mb-2"
            style={{ background: "#1a1a1f", border: "1px solid rgba(255,255,255,0.07)", color: "#f0efe8" }}
            onFocus={(e) => e.target.style.borderColor = "#e05a2b"}
            onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.07)"} />

          <input value={newDesc} onChange={(e) => setNewDesc(e.target.value)}
            placeholder="Description (optional)"
            className="w-full rounded-lg px-4 py-3 text-sm outline-none mb-3"
            style={{ background: "#1a1a1f", border: "1px solid rgba(255,255,255,0.07)", color: "#f0efe8" }}
            onFocus={(e) => e.target.style.borderColor = "#e05a2b"}
            onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.07)"} />

          <div className="flex gap-2">
            <button onClick={handleCreate} disabled={!newName.trim()}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white"
              style={{ background: "#e05a2b", border: "none", cursor: !newName.trim() ? "not-allowed" : "pointer", opacity: !newName.trim() ? 0.5 : 1 }}>
              Create Collection
            </button>
            <button onClick={() => setCreating(false)}
              className="px-4 py-2.5 rounded-xl text-sm"
              style={{ border: "1px solid rgba(255,255,255,0.07)", background: "transparent", color: "#9b9a96", cursor: "pointer" }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 rounded-full mx-auto animate-spin" style={{ border: "2px solid rgba(255,255,255,0.07)", borderTopColor: "#e05a2b" }} />
        </div>
      ) : collections.length === 0 ? (
        <div className="text-center py-12" style={{ background: "#131316", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16 }}>
          <p style={{ fontSize: 48, marginBottom: 12 }}>📚</p>
          <p className="text-base font-semibold mb-2">No collections yet</p>
          <p className="text-sm mb-4" style={{ color: "#5a5958" }}>Create your first collection to organize videos</p>
          <button onClick={() => setCreating(true)}
            className="px-6 py-2.5 rounded-xl text-sm font-bold text-white"
            style={{ background: "#e05a2b", border: "none", cursor: "pointer" }}>
            Create Collection
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {collections.map((col) => (
            <div key={col.id}
              className="p-4 rounded-xl cursor-pointer transition-all"
              style={{ background: "#131316", border: "1px solid rgba(255,255,255,0.07)" }}
              onMouseOver={(e) => e.currentTarget.style.borderColor = "#e05a2b"}
              onMouseOut={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"}
              onClick={() => handleOpen(col)}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>{col.emoji}</div>
              <p className="text-sm font-bold mb-1">{col.name}</p>
              {col.description && <p className="text-xs mb-2 truncate" style={{ color: "#9b9a96" }}>{col.description}</p>}
              <p className="text-xs font-mono" style={{ color: "#5a5958", fontFamily: "'DM Mono', monospace" }}>
                {col.item_count} videos
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}