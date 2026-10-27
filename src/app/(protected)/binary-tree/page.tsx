"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { PageLoader } from "@/components/common/PageLoader";

interface TreeNode {
  index: number;
  id: string;
  username: string;
  active: boolean;
  binaryColor: any;
  leftBV: number;
  rightBV: number;
  leftActive: number;
  rightActive: number;
  carryForward: number;
  sponsor: any;
  package: number;
  actDate: any;
  buttonLink: any;
  position: any;
  level: any;
  isExists: number;
  isEmpty: boolean;
  left: TreeNode | null;
  right: TreeNode | null;
}

const buildTreeFromApi = (apiNodes: any[]): TreeNode | null => {

  if (!apiNodes || apiNodes.length === 0) return null;

  // Create node list
  const nodes: TreeNode[] = apiNodes.map((apiNode: any, index: number) => ({
    index,
    id:
      apiNode.IsExists === 1
        ? apiNode.AuthLogin
        : `EMPTY_${index}`,
    username: apiNode.name || "Available Slot",

    active: apiNode.binarycolorimg?.includes("green"),

    binaryColor: apiNode.binarycolorimg,

    leftBV: Number(apiNode.LeftBussiness || 0),
    rightBV: Number(apiNode.RighttBussiness || 0),
    leftActive: Number(apiNode.LeftActiveMember || 0),
    rightActive: Number(apiNode.RightActiveMember || 0),
    carryForward: Number(apiNode.CarryForwardBussiness || 0),

    sponsor: apiNode.SponosorDetails,
    package: Number(apiNode.Package || 0),
    actDate: apiNode.ActDate,

    buttonLink: apiNode.ButtonLink,

    position: apiNode.Position,
    level: apiNode.level,

    isExists: apiNode.IsExists,
    isEmpty: apiNode.IsExists === 0,

    left: null,
    right: null,
  }));

  // Build tree using array index
  for (let i = 1; i < nodes.length; i++) {
    const parentIndex = Math.floor((i - 1) / 2);

    if (!nodes[parentIndex]) continue;

    if (i % 2 === 1) {
      nodes[parentIndex].left = nodes[i] || null;
    } else {
      nodes[parentIndex].right = nodes[i] || null;
    }
  }

  return nodes[0] || null;
};

