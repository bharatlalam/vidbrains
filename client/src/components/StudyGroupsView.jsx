import React, { useState, useEffect, useRef } from "react";
import { createGroup, joinGroup, getMyGroups, getGroupDetails, sendGroupMessage, getGroupMessages } from "../utils/api";

export default function StudyGroupsView({ onBack }) {
  const [view, setView] = useState("list"); // list | create | join | group
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeGroup, setActiveGroup] = useState(null);
  const [groupData, setGroupData] = useState(null);
  const [activeTab, setActiveTab] = useState("chat");

  // Form states
  const [newName, setNewName] = useState("");
  const [newEmoji, setNewEmoji] = useState("👥");
  const [nickname, setNickname] = useState(() => localStorage.getItem("vb_nickname") || "");
  const [joinCode, setJoinCode] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [lastMsgId, setLastMsgId] = useState(null);
  const messagesEndRef = useRef(null);
  const pollRef = useRef(null);

  useEffect(() => {
    getMyGroups().then(setGroups).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (activeGroup) {
      loadGroup(activeGroup.id);
      pollRef.current = setInterval(() => pollMessages(activeGroup.id), 3000);
    }
    return () => clearInterval(pollRef.current);
  }, [activeGroup]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function loadGroup(id) {
    const data = await getGroupDetails(id);
    setGroupData(data);
    setMessages(data.messages);
    if (data.messages.length) setLastMsgId(data.messages[data.messages.length - 1].id);
  }

  async function pollMessages(id) {
    const newMsgs = await getGroupMessages({ groupId: id, after: lastMsgId });
    if (newMsgs.length) {
      setMessages((m) => [...m, ...newMsgs]);
      setLastMsgId(newMsgs[newMsgs.length - 1].id);
    }
  }

  async function handleCreate() {
    if (!newName.trim() || !nickname.trim()) return;
    localStorage.setItem("vb_nickname", nickname);
    const group = await createGroup({ name: newName.trim(), emoji: newEmoji, nickname: nickname.trim() });
    setGroups((g) => [group, ...g]);
    setActiveGroup(group);
    setView("group");
  }

  async function handleJoin() {
    if (!joinCode.trim() || !nickname.trim()) return;
    localStorage.setItem("vb_nickname", nickname);
    try {
      const group = await joinGroup({ code: joinCode.trim(), nickname: nickname.trim() });
      setGroups((g) => [group, ...g]);
      setActiveGroup(group);
      setView("group");
    } catch (e) {
      alert(e?.response?.data?.error || "Could not join. Check the code.");
    }
  }

  async function handleSend() {
    if (!message.trim() || !activeGroup) return;
    const msg = message.trim();
    setMessage("");
    await sendGroupMessage({ groupId: activeGroup.id, message: msg });
    await pollMessages(activeGroup.id);
  }

  // GROUP VIEW
  if (view === "group" && activeGroup && groupData) return (
    <div className="pt-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => { setView("list"); setActiveGroup(null); clearInterval(pollRef.current); }}
          className="text-xs px-3 py-1.5 rounded-lg"
          style={{ border: "1px solid rgba(255,255,255,0.07)", color: "#9b9a96", background: "transparent", cursor: "pointer" }}>
          ← Back
        </button>
        <div className="flex items-center gap-2 flex-1">
          <span style={{ fontSize: 20 }}>{groupData.group.emoji}</span>
          <div>
            <p className="text-sm font-black">{groupData.group.name}</p>
            <p className="text-xs font-mono" style={{ color: "#5a5958", fontFamily: "'DM Mono', monospace" }}>
              Code: {groupData.group.code} · {groupData.members.length} members
            </p>
          </div>
        </div>
        <button onClick={() => { navigator.clipboard.writeText(groupData.group.code); alert("Code copied! Share with friends."); }}
          className="text-xs px-3 py-1.5 rounded-lg"
          style={{ border: "1px solid rgba(224,90,43,0.3)", color: "#e05a2b", background: "transparent", cursor: "pointer" }}>
          📋 Copy Code
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl mb-4"
        style={{ background: "#131316", border: "1px solid rgba(255,255,255,0.07)" }}>
        {[["chat", "💬 Chat"], ["members", "👥 Members"], ["leaderboard", "🏆 Leaderboard"]].map(([id, label]) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className="flex-1 py-2 rounded-lg text-xs font-semibold"
            style={{ background: activeTab === id ? "#222228" : "transparent", color: activeTab === id ? "#f0efe8" : "#9b9a96", border: "none", cursor: "pointer" }}>
            {label}
          </button>
        ))}
      </div>

      {/* Chat */}
      {activeTab === "chat" && (
        <div className="flex flex-col rounded-2xl overflow-hidden"
          style={{ background: "#131316", border: "1px solid rgba(255,255,255,0.07)", height: 420 }}>
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-xs" style={{ color: "#5a5958" }}>No messages yet. Start the conversation!</p>
              </div>
            ) : messages.map((msg, i) => {
              const isMe = msg.session_id === localStorage.getItem("vb_session");
              return (
                <div key={i} style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start" }}>
                  <div style={{ maxWidth: "80%" }}>
                    {!isMe && <p className="text-xs mb-1 font-semibold" style={{ color: "#e05a2b" }}>{msg.nickname}</p>}
                    <div className="text-sm px-4 py-2.5"
                      style={{
                        background: isMe ? "#e05a2b" : "#1a1a1f",
                        color: isMe ? "white" : "#f0efe8",
                        border: isMe ? "none" : "1px solid rgba(255,255,255,0.07)",
                        borderRadius: isMe ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                        lineHeight: 1.5,
                      }}>
                      {msg.message}
                    </div>
                    <p className="text-xs mt-1" style={{ color: "#5a5958", textAlign: isMe ? "right" : "left", fontFamily: "'DM Mono', monospace" }}>
                      {new Date(msg.sent_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
          <div className="flex gap-2 p-3" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
            <input value={message} onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSend(); }}
              placeholder="Type a message..."
              className="flex-1 rounded-lg px-3 py-2 text-sm outline-none"
              style={{ background: "#1a1a1f", border: "1px solid rgba(255,255,255,0.07)", color: "#f0efe8" }}
              onFocus={(e) => e.target.style.borderColor = "#e05a2b"}
              onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.07)"} />
            <button onClick={handleSend}
              className="px-4 py-2 rounded-lg text-sm font-bold text-white"
              style={{ background: "#e05a2b", border: "none", cursor: "pointer" }}>
              Send
            </button>
          </div>
        </div>
      )}

      {/* Members */}
      {activeTab === "members" && (
        <div className="flex flex-col gap-2">
          {groupData.members.map((m, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{ background: "#131316", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black"
                style={{ background: "#e05a2b", color: "white" }}>
                {m.nickname[0].toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold">{m.nickname}</p>
                <p className="text-xs" style={{ color: "#5a5958" }}>Joined {new Date(m.joined_at).toLocaleDateString()}</p>
              </div>
              {groupData.group.created_by === m.session_id && (
                <span className="ml-auto text-xs px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(224,90,43,0.1)", color: "#e05a2b", border: "1px solid rgba(224,90,43,0.2)" }}>
                  Admin
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Leaderboard */}
      {activeTab === "leaderboard" && (
        <div>
          <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: "#5a5958" }}>
            Quiz Leaderboard
          </p>
          {groupData.leaderboard.length === 0 ? (
            <div className="text-center py-8" style={{ background: "#131316", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16 }}>
              <p style={{ fontSize: 32, marginBottom: 8 }}>🏆</p>
              <p className="text-sm" style={{ color: "#5a5958" }}>No quiz scores yet. Take a quiz to get on the board!</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {groupData.leaderboard.map((entry, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl"
                  style={{ background: "#131316", border: `1px solid ${i === 0 ? "rgba(224,90,43,0.3)" : "rgba(255,255,255,0.07)"}` }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black"
                    style={{ background: i === 0 ? "#e05a2b" : i === 1 ? "#4a9eff" : i === 2 ? "#3cb87a" : "#222228", color: "white" }}>
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{entry.nickname}</p>
                    <p className="text-xs" style={{ color: "#9b9a96" }}>{entry.quizzes_taken} quizzes taken</p>
                  </div>
                  <p className="text-lg font-black" style={{ color: "#e05a2b" }}>{entry.total_score}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );

  // CREATE/JOIN FORMS
  if (view === "create" || view === "join") return (
    <div className="pt-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setView("list")} className="text-xs px-3 py-1.5 rounded-lg"
          style={{ border: "1px solid rgba(255,255,255,0.07)", color: "#9b9a96", background: "transparent", cursor: "pointer" }}>
          ← Back
        </button>
        <h2 className="text-lg font-black" style={{ letterSpacing: "-0.5px" }}>
          {view === "create" ? "👥 Create Study Group" : "🔗 Join Study Group"}
        </h2>
      </div>

      <div className="p-5 rounded-2xl" style={{ background: "#131316", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex flex-col gap-3">
          <div>
            <p className="text-xs font-semibold mb-2" style={{ color: "#5a5958" }}>Your nickname</p>
            <input value={nickname} onChange={(e) => setNickname(e.target.value)}
              placeholder="How should we call you?"
              className="w-full rounded-lg px-4 py-3 text-sm outline-none"
              style={{ background: "#1a1a1f", border: "1px solid rgba(255,255,255,0.07)", color: "#f0efe8" }}
              onFocus={(e) => e.target.style.borderColor = "#e05a2b"}
              onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.07)"} />
          </div>

          {view === "create" ? (
            <div>
              <p className="text-xs font-semibold mb-2" style={{ color: "#5a5958" }}>Group name</p>
              <input value={newName} onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. DSA Study Squad, ML Batch 2026"
                className="w-full rounded-lg px-4 py-3 text-sm outline-none"
                style={{ background: "#1a1a1f", border: "1px solid rgba(255,255,255,0.07)", color: "#f0efe8" }}
                onFocus={(e) => e.target.style.borderColor = "#e05a2b"}
                onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.07)"} />
            </div>
          ) : (
            <div>
              <p className="text-xs font-semibold mb-2" style={{ color: "#5a5958" }}>Group code</p>
              <input value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="Enter 6-character code"
                className="w-full rounded-lg px-4 py-3 text-sm outline-none font-mono"
                style={{ background: "#1a1a1f", border: "1px solid rgba(255,255,255,0.07)", color: "#f0efe8", fontFamily: "'DM Mono', monospace", letterSpacing: "0.2em" }}
                onFocus={(e) => e.target.style.borderColor = "#e05a2b"}
                onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.07)"} />
            </div>
          )}

          <button onClick={view === "create" ? handleCreate : handleJoin}
            className="w-full py-3 rounded-xl text-sm font-bold text-white mt-2"
            style={{ background: "#e05a2b", border: "none", cursor: "pointer" }}>
            {view === "create" ? "Create Group →" : "Join Group →"}
          </button>
        </div>
      </div>
    </div>
  );

  // LIST VIEW
  return (
    <div className="pt-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-xs px-3 py-1.5 rounded-lg"
            style={{ border: "1px solid rgba(255,255,255,0.07)", color: "#9b9a96", background: "transparent", cursor: "pointer" }}>
            ← Back
          </button>
          <div>
            <h2 className="text-lg font-black" style={{ letterSpacing: "-0.5px" }}>👥 Study Groups</h2>
            <p className="text-xs" style={{ color: "#9b9a96" }}>Learn together with friends</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setView("join")}
            className="text-xs font-semibold px-3 py-2 rounded-lg"
            style={{ border: "1px solid rgba(255,255,255,0.07)", background: "transparent", color: "#9b9a96", cursor: "pointer" }}>
            🔗 Join
          </button>
          <button onClick={() => setView("create")}
            className="text-xs font-bold px-4 py-2 rounded-lg"
            style={{ background: "#e05a2b", color: "white", border: "none", cursor: "pointer" }}>
            + Create
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 rounded-full mx-auto animate-spin" style={{ border: "2px solid rgba(255,255,255,0.07)", borderTopColor: "#e05a2b" }} />
        </div>
      ) : groups.length === 0 ? (
        <div className="text-center py-12" style={{ background: "#131316", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16 }}>
          <p style={{ fontSize: 48, marginBottom: 12 }}>👥</p>
          <p className="text-base font-semibold mb-2">No groups yet</p>
          <p className="text-sm mb-6" style={{ color: "#5a5958" }}>Create a group or join with a code from a friend</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => setView("create")}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-white"
              style={{ background: "#e05a2b", border: "none", cursor: "pointer" }}>
              Create Group
            </button>
            <button onClick={() => setView("join")}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold"
              style={{ border: "1px solid rgba(255,255,255,0.07)", background: "transparent", color: "#9b9a96", cursor: "pointer" }}>
              Join Group
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {groups.map((group) => (
            <div key={group.id}
              className="flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all"
              style={{ background: "#131316", border: "1px solid rgba(255,255,255,0.07)" }}
              onMouseOver={(e) => e.currentTarget.style.borderColor = "#e05a2b"}
              onMouseOut={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"}
              onClick={() => { setActiveGroup(group); setView("group"); }}>
              <div style={{ fontSize: 32 }}>{group.emoji}</div>
              <div className="flex-1">
                <p className="text-sm font-black">{group.name}</p>
                <p className="text-xs" style={{ color: "#9b9a96" }}>
                  {group.member_count} members · {group.video_count} videos
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-mono font-bold" style={{ color: "#e05a2b", fontFamily: "'DM Mono', monospace", letterSpacing: "0.15em" }}>{group.code}</p>
                <p className="text-xs" style={{ color: "#5a5958" }}>Your code</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}