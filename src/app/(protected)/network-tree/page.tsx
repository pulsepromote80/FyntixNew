"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
// @ts-ignore - react-d3-tree types may not be available
import Tree from "react-d3-tree";
import { toast } from "sonner";
import { PageLoader } from "@/components/common/PageLoader";

interface TreeNodeData {
  name: string;
  loginid: string;
  attributes: {
    sponsor?: string;
    rank?: string;
    downline?: number;
    package?: number;
    leaseAmount?: number;
    actDate?: string;
    regDate?: string;
    directBusiness?: number;
    TeamBusiness?: number;
    TotalTeam?: number;
    leftUsersTop?: number;
    rightUsersTop?: number;
    leftBusiness?: number;
    rightBusiness?: number;
    leftActiveMembers?: number;
    rightActiveMembers?: number;
    carryForward?: number;
    status?: number;
    position?: string;
    urid?: string;
    buttonLink?: string;
    isExists?: number;
  };
  children: TreeNodeData[];
  __rd3t?: {
    collapsed: boolean;
  };
}

const buildTreeData = (data: any[]): TreeNodeData[] => {
  if (!Array.isArray(data) || data.length === 0) return [];

  const unique = data.filter(
    (n, i, arr) => i === arr.findIndex((x) => x.Loginid === n.Loginid)
  );

  const nodeMap = new Map<string, TreeNodeData>();

  unique.forEach((node) => {
    const children = unique.filter(
      (child) => child.SponsorId === node.Loginid
    );
    nodeMap.set(node.Loginid, {
      name: node.Name,
      loginid: node.Loginid,
      attributes: {
        sponsor: node.SponsorId,
        rank: node.Urank,
        downline: children.length,
        package: node.Package,
        leaseAmount: node.LeaseAmount,
        actDate: node.TopupDate,
        regDate: node.RegDate,
        directBusiness: node.DirectBusiness,
        TeamBusiness: node.TeamBusiness,
        TotalTeam: node.TotalTeam,
        leftUsersTop: node.LeftUserstTop,
        rightUsersTop: node.RightUsersTop,
        leftBusiness: node.LeftBussiness,
        rightBusiness: node.RighttBussiness,
        leftActiveMembers: node.LeftActiveMember,
        rightActiveMembers: node.RightActiveMember,
        carryForward: node.CarryForwardBussiness,
        status: node.status,
        position: node.Position,
        urid: node.URID,
        buttonLink: node.ButtonLink,
        isExists: node.IsExists,
      },
      children: [],
    });
  });

  const roots: TreeNodeData[] = [];

  unique.forEach((node) => {
    if (node.SponsorId && nodeMap.has(node.SponsorId)) {
      const parent = nodeMap.get(node.SponsorId);
      const child = nodeMap.get(node.Loginid);
      if (parent && child) {
        parent.children.push(child);
      }
    } else {
      const nodeData = nodeMap.get(node.Loginid);
      if (nodeData) {
        roots.push(nodeData);
      }
    }
  });

  return roots;
};


