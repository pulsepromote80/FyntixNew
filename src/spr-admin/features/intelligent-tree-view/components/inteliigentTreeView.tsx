"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import Tree from "react-d3-tree";
import { Search, User, Users, Network, File } from "lucide-react";
import { useCommunityStore, type NetworkTreeNode } from "@/spr-admin/store/community.store";
import { apiClient } from "@/spr-admin/lib/api-client";
import { Spinner } from "@/spr-admin/components/ui/Spinner";
import toast from "react-hot-toast";

type TreeDataNode = {
  name: string;
  loginid?: string;
  attributes?: Record<string, string | number | boolean>;
  children?: TreeDataNode[];
  __rd3t?: {
    id: string;
    collapsed: boolean;
  };
};

// Custom hook for window size
const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 1200,
    height: typeof window !== "undefined" ? window.innerHeight : 800,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowSize;
};

// Build tree from flat list using SponsorId as parent
const buildTreeData = (data: unknown): TreeDataNode[] => {
  if (!data) return [];
  const nodes = Array.isArray(data) ? data : [data];
  if (nodes.length === 0) return [];

  const isNested = nodes.some(
    (node: unknown) =>
      node &&
      typeof node === "object" &&
      "children" in node &&
      Array.isArray((node as NetworkTreeNode).children)
  );

  const transformNode = (node: NetworkTreeNode): TreeDataNode => ({
    name: node.Name || "",
    loginid: node.Loginid || "",
    attributes: {
      package: Number(node.LeaseAmount) || 0,
      position: String(node.status || ""),
      level: Number(node.uLvl) || 0,
      actDate: String(node.RegDate || ""),
      leftActive: Number(node.ActiveTeam) || 0,
      rightActive: Number(node.ActiveTeam) || 0,
      leftBusiness: Number(node.TeamBusiness) || 0,
      rightBusiness: Number(node.TeamBusiness) || 0,
      carryForward: 0,
      leftUsers: Number(node.TotalTeam) || 0,
      rightUsers: Number(node.TotalTeam) || 0,
      buttonLink: "",
      binaryImg: "",
      urid: String(node.id?.toString() || ""),
      sponsor: String(node.SponsorId || ""),
      totalTeam: Number(node.TotalTeam) || 0,
      leaseAmount: Number(node.LeaseAmount) || 0,
      regDate: String(node.RegDate || ""),
      directBusiness: Number(node.DirectBusiness) || 0,
      activeTeam: Number(node.ActiveTeam) || 0,
      teamBusiness: Number(node.TeamBusiness) || 0,
      urank: String(node.status || ""),
    },
    children: node.children ? node.children.map(transformNode) : [],
  });

  if (isNested) {
    return (nodes as NetworkTreeNode[]).map(transformNode);
  }

  // Flat list → build hierarchy
  const map: Record<string, NetworkTreeNode> = {};
  (nodes as NetworkTreeNode[]).forEach((node: NetworkTreeNode) => {
    const loginid = node.Loginid;
    if (loginid) {
      map[loginid] = { ...node, children: [] };
    }
  });

  const roots: NetworkTreeNode[] = [];
  (nodes as NetworkTreeNode[]).forEach((node: NetworkTreeNode) => {
    const loginid = node.Loginid;
    const parentLogin = node.SponsorId;
    if (loginid && parentLogin && map[parentLogin] && map[loginid]) {
      map[parentLogin].children = map[parentLogin].children || [];
      map[parentLogin].children!.push(map[loginid]);
    } else if (loginid && map[loginid]) {
      roots.push(map[loginid]);
    }
  });

  return roots.map(transformNode);
};

// Helper to safely read attributes
const getAttrs = (nodeDatum: TreeDataNode): Record<string, string | number | boolean> =>
  (nodeDatum.attributes ?? {}) as Record<string, string | number | boolean>;