// ─── Tooltip Component ──────────────────────────────────────────────────────
function Tooltip({ node, x, y }: { node: TreeNode; x: number; y: number }) {
  const [pos, setPos] = useState({ left: x + 16, top: Math.max(y - 10, 20) });

  useEffect(() => {
    const tooltipWidth = typeof window !== "undefined" && window.innerWidth < 640 ? 220 : 280;
    const maxLeft = typeof window !== "undefined" ? window.innerWidth - tooltipWidth - 8 : x + 16;
    setPos({
      left: Math.min(x + 16, Math.max(8, maxLeft)),
      top: Math.max(y - 10, 20),
    });
  }, [x, y]);

  return (
    <div
      style={{
        position: "fixed",
        left: pos.left,
        top: pos.top,
        zIndex: 9999,
        pointerEvents: "none",
        transform: "translateY(-50%)",
      }}
    >
      <div className="bg-gray-900/95 dark:bg-gray-900/95 backdrop-blur-sm border border-gray-700 dark:border-gray-700 rounded-xl shadow-2xl p-3 sm:p-4 min-w-[200px] sm:min-w-[260px] max-w-[80vw] sm:max-w-none bg-white/95 border-gray-200">
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <span className={`w-2.5 h-2.5 rounded-full ${node.active ? "bg-green-500 shadow-md shadow-green-500/50" : "bg-red-500"}`} />
          <span className="text-gray-800 dark:text-gray-200 text-xs sm:text-sm font-bold">{node.id}</span>
        </div>
        <div className="text-gray-700 dark:text-gray-300 font-medium text-sm sm:text-base mb-2">{node.username}</div>
        <div className="h-px bg-gray-200 dark:bg-gray-700 my-2" />
        <div className="grid grid-cols-2 gap-x-3 sm:gap-x-4 gap-y-2 text-[11px] sm:text-xs">
          <div>
            <div className="text-gray-500 dark:text-gray-400 text-[9px] sm:text-[10px] uppercase tracking-wider">LEFT BUSS.</div>
            <div className="text-green-600 dark:text-green-400 font-bold">${node.leftBV?.toLocaleString() || 0}</div>
          </div>
          <div>
            <div className="text-gray-500 dark:text-gray-400 text-[9px] sm:text-[10px] uppercase tracking-wider">RIGHT BUSS.</div>
            <div className="text-cyan-600 dark:text-cyan-400 font-bold">${node.rightBV?.toLocaleString() || 0}</div>
          </div>
          <div>
            <div className="text-gray-500 dark:text-gray-400 text-[9px] sm:text-[10px] uppercase tracking-wider">LEFT ACTIVE</div>
            <div className="text-green-600 dark:text-green-400 font-bold">{node.leftActive}</div>
          </div>
          <div>
            <div className="text-gray-500 dark:text-gray-400 text-[9px] sm:text-[10px] uppercase tracking-wider">RIGHT ACTIVE</div>
            <div className="text-cyan-600 dark:text-cyan-400 font-bold">{node.rightActive}</div>
          </div>
          <div className="col-span-2">
            <div className="text-gray-500 dark:text-gray-400 text-[9px] sm:text-[10px] uppercase tracking-wider">C/F BUSS.</div>
            <div className="text-amber-600 dark:text-amber-400 font-bold">${node.carryForward?.toLocaleString() || 0}</div>
          </div>
          <div className="col-span-2">
            <div className="text-gray-500 dark:text-gray-400 text-[9px] sm:text-[10px] uppercase tracking-wider">SPONSOR</div>
            <div className="text-gray-600 dark:text-gray-300 text-[11px] sm:text-xs truncate">{node.sponsor || "—"}</div>
          </div>
          <div className="col-span-2">
            <div className="text-gray-500 dark:text-gray-400 text-[9px] sm:text-[10px] uppercase tracking-wider">PACKAGE</div>
            <div className="text-gray-700 dark:text-gray-200">${node.package}</div>
          </div>
          <div className="col-span-2">
            <div className="text-gray-500 dark:text-gray-400 text-[9px] sm:text-[10px] uppercase tracking-wider">ACT. DATE</div>
            <div className="text-gray-600 dark:text-gray-300 text-[11px] sm:text-xs">{node.actDate}</div>
          </div>
        </div>
        {(node.left || node.right) && (
          <>
            <div className="h-px bg-gray-200 dark:bg-gray-700 my-2" />
            <div className="grid grid-cols-2 gap-2 text-[11px] sm:text-xs">
              <div>
                <div className="text-gray-500 dark:text-gray-400 text-[9px] sm:text-[10px] uppercase">LEFT ID</div>
                <div className="text-gray-600 dark:text-gray-300 truncate">{node.left ? node.left.id : "—"}</div>
              </div>
              <div>
                <div className="text-gray-500 dark:text-gray-400 text-[9px] sm:text-[10px] uppercase">RIGHT ID</div>
                <div className="text-gray-600 dark:text-gray-300 truncate">{node.right ? node.right.id : "—"}</div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Node Component ─────────────────────────────────────────────────────────
function TreeNode({ node, onTooltip, onHideTooltip, onSignup, onFocus, depth, isRoot = false }: {
  node: TreeNode;
  onTooltip: (node: TreeNode, x: number, y: number) => void;
  onHideTooltip: () => void;
  onSignup: (parentId: string, side: string) => void;
  onFocus: (node: TreeNode) => void;
  depth: number;
  isRoot?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = (e: React.MouseEvent) => {
    if (node.isEmpty && !isRoot) return;
    setHovered(true);
    onTooltip(node, e.clientX, e.clientY);
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (node.isEmpty && !isRoot) return;
    onTooltip(node, e.clientX, e.clientY);
  };
  const handleMouseLeave = () => {
    setHovered(false);
    onHideTooltip();
  };

  return (
    <div className="relative flex flex-col items-center">
      <div
        ref={nodeRef}
        className={`
          relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24
          bg-white/90 dark:bg-gray-800/80
          backdrop-blur-sm rounded-xl flex flex-col items-center justify-center
          transition-all duration-200 cursor-pointer
          border ${node.active
            ? "border-gray-300 dark:border-gray-600"
            : "border-red-400/50 dark:border-red-500/30"
          }
          ${hovered ? "scale-105 -translate-y-1 shadow-2xl z-20" : "shadow-lg shadow-gray-200 dark:shadow-gray-900"}
        `}
        style={{
          borderColor: hovered ? (node.active ? "#10b981" : "#ef4444") : undefined,
          boxShadow: hovered ? `0 0 20px ${node.active ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.2)"}` : undefined,
        }}
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={() => onFocus(node)}
      >
        {/* Avatar */}
        <div className="relative w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center">
          <div
            className="absolute inset-0 rounded-full border-2 opacity-60 animate-pulse"
            style={{ borderColor: node.active ? "#10b981" : "#ef4444" }}
          />
          <div
            className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: node.active ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)" }}
          >
            <svg width="20" height="20" viewBox="0 0 32 32" fill="none" className="sm:w-6 sm:h-6 md:w-7 md:h-7">
              <circle cx="16" cy="10" r="7" fill={node.active ? "#10b981" : "#ef4444"} opacity="0.9" />
              <path
                d="M4 28c0-6.627 5.373-12 12-12s12 5.373 12 12"
                stroke={node.active ? "#10b981" : "#ef4444"}
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div
            className={`absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border-2
              border-white dark:border-gray-800
              ${node.active ? "bg-green-500 shadow-md shadow-green-500/50" : "bg-red-500"}`}
          />
        </div>
        <div className="text-gray-500 dark:text-gray-400 text-[9px] sm:text-[10px] font-medium mt-1 max-w-[56px] sm:max-w-[70px] md:max-w-[80px] truncate px-1">
          {node.id}
        </div>
      </div>

      {/* Children Container */}
      <div className="relative flex gap-2 sm:gap-4 md:gap-6 pt-4 sm:pt-6 md:pt-7 mt-1 before:content-[''] before:absolute before:top-0 before:left-1/2 before:-translate-x-1/2 before:w-px before:h-4 sm:before:h-6 md:before:h-7 before:bg-gradient-to-b before:from-gray-300 before:to-gray-200 dark:before:from-gray-600 dark:before:to-gray-700">
        {node.left ? (
          node.left.isEmpty ? (
            <EmptySlot side="left" parentId={node.id} onSignup={onSignup} />
          ) : (
            <TreeNode node={node.left} onTooltip={onTooltip} onHideTooltip={onHideTooltip} onSignup={onSignup} onFocus={onFocus} depth={depth + 1} />
          )
        ) : (
          depth < 3 && <EmptySlot side="left" parentId={node.id} onSignup={onSignup} />
        )}
        {node.right ? (
          node.right.isEmpty ? (
            <EmptySlot side="right" parentId={node.id} onSignup={onSignup} />
          ) : (
            <TreeNode node={node.right} onTooltip={onTooltip} onHideTooltip={onHideTooltip} onSignup={onSignup} onFocus={onFocus} depth={depth + 1} />
          )
        ) : (
          depth < 3 && <EmptySlot side="right" parentId={node.id} onSignup={onSignup} />
        )}
      </div>
    </div>
  );
}

// ─── Empty Slot ─────────────────────────────────────────────────────────────
function EmptySlot({ side, parentId, onSignup }: { side: string; parentId: string; onSignup: (parentId: string, side: string) => void }) {
  const [hov, setHov] = useState(false);
  return (
    <div className="relative flex flex-col items-center">
      <div
        className={`
          w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 border border-dashed rounded-xl flex items-center justify-center
          transition-all duration-200 cursor-pointer
          ${hov
            ? "border-cyan-500/60 bg-cyan-50/80 dark:bg-gray-800/60 shadow-lg shadow-cyan-500/20"
            : "border-gray-300 dark:border-gray-600 bg-gray-50/60 dark:bg-gray-800/40"
          }
        `}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        onClick={() => onSignup(parentId, side)}
      >
        <div className="flex flex-col items-center gap-1 text-gray-400 dark:text-gray-400">
          {hov ? (
            <div className="flex flex-col items-center gap-1 text-cyan-600 dark:text-cyan-400">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="sm:w-5 sm:h-5">
                <path d="M12 5v14M5 12h14" />
              </svg>
              <span className="text-[9px] sm:text-[11px] font-bold tracking-wide">{side.toUpperCase()} JOIN</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="sm:w-4 sm:h-4">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 8v4M12 16h.01" />
              </svg>
              <span className="text-[8px] sm:text-[10px]">Available</span>
            </div>
          )}
        </div>
        <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 text-[9px] sm:text-[10px] font-bold text-gray-400 dark:text-gray-500">{side?.[0]?.toUpperCase() || ''}</div>
      </div>
    </div>
  );
}

// ─── Search Modal ───────────────────────────────────────────────────────────
function SearchModal({ onClose, onSearch }: { onClose: () => void; onSearch: (query: string) => void }) {
  const [val, setVal] = useState("");
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 w-full max-w-md shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4">Search User</h3>
        <input
          className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 transition-colors"
          placeholder="Enter User ID or Username..."
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSearch(val)}
          autoFocus
        />
        <div className="flex justify-end gap-3 mt-6">
          <button
            className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded-lg bg-cyan-600 text-white font-semibold hover:bg-cyan-500 transition"
            onClick={() => onSearch(val)}
          >
            Search
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Signup Modal ───────────────────────────────────────────────────────────
function SignupModal({ parentId, side, onClose }: { parentId: string; side: string; onClose: () => void }) {
  const positionCode = side === "left" ? "L" : "R";
  const link = `https://kaliki-user.vercel.app/register?RefID=${parentId}&Position=${positionCode}`;
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(link).catch(() => { });
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 w-full max-w-md shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 mb-2">
          <span className={`px-2 py-1 text-xs font-bold rounded ${side === "left" ? "bg-green-500/20 text-green-600 dark:text-green-400" : "bg-cyan-500/20 text-cyan-600 dark:text-cyan-400"}`}>
            {positionCode}
          </span>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Signup Link</h3>
        </div>
        <div className="text-gray-600 dark:text-gray-300 text-sm mb-4">
          Referral under <strong className="text-gray-900 dark:text-white">{parentId}</strong>
        </div>
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
          <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 truncate flex-1">{link}</span>
          <button
            className={`px-3 py-1 rounded-md text-sm font-medium transition shrink-0 ${copied
              ? "bg-green-600 text-white"
              : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
            onClick={copy}
          >
            {copied ? "✓ Copied" : "Copy"}
          </button>
        </div>
        <div className="flex justify-end mt-6">
          <button className="px-4 py-2 rounded-lg bg-cyan-600 text-white font-semibold hover:bg-cyan-500 transition" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Stats Bar ──────────────────────────────────────────────────────────────
function StatsBar({ root }: { root: TreeNode | null }) {
  if (!root) return null;
  const leftCount = root.leftActive || 0;
  const rightCount = root.rightActive || 0;
  const rootActive = root.active ? 1 : 0;
  const total = leftCount + rightCount + rootActive;
  const leftPct = total > 0 ? Math.round((leftCount / total) * 100) : 50;

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 md:gap-4 px-3 sm:px-4 md:px-6 py-3 sm:py-4 mb-8">
      {/* LEFT CARD */}
      <div className="flex items-center gap-2 sm:gap-3 bg-white/80 dark:bg-gray-800/50 shadow-sm dark:shadow-none border-l-2 border-green-500 rounded-xl px-3 sm:px-4 md:px-5 py-2 sm:py-3 min-w-[110px] sm:min-w-[130px] md:min-w-[140px]">
        <div className="text-gray-400 text-sm">◀</div>
        <div>
          <div className="text-[9px] sm:text-[10px] font-semibold tracking-wider text-gray-500 dark:text-gray-400 uppercase">LEFT USERS</div>
          <div className="text-xl sm:text-2xl md:text-3xl font-bold text-green-500 dark:text-green-400">{leftCount}</div>
        </div>
      </div>

      {/* CENTER BALANCE */}
      <div className="text-center flex-1 min-w-[140px] sm:min-w-[160px] max-w-[220px] sm:max-w-[280px]">
        <div className="text-[9px] sm:text-[10px] font-semibold tracking-wider text-gray-500 dark:text-gray-400 uppercase mb-1">TOTAL ACTIVE USERS</div>
        <div className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-2">{total}</div>
        <div className="flex h-1.5 rounded-full overflow-hidden gap-0.5 bg-gray-200 dark:bg-gray-700">
          <div className="h-full bg-[#235ae3] transition-all duration-500" style={{ width: `${leftPct}%` }} />
          <div className="h-full bg-[#235ae3] transition-all duration-500" style={{ width: `${100 - leftPct}%` }} />
        </div>
        <div className="flex justify-between text-[11px] sm:text-xs font-medium mt-1">
          <span className="text-green-500 dark:text-green-400">Left: {leftCount}</span>
          <span className="text-cyan-500 dark:text-cyan-400">Right: {rightCount}</span>
        </div>
      </div>

      {/* RIGHT CARD */}
      <div className="flex items-center gap-2 sm:gap-3 bg-white/80 dark:bg-gray-800/50 shadow-sm dark:shadow-none border-r-2 border-cyan-500 rounded-xl px-3 sm:px-4 md:px-5 py-2 sm:py-3 min-w-[110px] sm:min-w-[130px] md:min-w-[140px]">
        <div>
          <div className="text-[9px] sm:text-[10px] font-semibold tracking-wider text-gray-500 dark:text-gray-400 uppercase">RIGHT USERS</div>
          <div className="text-xl sm:text-2xl md:text-3xl font-bold text-cyan-500 dark:text-cyan-400">{rightCount}</div>
        </div>
        <div className="text-gray-400 text-sm">▶</div>
      </div>
    </div>
  );
}

// ─── Loading / Error ────────────────────────────────────────────────────────
function LoadingSpinner() {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <PageLoader />
    </div>
  );
}

// ─── Main App ───────────────────────────────────────────────────────────────
export default function BinaryTree() {
  const [tooltip, setTooltip] = useState<{ node: TreeNode; x: number; y: number } | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [signupModal, setSignupModal] = useState<{ parentId: string; side: string } | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [treeData, setTreeData] = useState<TreeNode | null>(null);
  const [focusedNode, setFocusedNode] = useState<TreeNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loginId = typeof window !== "undefined" ? localStorage.getItem("authLogin") : null;

  const fetchTreeByURID = async (loginid: string | null, saveHistory = true) => {
    try {
      setLoading(true);
      setError(null);
      if (saveHistory && treeData?.id) {
        setHistory((prev) => [...prev, treeData.id]);
      }
      const response = await fetch("/api/binary-tree", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ loginid }),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const result = await response.json();
      if (result.statusCode === 200 && result.data) {
        const builtTree = buildTreeFromApi(result.data);
        if (builtTree) {
          setTreeData(builtTree);
          setTooltip(null);
        } else {
          setError("Could not build tree");
        }
      } else {
        setError(result.message || "Failed to load tree");
      }
    } catch (err) {
      console.error(err);
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!loginId) {
      setError("Missing AuthLogin. Please login first.");
      setLoading(false);
      return;
    }
    fetchTreeByURID(loginId);
  }, [loginId]);

  const handleTooltip = useCallback((node: TreeNode, x: number, y: number) => setTooltip({ node, x, y }), []);
  const handleHideTooltip = useCallback(() => setTooltip(null), []);
  const handleSignup = useCallback((parentId: string, side: string) => setSignupModal({ parentId, side }), []);

  const handleFocus = useCallback(
    (node: TreeNode) => {
      if (!node?.id) return;
      fetchTreeByURID(node.id);
    },
    [treeData]
  );

  const handleSearch = useCallback(
    (query: string) => {
      if (!query.trim() || !treeData) return;
      const searchInTree = (node: TreeNode | null, term: string): TreeNode | null => {
        if (!node) return null;
        if (
          node.id.toLowerCase().includes(term.toLowerCase()) ||
          node.username.toLowerCase().includes(term.toLowerCase())
        )
          return node;
        return searchInTree(node.left, term) || searchInTree(node.right, term);
      };
      const found = searchInTree(treeData, query);
      if (found) {
        setFocusedNode(found);
        handleFocus(found);
      } else {
        alert("User not found in tree");
      }
    },
    [treeData, handleFocus]
  );

  if (loading) return <LoadingSpinner />;
  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 text-red-500 dark:text-red-400 text-base sm:text-lg text-center px-4">
        {error}
      </div>
    );
  if (!treeData)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 text-gray-500 dark:text-gray-400 text-center px-4">
        No tree data available
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 text-gray-800 dark:text-gray-200">
      {/* Header */}
      <div className="sticky top-0 z-25 flex flex-wrap items-center justify-between gap-2 sm:gap-3 px-3 sm:px-4 md:px-6 py-2 sm:py-3 bg-white/90 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg flex items-center justify-center shadow-md">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="sm:w-5 sm:h-5">
              <path d="M12 3L3 8.5V15.5L12 21L21 15.5V8.5L12 3Z" stroke="#06b6d4" strokeWidth="1.5" fill="none" />
              <path d="M12 3v18M3 8.5l9 6 9-6" stroke="#06b6d4" strokeWidth="1.2" opacity="0.5" />
            </svg>
          </div>
          <span className="text-lg sm:text-xl font-bold tracking-wide text-gray-900 dark:text-white">
            Tree<span className="text-cyan-500">View</span>
          </span>
        </div>

        <div className="order-3 sm:order-none w-full sm:w-auto sm:flex-1 sm:max-w-md">
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-1.5">
            <input
              className="flex-1 min-w-0 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none"
              placeholder="Search User ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchQuery.trim()) {
                  handleSearch(searchQuery);
                  setSearchQuery("");
                }
              }}
            />
            <button
              className="bg-[#235ae3] text-white text-xs font-bold px-3 py-1 rounded-md transition shrink-0"
              onClick={() => {
                if (searchQuery.trim()) {
                  handleSearch(searchQuery);
                  setSearchQuery("");
                } else {
                  setSearchOpen(true);
                }
              }}
            >
              Search
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {history.length > 0 && (
            <button
              className="px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:border-cyan-500 transition"
              onClick={async () => {
                const prevHistory = [...history];
                const lastId = prevHistory.pop();
                setHistory(prevHistory);
                if (lastId) await fetchTreeByURID(lastId, false);
              }}
            >
              ← Back
            </button>
          )}
          <div className="flex items-center gap-2 sm:gap-3 text-[11px] sm:text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 shadow-sm" /> Active</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> Inactive</span>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <StatsBar root={treeData} />

      {/* Tree Canvas */}
      <div className="overflow-auto px-2 sm:px-4 pb-10 sm:pb-16 min-h-[calc(100vh-200px)]">
        <div className="flex justify-center min-w-max">
          <TreeNode
            node={treeData}
            isRoot={true}
            onTooltip={handleTooltip}
            onHideTooltip={handleHideTooltip}
            onSignup={handleSignup}
            onFocus={handleFocus}
            depth={0}
          />
        </div>
      </div>

      {/* Tooltip Portal */}
      {tooltip && createPortal(<Tooltip node={tooltip.node} x={tooltip.x} y={tooltip.y} />, document.body)}

      {/* Modals */}
      {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} onSearch={(q) => { handleSearch(q); setSearchOpen(false); }} />}
      {signupModal && <SignupModal parentId={signupModal.parentId} side={signupModal.side} onClose={() => setSignupModal(null)} />}
    </div>
  );
}