const CustomNode = ({ nodeDatum, toggleNode }: { nodeDatum: any; toggleNode: () => void }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ top: 10, left: 0 });
  const nodeRef = useRef<HTMLDivElement>(null);

  const package_amount = Number(nodeDatum.attributes?.leaseAmount || 0);
  const isActive = package_amount > 0;
  const headerColor = isActive ? "bg-green-600 dark:bg-green-700" : "bg-red-600 dark:bg-red-700";

  const formatAmount = (amount: number | string) => {
    const num = parseFloat(String(amount)) || 0;
    return num.toLocaleString();
  };

  const handleMouseEnter = () => {
    if (nodeRef.current) {
      const rect = nodeRef.current.getBoundingClientRect();
      setTooltipPos({
        top: rect.top + window.scrollY - 60,
        left: rect.left + window.scrollX + 80,
      });
    }
    setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  const handleMouseEnterTooltip = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <g>
      <foreignObject x="-100" y="-95" width="200" height="150">
        <div
          style={{ pointerEvents: "auto" }}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-md dark:shadow-black/40 flex flex-col h-full overflow-hidden"
          ref={nodeRef}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onMouseMove={handleMouseEnter}
        >
          {/* Header */}
          <div className={`${headerColor} text-white text-[10px] px-3 py-1.5 flex justify-between items-center font-bold`}>
            <button
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                navigator.clipboard.writeText(nodeDatum.loginid);
                toast.success("ID Copied");
              }}
              className="hover:opacity-75"
            >
              ❐
            </button>
            <span>ID: {nodeDatum.loginid}</span>
            <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${isActive ? "bg-green-400 dark:bg-green-500" : "bg-red-400 dark:bg-red-500"}`}>
              {isActive ? "Active" : "Inactive"}
            </span>
          </div>

          {/* Body */}
          <div className="p-2 text-center flex-grow bg-white dark:bg-gray-800">
            <h3 className="text-[13px] font-bold truncate text-gray-800 dark:text-gray-100">
              {nodeDatum.name}
            </h3>
            <p className="text-[11px] text-gray-600 dark:text-gray-400 mt-0.5">
              License: ${formatAmount(package_amount)}
            </p>

            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
               Status: {nodeDatum.attributes?.status ?? 0}
            </p>
          </div>

          {/* Expand / Collapse Button */}
          {nodeDatum.children?.length > 0 && (
            <div className="px-2 pb-2 bg-white dark:bg-gray-800">
              <button
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  toggleNode();
                }}
                className={`w-full text-[10px] py-1.5 text-white rounded-lg transition-colors ${nodeDatum.__rd3t?.collapsed
                  ? "bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500"
                  : "bg-slate-500 hover:bg-slate-600 dark:bg-slate-600 dark:hover:bg-slate-500"
                  }`}
              >
                {nodeDatum.__rd3t?.collapsed ? "Expand +" : "Collapse −"}
              </button>
            </div>
          )}

          {/* Tooltip */}
          {showTooltip &&
            createPortal(
              <div
                style={{
                  position: "absolute",
                  top: tooltipPos.top,
                  left: tooltipPos.left,
                  width: 280,
                  backgroundColor: "#1e293b",
                  color: "white",
                  fontSize: "0.72rem",
                  borderRadius: "0.5rem",
                  padding: "0.75rem",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
                  zIndex: 9999,
                  lineHeight: "1.6",
                }}
              >
                <p className="font-semibold text-slate-300 mb-1 border-b border-slate-600 pb-1">
                  {nodeDatum.name} ({nodeDatum.loginid})
                </p>
                <p>Reg Date: <span className="text-white">{nodeDatum.attributes?.regDate || "—"}</span></p>
                <p>Act Date: <span className="text-white">{nodeDatum.attributes?.actDate || "—"}</span></p>
                <p>Rank: <span className="text-white">{nodeDatum.attributes?.rank || "N/A"}</span></p>
                <p>Direct Business: <span className="text-white">${formatAmount(nodeDatum.attributes?.directBusiness || 0)}</span></p>
                <p>Team Business: <span className="text-white">${formatAmount(nodeDatum.attributes?.TeamBusiness || 0)}</span></p>
                <p>Total Team: <span className="text-white">{nodeDatum.attributes?.TotalTeam || 0}</span></p>
              </div>,
              document.body
            )}
        </div>
      </foreignObject>
    </g>
  );
};


export default function NetworkTreeView() {
  const containerRef = useRef<HTMLDivElement>(null);

  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [treeData, setTreeData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNetworkTree = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/network-tree", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const result = await response.json();

        if (result.statusCode === 200 && result.data) {
          setTreeData(result.data);
        } else {
          setError(result.message || "Failed to load network tree");
        }
      } catch (err) {
        console.error(err);
        setError("Network error");
      } finally {
        setLoading(false);
      }
    };

    fetchNetworkTree();
  }, []);

  const formattedTreeData = useMemo(
    () => buildTreeData(treeData || []),
    [treeData]
  );

  useEffect(() => {
    const updateCenter = () => {
      if (!containerRef.current) return;
      setTranslate({
        x: containerRef.current.offsetWidth / 2,
        y: 100,
      });
    };
    updateCenter();
    window.addEventListener("resize", updateCenter);
    return () => window.removeEventListener("resize", updateCenter);
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-gray-950 flex flex-col">
        <div className="flex-grow flex items-center justify-center">
          <div className="text-red-500 text-center">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 flex flex-col">
      <div className="px-2 md:px-6 py-4 flex-grow">
        <div
          ref={containerRef}
          className="w-full h-[75vh] md:h-[85vh] bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-gray-700 overflow-hidden shadow-xl dark:shadow-black/50"
        >
          {formattedTreeData.length ? (
            <Tree

              data={formattedTreeData}
              translate={translate}
              orientation="vertical"
              renderCustomNodeElement={(rd3tProps) => (
                <CustomNode {...rd3tProps} />
              )}
              nodeSize={{ x: 240, y: 300 }}
              pathFunc="diagonal"
              separation={{ siblings: 1.3, nonSiblings: 1.6 }}
              zoomable
              draggable
              enableLegacyTransitions
              transitionDuration={500}
            />
          ) : (
            <div className="flex h-full items-center justify-center space-x-2">
              <PageLoader />
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        .rd3t-link {
          stroke: #cbd5e1 !important;
          stroke-width: 2px !important;
        }
        .dark .rd3t-link {
          stroke: #475569 !important;
        }
        .rd3t-label {
          display: none;
        }
        svg {
          touch-action: none;
        }
      `}</style>
    </div>
  );
}
