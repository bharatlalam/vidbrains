import React, { useState, useEffect, useRef } from "react";
import {
  createGroup, joinGroup, getMyGroups, getGroupDetails,
  sendGroupMessage, getGroupMessages, addVideoToGroup
} from "../utils/api";

const EMOJIS = ["👥", "🧠", "📚", "💻", "🎯", "🚀", "🔬", "🏆", "⚡", "🌍"];

export default function StudyGroupsView({ onBack, currentVideo }) {
  const [view, setView] = useState("list");
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeGroup, setActiveGroup] = useState(null);
  const [groupData, setGroupData] = useState(null);
  const [activeTab, setActiveTab] = useState("chat");
  const [newName, setNewName] = useState("");
  const [newEmoji, setNewEmoji] = useState("👥");
  const [nickname, setNickname] = useState(() => localStorage.getItem("vb_nickname") || "");
  const [joinCode, setJoinCode] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [lastMsgId, setLastMsgId] = useState(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);
  const pollRef = useRef(null);
  const mySessionId = localStorage.getItem("vb_session");

  useEffect(() => {
    loadGroups();
  }, []);

  useEffect(() => {
    if (activeGroup) {
      loadGroupData(activeGroup.id);
      pollRef.current = setInterval(() => pollMessages(activeGroup.id), 3000);
    }
    return () => clearInterval(pollRef.current);
  }, [activeGroup]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function loadGroups() {
    setLoading(true);
    try {
      const data = await getMyGroups();
      setGroups(data);
    } catch { setGroups([]); }
    finally { setLoading(false); }
  }

  async function loadGroupData(id) {
    try {
      const data = await getGroupDetails(id);
      setGroupData(data);
      setMessages(data.messages);
      if (data.messages.length) setLastMsgId(data.messages[data.messages.length - 1].id);
    } catch {}
  }

  async function pollMessages(id) {
    try {
      const newMsgs = await getGroupMessages({ groupId: id, after: lastMsgId });
      if (newMsgs.length) {
        setMessages((m) => [...m, ...newMsgs]);
        setLastMsgId(newMsgs[newMsgs.length - 1].id);
      }
    } catch {}
  }

  async function handleCreate() {
    if (!newName.trim() || !nickname.trim()) return;
    setError("");
    localStorage.setItem("vb_nickname", nickname);
    try {
      const group = await createGroup({ name: newName.trim(), emoji: newEmoji, nickname: nickname.trim() });
      setGroups((g) => [{ ...group, member_count: 1, video_count: 0, nickname: nickname.trim() }, ...g]);
      setActiveGroup(group);
      setView("group");
      setActiveTab("chat");
    } catch (e) {
      setError(e?.response?.data?.error || "Failed to create group.");
    }
  }

  async function handleJoin() {
    if (!joinCode.trim() || !nickname.trim()) return;
    setError("");
    localStorage.setItem("vb_nickname", nickname);
    try {
      const group = await joinGroup({ code: joinCode.trim(), nickname: nickname.trim() });
      await loadGroups();
      setActiveGroup(group);
      setView("group");
      setActiveTab("chat");
    } catch (e) {
      setError(e?.response?.data?.error || "Could not join. Check the code.");
    }
  }

  async function handleSend() {
    if (!message.trim() || !activeGroup || sending) return;
    const msg = message.trim();
    setMessage("");
    setSending(true);
    try {
      await sendGroupMessage({ groupId: activeGroup.id, message: msg });
      await pollMessages(activeGroup.id);
    } catch {} finally { setSending(false); }
  }

  async function handleAddCurrentVideo() {
    if (!currentVideo || !activeGroup) return;
    try {
      const result = await addVideoToGroup({
        groupId: activeGroup.id,
        shareId: currentVideo.shareId || "no-id",
        videoTitle: currentVideo.title,
        channel: currentVideo.channel,
        thumbnail: currentVideo.thumbnail,
      });
      if (result?.alreadyExists) {
        alert("Video already in group!");
      } else {
        await loadGroupData(activeGroup.id);
        setActiveTab("videos");
      }
    } catch {}
  }

  async function handleLeaveOrDelete() {
    if (!activeGroup) return;
    const isCreator = groupData?.group?.created_by === mySessionId;
    const confirm = window.confirm(isCreator ? "Delete this group for everyone?" : "Leave this group?");
    if (!confirm) return;
    try {
      await fetch(`https://vidbrain-server.onrender.com/api/groups/${activeGroup.id}?sessionId=${mySessionId}`, { method: "DELETE" });
      setActiveGroup(null);
      setGroupData(null);
      setView("list");
      await loadGroups();
    } catch {}
  }

  // ── GROUP DETAIL VIEW ──
  if (view === "group" && activeGroup) return (
    <div className="pt-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => { setView("list"); setActiveGroup(null); clearInterval(pollRef.current); }}
          className="text-xs px-3 py-1.5 rounded-lg"
          style={{ border: "1px solid rgba(255,255,255,0.07)", color: "#9b9a96", background: "transparent", cursor: "pointer" }}>
          ← Back
        </button>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span style={{ fontSize: 22 }}>{groupData?.group?.emoji || "👥"}</span>
          <div className="min-w-0">
            <p className="text-sm font-black truncate">{groupData?.group?.name || activeGroup.name}</p>
            <p className="text-xs font-mono" style={{ color: "#5a5958", fontFamily: "'DM Mono', monospace" }}>
              Code: <strong style={{ color: "#e05a2b", letterSpacing: "0.15em" }}>{groupData?.group?.code || activeGroup.code}</strong>
              {" · "}{groupData?.members?.length || 0} members
            </p>
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button onClick={() => { navigator.clipboard.writeText(groupData?.group?.code || activeGroup.code); alert("Code copied! Share with friends to invite them."); }}
            className="text-xs px-3 py-1.5 rounded-lg"
            style={{ border: "1px solid rgba(224,90,43,0.3)", color: "#e05a2b", background: "transparent", cursor: "pointer" }}>
            📋 Invite
          </button>
          <button onClick={handleLeaveOrDelete}
            className="text-xs px-3 py-1.5 rounded-lg"
            style={{ border: "1px solid rgba(255,255,255,0.07)", color: "#5a5958", background: "transparent", cursor: "pointer" }}>
            {groupData?.group?.created_by === mySessionId ? "🗑 Delete" : "← Leave"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl mb-4"
        style={{ background: "#131316", border: "1px solid rgba(255,255,255,0.07)" }}>
        {[
          ["chat", "💬 Chat"],
          ["videos", "📹 Videos"],
          ["members", "👥 Members"],
          ["leaderboard", "🏆 Board"],
        ].map(([id, label]) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all"
            style={{ background: activeTab === id ? "#222228" : "transparent", color: activeTab === id ? "#f0efe8" : "#9b9a96", border: "none", cursor: "pointer" }}>
            {label}
          </button>
        ))}
      </div>

      {/* CHAT TAB */}
      {activeTab === "chat" && (
        <div className="flex flex-col rounded-2xl overflow-hidden"
          style={{ background: "#131316", border: "1px solid rgba(255,255,255,0.07)", height: 440 }}>
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <p style={{ fontSize: 32, marginBottom: 8 }}>💬</p>
                <p className="text-sm font-semibold mb-1">No messages yet</p>
                <p className="text-xs" style={{ color: "#5a5958" }}>Start the conversation with your group!</p>
              </div>
            ) : messages.map((msg, i) => {
              const isMe = msg.session_id === mySessionId;
              return (
                <div key={i} style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start" }}>
                  <div style={{ maxWidth: "80%" }}>
                    {!isMe && (
                      <p className="text-xs mb-1 font-bold" style={{ color: "#e05a2b", paddingLeft: 4 }}>{msg.nickname}</p>
                    )}
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
                    <p className="text-xs mt-1" style={{ color: "#5a5958", textAlign: isMe ? "right" : "left", fontFamily: "'DM Mono', monospace", paddingLeft: isMe ? 0 : 4 }}>
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
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Type a message... (Enter to send)"
              className="flex-1 rounded-xl px-4 py-2.5 text-sm outline-none"
              style={{ background: "#1a1a1f", border: "1px solid rgba(255,255,255,0.07)", color: "#f0efe8" }}
              onFocus={(e) => e.target.style.borderColor = "#e05a2b"}
              onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.07)"} />
            <button onClick={handleSend} disabled={sending || !message.trim()}
              className="px-4 py-2.5 rounded-xl text-sm font-bold text-white"
              style={{ background: "#e05a2b", border: "none", cursor: sending || !message.trim() ? "not-allowed" : "pointer", opacity: sending || !message.trim() ? 0.5 : 1 }}>
              Send
            </button>
          </div>
        </div>
      )}

      {/* VIDEOS TAB */}
      {activeTab === "videos" && (
        <div>
          {currentVideo && (
            <button onClick={handleAddCurrentVideo}
              className="w-full flex items-center gap-3 p-3 rounded-xl mb-4 text-left transition-all"
              style={{ background: "rgba(224,90,43,0.08)", border: "1px solid rgba(224,90,43,0.3)", cursor: "pointer" }}>
              <div className="w-14 h-9 rounded-lg overflow-hidden flex-shrink-0" style={{ background: "#1a1a1f" }}>
                {currentVideo.thumbnail && <img src={currentVideo.thumbnail} alt="" className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate" style={{ color: "#e05a2b" }}>+ Share current video with group</p>
                <p className="text-xs truncate" style={{ color: "#9b9a96" }}>{currentVideo.title}</p>
              </div>
            </button>
          )}

          {!groupData?.videos?.length ? (
            <div className="text-center py-10" style={{ background: "#131316", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16 }}>
              <p style={{ fontSize: 32, marginBottom: 8 }}>📹</p>
              <p className="text-sm font-semibold mb-1">No videos yet</p>
              <p className="text-xs" style={{ color: "#5a5958" }}>Analyze a video and share it with the group!</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {groupData.videos.map((v, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: "#131316", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <div className="w-14 h-9 rounded-lg overflow-hidden flex-shrink-0" style={{ background: "#1a1a1f" }}>
                    {v.thumbnail && <img src={v.thumbnail} alt="" className="w-full h-full object-cover" onError={(e) => e.target.style.display = "none"} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate">{v.video_title}</p>
                    <p className="text-xs" style={{ color: "#9b9a96" }}>Added by {v.added_by}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MEMBERS TAB */}
      {activeTab === "members" && (
        <div className="flex flex-col gap-2">
          {groupData?.members?.map((m, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{ background: "#131316", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0"
                style={{ background: "#e05a2b", color: "white" }}>
                {m.nickname[0].toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">{m.nickname}</p>
                <p className="text-xs" style={{ color: "#5a5958" }}>
                  Joined {new Date(m.joined_at).toLocaleDateString()}
                </p>
              </div>
              {groupData.group.created_by === m.session_id && (
                <span className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(224,90,43,0.1)", color: "#e05a2b", border: "1px solid rgba(224,90,43,0.2)" }}>
                  Admin
                </span>
              )}
              {m.session_id === mySessionId && (
                <span className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(60,184,122,0.1)", color: "#3cb87a", border: "1px solid rgba(60,184,122,0.2)" }}>
                  You
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* LEADERBOARD TAB */}
      {activeTab === "leaderboard" && (
        <div>
          <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: "#5a5958" }}>
            🏆 Quiz Leaderboard
          </p>
          {!groupData?.leaderboard?.length ? (
            <div className="text-center py-10" style={{ background: "#131316", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16 }}>
              <p style={{ fontSize: 36, marginBottom: 8 }}>🏆</p>
              <p className="text-sm font-semibold mb-1">No scores yet</p>
              <p className="text-xs" style={{ color: "#5a5958" }}>Take quizzes on group videos to get on the board!</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {groupData.leaderboard.map((entry, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl"
                  style={{ background: "#131316", border: `1px solid ${i === 0 ? "rgba(224,90,43,0.3)" : "rgba(255,255,255,0.07)"}` }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0"
                    style={{ background: i === 0 ? "#e05a2b" : i === 1 ? "#4a9eff" : i === 2 ? "#3cb87a" : "#222228", color: "white" }}>
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{entry.nickname}
                      {entry.nickname === groupData.members.find((m) => m.session_id === mySessionId)?.nickname && (
                        <span className="ml-2 text-xs" style={{ color: "#3cb87a" }}>(You)</span>
                      )}
                    </p>
                    <p className="text-xs" style={{ color: "#9b9a96" }}>
                      {entry.quizzes_taken} quizzes · Best: {entry.best_score}pts
                    </p>
                  </div>
                  <p className="text-xl font-black" style={{ color: i === 0 ? "#e05a2b" : "#f0efe8" }}>
                    {entry.total_score}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );

  // ── CREATE / JOIN FORM ──
  if (view === "create" || view === "join") return (
    <div className="pt-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => { setView("list"); setError(""); }}
          className="text-xs px-3 py-1.5 rounded-lg"
          style={{ border: "1px solid rgba(255,255,255,0.07)", color: "#9b9a96", background: "transparent", cursor: "pointer" }}>
          ← Back
        </button>
        <h2 className="text-lg font-black" style={{ letterSpacing: "-0.5px" }}>
          {view === "create" ? "👥 Create Study Group" : "🔗 Join Study Group"}
        </h2>
      </div>

      <div className="p-5 rounded-2xl" style={{ background: "#131316", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex flex-col gap-4">

          {/* Nickname */}
          <div>
            <p className="text-xs font-semibold mb-2" style={{ color: "#5a5958" }}>Your nickname in this group</p>
            <input value={nickname} onChange={(e) => setNickname(e.target.value)}
              placeholder="e.g. Bharat, StudyKing, etc."
              className="w-full rounded-lg px-4 py-3 text-sm outline-none"
              style={{ background: "#1a1a1f", border: "1px solid rgba(255,255,255,0.07)", color: "#f0efe8" }}
              onFocus={(e) => e.target.style.borderColor = "#e05a2b"}
              onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.07)"} />
          </div>

          {view === "create" ? (
            <>
              {/* Emoji picker */}
              <div>
                <p className="text-xs font-semibold mb-2" style={{ color: "#5a5958" }}>Group emoji</p>
                <div className="flex flex-wrap gap-2">
                  {EMOJIS.map((e) => (
                    <button key={e} onClick={() => setNewEmoji(e)}
                      style={{ fontSize: 22, width: 40, height: 40, borderRadius: 10, border: `1px solid ${newEmoji === e ? "#e05a2b" : "rgba(255,255,255,0.07)"}`, background: newEmoji === e ? "rgba(224,90,43,0.1)" : "#1a1a1f", cursor: "pointer" }}>
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              {/* Group name */}
              <div>
                <p className="text-xs font-semibold mb-2" style={{ color: "#5a5958" }}>Group name</p>
                <input value={newName} onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. DSA Study Squad, ML Batch 2026"
                  className="w-full rounded-lg px-4 py-3 text-sm outline-none"
                  style={{ background: "#1a1a1f", border: "1px solid rgba(255,255,255,0.07)", color: "#f0efe8" }}
                  onFocus={(e) => e.target.style.borderColor = "#e05a2b"}
                  onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.07)"} />
              </div>
            </>
          ) : (
            <div>
              <p className="text-xs font-semibold mb-2" style={{ color: "#5a5958" }}>6-character group code</p>
              <input value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="e.g. AB12CD"
                maxLength={6}
                className="w-full rounded-lg px-4 py-3 text-sm outline-none text-center font-mono tracking-widest"
                style={{ background: "#1a1a1f", border: "1px solid rgba(255,255,255,0.07)", color: "#f0efe8", fontFamily: "'DM Mono', monospace", letterSpacing: "0.3em", fontSize: 18 }}
                onFocus={(e) => e.target.style.borderColor = "#e05a2b"}
                onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.07)"} />
            </div>
          )}

          {error && (
            <div className="px-4 py-3 rounded-xl text-sm"
              style={{ background: "rgba(224,90,43,0.1)", border: "1px solid rgba(224,90,43,0.3)", color: "#f07040" }}>
              {error}
            </div>
          )}

          <button onClick={view === "create" ? handleCreate : handleJoin}
            disabled={view === "create" ? !newName.trim() || !nickname.trim() : !joinCode.trim() || !nickname.trim()}
            className="w-full py-3 rounded-xl text-sm font-bold text-white"
            style={{ background: "#e05a2b", border: "none", cursor: "pointer", opacity: (view === "create" ? !newName.trim() || !nickname.trim() : !joinCode.trim() || !nickname.trim()) ? 0.5 : 1 }}>
            {view === "create" ? "🚀 Create Group" : "🔗 Join Group"}
          </button>
        </div>
      </div>
    </div>
  );

  // ── LIST VIEW ──
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
          <button onClick={() => { setView("join"); setError(""); }}
            className="text-xs font-semibold px-3 py-2 rounded-lg"
            style={{ border: "1px solid rgba(74,158,255,0.3)", background: "transparent", color: "#4a9eff", cursor: "pointer" }}>
            🔗 Join
          </button>
          <button onClick={() => { setView("create"); setError(""); }}
            className="text-xs font-bold px-4 py-2 rounded-lg"
            style={{ background: "#e05a2b", color: "white", border: "none", cursor: "pointer" }}>
            + Create
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 rounded-full mx-auto animate-spin"
            style={{ border: "2px solid rgba(255,255,255,0.07)", borderTopColor: "#e05a2b" }} />
        </div>
      ) : groups.length === 0 ? (
        <div className="text-center py-12 rounded-2xl"
          style={{ background: "#131316", border: "1px solid rgba(255,255,255,0.07)" }}>
          <p style={{ fontSize: 52, marginBottom: 12 }}>👥</p>
          <p className="text-base font-semibold mb-2">No groups yet</p>
          <p className="text-sm mb-6" style={{ color: "#5a5958" }}>
            Create a group and invite friends with a 6-character code
          </p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => { setView("create"); setError(""); }}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-white"
              style={{ background: "#e05a2b", border: "none", cursor: "pointer" }}>
              Create Group
            </button>
            <button onClick={() => { setView("join"); setError(""); }}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold"
              style={{ border: "1px solid rgba(255,255,255,0.07)", background: "transparent", color: "#9b9a96", cursor: "pointer" }}>
              Join with Code
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
              onClick={() => { setActiveGroup(group); setView("group"); setActiveTab("chat"); }}>
              <span style={{ fontSize: 32 }}>{group.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black">{group.name}</p>
                <p className="text-xs" style={{ color: "#9b9a96" }}>
                  {group.member_count} members · {group.video_count} videos · {group.message_count} messages
                </p>
                <p className="text-xs mt-0.5" style={{ color: "#5a5958" }}>
                  You: <span style={{ color: "#e05a2b" }}>{group.nickname}</span>
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-black font-mono" style={{ color: "#e05a2b", fontFamily: "'DM Mono', monospace", letterSpacing: "0.2em" }}>
                  {group.code}
                </p>
                <p className="text-xs" style={{ color: "#5a5958" }}>group code</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}