"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Tree from "react-d3-tree";
import type { CustomNodeElementProps } from "react-d3-tree";
import { toast } from "sonner";
import { PageLoader } from "@/components/common/PageLoader";

interface TreeNodeData {
  name: string;
  attributes: Record<string, string | number | boolean>;
  children?: TreeNodeData[];
}

type ApiNetworkNode = Record<string, unknown>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readText(record: ApiNetworkNode, key: string): string {
  const value = record[key];
  return typeof value === "string" ? value : "";
}

function readNumber(record: ApiNetworkNode, key: string): number {
  const value = record[key];
  if (typeof value !== "number" && typeof value !== "string") return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

const buildTreeData = (value: unknown): TreeNodeData[] => {
  if (!Array.isArray(value)) return [];
  const unique = value
    .filter(isRecord)
    .filter((node) => readText(node, "Loginid"));
  const nodeMap = new Map<string, TreeNodeData>();

  unique.forEach((node) => {
    const loginid = readText(node, "Loginid");
    const children = unique.filter((child) => readText(child, "SponsorId") === loginid);
    nodeMap.set(loginid, {
      name: readText(node, "Name") || loginid,
      attributes: {
        loginid,
        sponsor: readText(node, "SponsorId"),
        rank: readText(node, "Urank"),
        downline: children.length,
        package: readNumber(node, "Package"),
        leaseAmount: readNumber(node, "LeaseAmount"),
        actDate: readText(node, "TopupDate"),
        regDate: readText(node, "RegDate"),
        directBusiness: readNumber(node, "DirectBusiness"),
        TeamBusiness: readNumber(node, "TeamBusiness"),
        TotalTeam: readNumber(node, "TotalTeam"),
        leftUsersTop: readNumber(node, "LeftUserstTop"),
        rightUsersTop: readNumber(node, "RightUsersTop"),
        leftBusiness: readNumber(node, "LeftBussiness"),
        rightBusiness: readNumber(node, "RighttBussiness"),
        leftActiveMembers: readNumber(node, "LeftActiveMember"),
        rightActiveMembers: readNumber(node, "RightActiveMember"),
        carryForward: readNumber(node, "CarryForwardBussiness"),
        status: readNumber(node, "status"),
        position: readText(node, "Position"),
        urid: readText(node, "URID"),
        buttonLink: readText(node, "ButtonLink"),
        isExists: readNumber(node, "IsExists"),
      },
      children: [],
    });
  });

  const roots: TreeNodeData[] = [];

  unique.forEach((node) => {
    const loginid = readText(node, "Loginid");
    const sponsorId = readText(node, "SponsorId");
    if (sponsorId && nodeMap.has(sponsorId)) {
      const parent = nodeMap.get(sponsorId);
      const child = nodeMap.get(loginid);
      if (parent && child) parent.children?.push(child);
    } else {
      const nodeData = nodeMap.get(loginid);
      if (nodeData) roots.push(nodeData);
    }
  });

  return roots;
};

const CustomNode = ({ nodeDatum, toggleNode }: CustomNodeElementProps) => {
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
                navigator.clipboard.writeText(String(nodeDatum.attributes?.loginid ?? ""));
                toast.success("ID Copied");
              }}
              className="hover:opacity-75"
            >
              ❐
            </button>
            <span>ID: {nodeDatum.attributes?.loginid}</span>
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
          {(nodeDatum.children?.length ?? 0) > 0 && (
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
                  {nodeDatum.name} ({nodeDatum.attributes?.loginid})
                </p>
                <p>Reg Date: <span className="text-white">{nodeDatum.attributes?.regDate || "—"}</span></p>
                <p>Act Date: <span className="text-white">{nodeDatum.attributes?.actDate || "—"}</span></p>
                <p>Rank: <span className="text-white">{nodeDatum.attributes?.rank || "N/A"}</span></p>
                <p>Direct Business: <span className="text-white">${formatAmount(String(nodeDatum.attributes?.directBusiness || 0))}</span></p>
                <p>Team Business: <span className="text-white">${formatAmount(String(nodeDatum.attributes?.TeamBusiness || 0))}</span></p>
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
  const [treeData, setTreeData] = useState<ApiNetworkNode[]>([]);
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
        const result: unknown = await response.json();

        if (isRecord(result) && result.statusCode === 200 && Array.isArray(result.data)) {
          setTreeData(result.data.filter(isRecord));
        } else {
          setError(
            isRecord(result) && typeof result.message === "string"
              ? result.message
              : "Failed to load network tree",
          );
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

  const formattedTreeData = useMemo(() => buildTreeData(treeData), [treeData]);

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
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <PageLoader />
            </div>
          ) : formattedTreeData.length ? (
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