// Custom Node with responsive sizing
const CustomNode = ({
  nodeDatum,
  toggleNode,
  scale = 1,
}: {
  nodeDatum: TreeDataNode;
  toggleNode: () => void;
  scale?: number;
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ top: 10, left: 0 });
  const nodeRef = useRef<HTMLDivElement | null>(null);

  const attrs = getAttrs(nodeDatum);

  const leaseAmount =
    typeof attrs.leaseAmount === "number" ? attrs.leaseAmount : 0;

  const headerColor =
    leaseAmount > 0
      ? "bg-gradient-to-r from-green-500 to-green-600"
      : "bg-gradient-to-r from-red-500 to-red-600";

  const formatAmount = (amount: string | number | boolean): string => {
    const num =
      typeof amount === "number" ? amount : parseFloat(String(amount ?? ""));
    if (!Number.isFinite(num)) return "0";
    return Number.isInteger(num) ? num.toFixed(0) : num.toFixed(2);
  };

  // Base dimensions (designed for scale=1)
  const baseWidth = 200;
  const baseHeight = 150;
  const width = baseWidth * Math.max(0.7, scale);
  const height = baseHeight * Math.max(0.7, scale);
  const fontSize = Math.max(10, 14 * Math.max(0.7, scale));
  const padding = 8 * Math.max(0.7, scale);

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

  const handleMouseLeave = () => setShowTooltip(false);

  const handleCopyClick = () => {
    const nodeData = { Username: nodeDatum.loginid };
    const dataString = Object.entries(nodeData)
      .map(([key, value]) => `${key}: ${value}`)
      .join("\n");
    navigator.clipboard
      .writeText(dataString)
      .then(() => toast.success("Username copied to clipboard!"))
      .catch(() => toast.error("Failed to copy data"));
  };

  const collapsed = Boolean(nodeDatum.__rd3t?.collapsed);

  const hasChildren =
    Array.isArray(nodeDatum.children) && nodeDatum.children.length > 0;

  return (
    <foreignObject
      width={width}
      height={height + 20}
      x={-width / 2}
      y={-height / 2 - 10}
      pointerEvents="none"
    >
      <div
        ref={nodeRef}
        style={{ pointerEvents: "auto", width, height }}
        className="relative border-2 bg-white rounded-xl transition-all duration-300"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Header */}
        <div
          className={`text-white rounded-t-xl flex justify-between items-center px-3 py-2 ${headerColor}`}
          style={{
            padding: `${padding * 0.6}px ${padding}px`,
            fontSize: `${fontSize * 0.9}px`,
          }}
        >
          <button
            className="hover:text-gray-200 transition-colors p-1 hover:bg-white/20 rounded"
            onClick={handleCopyClick}
            title="Copy Username"
          >
            <File
              style={{
                width: `${fontSize * 0.8}px`,
                height: `${fontSize * 0.8}px`,
              }}
            />
          </button>
          <span
            className="font-medium cursor-default select-text"
            style={{ fontSize: `${fontSize}px` }}
          >
            {String(nodeDatum.loginid || "")}
          </span>
        </div>

        {/* Name */}
        <p
          className="px-3 py-1 font-bold text-center text-gray-700 truncate"
          style={{
            fontSize: `${fontSize * 0.9}px`,
            padding: `${padding * 0.4}px ${padding}px`,
          }}
        >
          {String(nodeDatum.name || "")}
        </p>

        {/* Lease */}
        <div
          className="px-3 py-1 text-center text-gray-500"
          style={{ fontSize: `${fontSize * 0.85}px` }}
        >
          <span>Lease: </span>
          <span
            className={`font-bold ${
              leaseAmount > 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {`$${formatAmount(leaseAmount)}`}
          </span>
        </div>

        {/* Team */}
        <p
          className="px-3 py-1 text-center text-gray-500"
          style={{ fontSize: `${fontSize * 0.85}px` }}
        >
          <span>Team: </span>
          <span className="font-bold text-blue-600">
            {String(attrs.totalTeam ?? 0)}
          </span>
        </p>

        {/* Expand/Collapse */}
        {hasChildren && (
          <div className="mb-2 text-center">
            {collapsed ? (
              <button
                className="px-3 py-1 mt-2 text-xs font-medium text-white bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg hover:from-purple-600 hover:to-purple-700 hover:shadow-md transition-all duration-200"
                style={{
                  fontSize: `${fontSize * 0.8}px`,
                  padding: `${padding * 0.4}px ${padding * 0.8}px`,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleNode();
                }}
              >
                Expand +
              </button>
            ) : (
              <button
                className="px-3 py-1 mt-2 text-xs font-medium text-white bg-gradient-to-r from-gray-500 to-gray-600 rounded-lg hover:from-gray-600 hover:to-gray-700 hover:shadow-md transition-all duration-200"
                style={{
                  fontSize: `${fontSize * 0.8}px`,
                  padding: `${padding * 0.4}px ${padding * 0.8}px`,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleNode();
                }}
              >
                Collapse -
              </button>
            )}
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
                height: 180,
                backgroundColor: "#1f2937",
                color: "white",
                fontSize: "0.7rem",
                borderRadius: "0.75rem",
                padding: "1rem",
                boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
                zIndex: 9999,
                overflowY: "auto",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <div className="space-y-1">
                <p>
                  <span className="text-gray-400">Reg Date:</span>{" "}
                  {String(attrs.regDate ?? "")}
                </p>
                <p>
                  <span className="text-gray-400">Sponsor:</span>{" "}
                  {String(attrs.sponsor ?? "None")}
                </p>
                <p>
                  <span className="text-gray-400">Direct Business:</span>{" "}
                  {`$${formatAmount(attrs.directBusiness ?? 0)}`}
                </p>
                <p>
                  <span className="text-gray-400">Active Team:</span>{" "}
                  {String(attrs.activeTeam ?? 0)}
                </p>
                <p>
                  <span className="text-gray-400">Team Business:</span>{" "}
                  {`$${formatAmount(attrs.teamBusiness ?? 0)}`}
                </p>
                <p>
                  <span className="text-gray-400">AFLB Rank:</span>{" "}
                  {String(attrs.urank ?? "")}
                </p>
              </div>
            </div>,
            document.body
          )}
      </div>
    </foreignObject>
  );
};

export default function IntelligentTreeView() {
  const {
    networkTreeData,
    loading,
    setNetworkTreeData,
    setLoading,
    setError,
  } = useCommunityStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const windowSize = useWindowSize();

  // Responsive node spacing
  const getNodeSize = (containerWidth: number) => {
    if (containerWidth < 600) return { x: 250, y: 250 };
    if (containerWidth < 900) return { x: 300, y: 300 };
    return { x: 350, y: 350 };
  };

  const [translate, setTranslate] = useState({ x: 400, y: 100 });
  const [nodeSize, setNodeSize] = useState(getNodeSize(1200));
  const [scaleFactor, setScaleFactor] = useState(1);

  const [userId, setUserId] = useState("");
  const [errors, setErrors] = useState<{ title?: string }>({});
  const [searched, setSearched] = useState(false);

  const treeData = useMemo(
    () => buildTreeData(networkTreeData),
    [networkTreeData]
  );

  const handleSearch = async () => {
    const newErrors: { title?: string } = {};
    if (!userId.trim()) {
      newErrors.title = "User ID is required";
      setErrors(newErrors);
      return;
    }
    setErrors({});

    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get(
        `/Community/getNetworkTreeAdmin_Admin?AuthLogin=${userId}`
      );
      const data = (response as { data?: unknown[] })?.data || [];
      setNetworkTreeData(Array.isArray(data) ? (data as NetworkTreeNode[]) : []);
      setSearched(true);
    } catch (err: unknown) {
      setError({
        message: err instanceof Error ? err.message : "Failed to fetch data",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSearched(false);
  }, [userId]);

  // Update layout on container resize
  useEffect(() => {
    if (containerRef.current && treeData && treeData.length > 0) {
      const containerWidth = containerRef.current.offsetWidth;

      const newX = containerWidth / 2;
      const newY = 120;

      const newSize = getNodeSize(containerWidth);
      setNodeSize(newSize);

      const rawScale = newSize.x / 200;
      const finalScale = Math.min(1.2, Math.max(0.7, rawScale));
      setScaleFactor(finalScale);

      setTranslate({ x: newX, y: newY });
    }
  }, [treeData, windowSize.width]);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl shadow-lg">
            <Network className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Intelligent Tree View
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Visualize your network tree structure
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary">
            <Users className="w-3.5 h-3.5" />
            {treeData.length > 0 ? "Tree Loaded" : "Ready"}
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="p-6 border border-border rounded-lg bg-card shadow-sm">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[180px]">
            <label className="block mb-2 text-sm font-medium text-foreground">
              <User className="inline w-4 h-4 mr-2" />
              User ID
            </label>
            <div className="relative">
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className={`w-full px-4 py-2.5 pl-10 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring transition-all ${
                  errors.title
                    ? "border-destructive focus:ring-destructive/20"
                    : "border-input"
                }`}
                placeholder="Enter User ID"
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>
            {errors.title && (
              <div className="mt-2 flex items-center gap-2 text-xs text-destructive">
                {errors.title}
              </div>
            )}
          </div>

          <button
            onClick={handleSearch}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-medium text-white transition-colors bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Spinner className="w-4 h-4 text-white" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            {loading ? "Loading..." : "Search"}
          </button>
        </div>
      </div>

      {/* Tree View */}
      {searched && (
        <div className="border border-border rounded-lg bg-card shadow-sm overflow-hidden">
          <div
            ref={containerRef}
            className="flex items-center justify-center w-full h-[500px] sm:h-[600px] lg:h-[700px] bg-gradient-to-br from-gray-50 to-gray-100"
          >
            {loading ? (
              <div className="flex flex-col items-center justify-center">
                <Spinner className="w-12 h-12 text-primary" />
                <p className="mt-4 text-sm text-muted-foreground">
                  Loading tree structure...
                </p>
              </div>
            ) : treeData && treeData.length > 0 ? (
              <Tree
                data={treeData}
                translate={translate}
                orientation="vertical"
                renderCustomNodeElement={(rd3tProps) => (
                  <CustomNode
                    nodeDatum={rd3tProps.nodeDatum as TreeDataNode}
                    toggleNode={rd3tProps.toggleNode}
                    scale={scaleFactor}
                  />
                )}
                pathFunc="diagonal"
                nodeSize={nodeSize}
                zoomable={true}
                draggable={true}
                initialDepth={1}
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-4">
                <div className="p-4 bg-muted rounded-full">
                  <Network className="w-12 h-12 text-muted-foreground" />
                </div>
                <p className="mt-4 text-lg font-medium text-foreground">
                  No data found
                </p>
                <p className="text-sm text-muted-foreground">
                  No network data found for this User ID
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}