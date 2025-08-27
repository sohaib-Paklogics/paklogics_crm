"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DragDropContext,
  type DropResult,
  type DragStart,
} from "react-beautiful-dnd";
import { Eye, Plus, ArrowLeft, ArrowRight, Search } from "lucide-react";

import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import useAuthStore from "@/stores/auth-store";
import { useKanbanStore } from "@/stores/kanban.store";
import { useStagesStore } from "@/stores/stages.store";
import type { Lead, Stage } from "@/types/lead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AddLeadModal } from "@/components/modals/add-lead-modal";
import KanbanColumn from "@/components/leadDetail/KanbanColumn";
import Loader from "@/components/common/Loader";
import Link from "next/link";

export default function KanbanPage() {
  const { user, hasPermission } = useAuthStore();
  const { board, isLoading, fetchBoard, moveCard } = useKanbanStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const {
    items: stages,
    fetch: fetchStages,
    isLoading: stagesLoading,
    addBefore,
    addAfter,
  } = useStagesStore();

  const buildBoardParams = useCallback(() => {
    const params: Record<string, any> = { limit: 100 };
    if (!user) return params;
    if (user.role === "business_developer") params.createdBy = user.id;
    if (user.role === "developer") params.assignedTo = user.id;
    return params;
  }, [user]);

  const refreshBoard = useCallback(async () => {
    await fetchStages();
    await fetchBoard(buildBoardParams());
  }, [fetchStages, fetchBoard, buildBoardParams]);

  useEffect(() => {
    if (!user) return;
    refreshBoard();
  }, [user, refreshBoard]);

  const canDragDrop =
    hasPermission({ action: "update", resource: "leads" }) ||
    (user && (user.role === "admin" || user.role === "superadmin"));

  const applyRoleFilter = (items: Lead[]) => {
    if (!user) return [];
    if (user.role === "admin" || user.role === "superadmin") return items;

    if (user.role === "business_developer") {
      return items.filter(
        (l) =>
          String(
            typeof l.createdBy === "string" ? l.createdBy : l.createdBy?._id
          ) === String(user.id)
      );
    }
    if (user.role === "developer") {
      return items.filter(
        (l) =>
          String(
            typeof l.assignedTo === "string" ? l.assignedTo : l.assignedTo?._id
          ) === String(user.id)
      );
    }
    return items;
  };

  // ---------- Local (Kanban-only) search ----------
  const [searchInput, setSearchInput] = useState(""); // uncontrolled typing
  const [searchQuery, setSearchQuery] = useState(""); // committed query (Enter / button)
  const needle = useMemo(() => searchQuery.trim().toLowerCase(), [searchQuery]);

  // helper handlers
  const commitSearch = useCallback(() => {
    setSearchQuery(searchInput);
  }, [searchInput]);

  const onSearchKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") commitSearch();
    },
    [commitSearch]
  );

  const columns = useMemo(() => {
    const colEntries: { stage: Stage; leads: Lead[] }[] = [];
    if (!board || !stages?.length) return colEntries;

    for (const s of stages) {
      const col = board.columns[String(s._id)];
      const leads = applyRoleFilter(col?.data ?? []);

      const filtered = !needle
        ? leads
        : leads.filter((l) => {
            const title = String(l.clientName ?? "").toLowerCase();
            const company = String((l as any)?.company ?? "").toLowerCase();
            return title.includes(needle) || company.includes(needle);
          });

      colEntries.push({ stage: s, leads: filtered });
    }
    return colEntries;
  }, [board, stages, user, needle]);

  const total = useMemo(
    () => columns.reduce((sum, c) => sum + c.leads.length, 0),
    [columns]
  );

  const anyResults = useMemo(
    () => columns.some((c) => c.leads.length > 0),
    [columns]
  );
  // -------------------------------------------------

  // ---------- Smooth scrolling engine (hover + drag-edge), with initial measurement ----------
  const scrollRef = useRef<HTMLDivElement>(null);

  // Drag-edge state
  const isDraggingRef = useRef(false);
  const lastPointer = useRef<{ x: number; y: number } | null>(null);

  // Hover state: -1 left, 1 right, 0 idle
  const hoverDirRef = useRef<-1 | 0 | 1>(0);

  // RAF + timing
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);
  const hoverVelocityRef = useRef(0); // px/s with easing

  // Arrow enablement
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Constants for smoothing
  const HOVER_MAX_SPEED = 1200; // px/sec
  const HOVER_ACCEL = 4000; // px/sec^2
  const DRAG_MAX_SPEED = 900; // px/sec
  const EDGE_PX = 96; // sensitivity zone near edges

  const updateArrowState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const maxScrollLeft = Math.max(0, el.scrollWidth - el.clientWidth);
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft < maxScrollLeft);
  }, []);

  const measureOnNextFrame = useCallback(() => {
    requestAnimationFrame(updateArrowState);
  }, [updateArrowState]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    updateArrowState();

    const ro = new ResizeObserver(() => {
      updateArrowState();
    });

    ro.observe(el);
    if (el.firstElementChild) ro.observe(el.firstElementChild as Element);

    const onResize = () => updateArrowState();
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, [columns, stagesLoading, updateArrowState]);

  const handleUserScroll = useCallback(() => {
    updateArrowState();
  }, [updateArrowState]);

  const onPointerMove = useCallback((e: PointerEvent) => {
    lastPointer.current = { x: e.clientX, y: e.clientY };
  }, []);

  const ensureRaf = useCallback(() => {
    if (rafRef.current == null) {
      lastTsRef.current = null;
      rafRef.current = requestAnimationFrame(function loop(ts: number) {
        rafRef.current = requestAnimationFrame(loop);
        const el = scrollRef.current;
        if (!el) return;

        const lastTs = lastTsRef.current ?? ts;
        const dt = Math.max(0, (ts - lastTs) / 1000);
        lastTsRef.current = ts;

        updateArrowState();

        // Hover smooth-scroll with acceleration
        if (hoverDirRef.current !== 0) {
          const targetSpeed = HOVER_MAX_SPEED * hoverDirRef.current;
          const current = hoverVelocityRef.current;
          const next =
            current +
            Math.sign(targetSpeed - current) *
              Math.min(HOVER_ACCEL * dt, Math.abs(targetSpeed - current));
          hoverVelocityRef.current = next;
          el.scrollLeft += next * dt;
          return;
        } else if (hoverVelocityRef.current !== 0) {
          const friction = HOVER_ACCEL * 1.25;
          const current = hoverVelocityRef.current;
          const decel = Math.min(friction * dt, Math.abs(current));
          const next = current - Math.sign(current) * decel;
          hoverVelocityRef.current = Math.abs(next) < 1 ? 0 : next;
          el.scrollLeft += next * dt;
          if (hoverVelocityRef.current !== 0) return;
        }

        // Drag-edge autoscroll
        if (isDraggingRef.current && lastPointer.current) {
          const rect = el.getBoundingClientRect();
          const x = lastPointer.current.x;

          let speed = 0;
          if (x - rect.left < EDGE_PX) {
            const t = Math.min(1, (EDGE_PX - (x - rect.left)) / EDGE_PX);
            speed = -DRAG_MAX_SPEED * t;
          } else if (rect.right - x < EDGE_PX) {
            const t = Math.min(1, (EDGE_PX - (rect.right - x)) / EDGE_PX);
            speed = DRAG_MAX_SPEED * t;
          }

          if (speed !== 0) {
            el.scrollLeft += speed * dt;
            return;
          }
        }

        cancelAnimationFrame(rafRef.current!);
        rafRef.current = null;
        lastTsRef.current = null;
      });
    }
  }, [DRAG_MAX_SPEED, EDGE_PX, HOVER_ACCEL, HOVER_MAX_SPEED, updateArrowState]);

  const startHoverScroll = useCallback(
    (dir: -1 | 1) => {
      hoverDirRef.current = dir;
      ensureRaf();
    },
    [ensureRaf]
  );

  const stopHoverScroll = useCallback(() => {
    hoverDirRef.current = 0;
    ensureRaf();
  }, [ensureRaf]);

  const startAutoScroll = useCallback(() => {
    isDraggingRef.current = true;
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    ensureRaf();
  }, [onPointerMove, ensureRaf]);

  const stopAutoScroll = useCallback(() => {
    isDraggingRef.current = false;
    window.removeEventListener("pointermove", onPointerMove);
  }, [onPointerMove]);

  useEffect(() => {
    measureOnNextFrame();
  }, [columns.length, stagesLoading, measureOnNextFrame]);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastTsRef.current = null;
      hoverVelocityRef.current = 0;
      hoverDirRef.current = 0;
      stopAutoScroll();
    };
  }, [stopAutoScroll]);
  // ----------------------------------------------------------------

  // ---------- Search focus: scroll to first matching stage + first card ----------
  // Refs registry per stage
  const stageElMap = useRef<Map<string, HTMLDivElement>>(new Map());
  const listElMap = useRef<Map<string, HTMLDivElement>>(new Map()); // scrollable list inside column
  const firstCardElMap = useRef<Map<string, HTMLElement>>(new Map());

  // For visual highlight of the focused lead
  const [highlightLeadId, setHighlightLeadId] = useState<string | null>(null);

  const registerStageEl = useCallback(
    (stageId: string, el: HTMLDivElement | null) => {
      if (!el) {
        stageElMap.current.delete(stageId);
      } else {
        stageElMap.current.set(stageId, el);
      }
    },
    []
  );

  const registerListEl = useCallback(
    (stageId: string, el: HTMLDivElement | null) => {
      if (!el) {
        listElMap.current.delete(stageId);
      } else {
        listElMap.current.set(stageId, el);
      }
    },
    []
  );

  const registerFirstCardEl = useCallback(
    (stageId: string, leadId: string | null, el: HTMLElement | null) => {
      if (!el || !leadId) {
        firstCardElMap.current.delete(stageId);
      } else {
        firstCardElMap.current.set(stageId, el);
      }
    },
    []
  );

  // Effect: whenever search results change and q is non-empty,
  // jump to first stage with results and first card in it.
  useEffect(() => {
    if (!needle) {
      setHighlightLeadId(null);
      return;
    }
    const firstHit = columns.find((c) => c.leads.length > 0);
    if (!firstHit) {
      setHighlightLeadId(null);
      return;
    }

    const stageId = String(firstHit.stage._id);
    const leadId = String(firstHit.leads[0]._id);

    // 1) Scroll horizontally to the column
    const boardEl = scrollRef.current;
    const colEl = stageElMap.current.get(stageId);
    if (boardEl && colEl) {
      const targetLeft = colEl.offsetLeft - 12; // small padding
      boardEl.scrollTo({ left: targetLeft, behavior: "smooth" });
    }

    // 2) Scroll vertically inside the column to its first card
    const listEl = listElMap.current.get(stageId);
    const cardEl = firstCardElMap.current.get(stageId);
    if (listEl && cardEl) {
      const top = cardEl.offsetTop - 8; // tiny top padding
      listEl.scrollTo({ top, behavior: "smooth" });
    }

    // 3) Temporary highlight
    setHighlightLeadId(leadId);
    const t = setTimeout(() => setHighlightLeadId(null), 1600);
    return () => clearTimeout(t);
  }, [needle, columns]);

  // ----------------------------------------------------------------

  if (isLoading) {
    return (
      <MainLayout>
        <Loader />
      </MainLayout>
    );
  }

  const onDragStart = (_: DragStart) => {
    startAutoScroll();
  };

  const onDragEnd = async (result: DropResult) => {
    stopAutoScroll();

    if (!canDragDrop) return;
    const { source, destination, draggableId } = result;
    if (!destination) return;

    const from = source.droppableId;
    const to = destination.droppableId;
    if (from === to && destination.index === source.index) return;

    await moveCard(String(draggableId), String(from), String(to));
  };

  const changeStatusViaMenu = async (lead: Lead, toStageId: string) => {
    const fromId = String(
      typeof lead.stage === "string" ? lead.stage : lead.stage?._id
    );
    if (fromId === toStageId) return;
    await moveCard(String(lead._id), fromId, toStageId);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-validiz-brown">
              Lead Pipeline
            </h1>
            <p className="text-gray-600 mt-1">
              Track leads through your sales pipeline
              {!canDragDrop && " (Read-only view)"}
            </p>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={onSearchKeyDown}
              placeholder="Search in board…"
              className="h-9 w-[220px] sm:w-[260px]"
            />
            <Button type="button" onClick={commitSearch} className="h-9">
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>

            <Link href="/leads" className="flex items-center">
              <Button variant={"ghost"}>
                <Eye className="w-4 h-4 mr-2" />
                View Lead
              </Button>
            </Link>
            {user?.role !== "developer" && (
              <Button onClick={() => setIsAddModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Lead
              </Button>
            )}
          </div>
        </div>

        {/* Kanban Board */}
        {!anyResults && searchQuery ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              No leads match “{searchQuery}”.
            </CardContent>
          </Card>
        ) : (
          <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
            <div className="relative">
              {/* Left hover arrow */}
              {canScrollLeft && (
                <button
                  type="button"
                  aria-label="Scroll left"
                  onMouseEnter={() => startHoverScroll(-1)}
                  onMouseLeave={stopHoverScroll}
                  onFocus={() => startHoverScroll(-1)}
                  onBlur={stopHoverScroll}
                  className="hidden sm:flex items-center justify-center
                             absolute left-2 top-1/2 -translate-y-1/2 z-10
                             h-10 w-10 rounded-full bg-white/90 backdrop-blur
                             shadow border border-gray-200 hover:bg-white
                             transition"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
              )}

              {/* Right hover arrow */}
              {canScrollRight && (
                <button
                  type="button"
                  aria-label="Scroll right"
                  onMouseEnter={() => startHoverScroll(1)}
                  onMouseLeave={stopHoverScroll}
                  onFocus={() => startHoverScroll(1)}
                  onBlur={stopHoverScroll}
                  className="hidden sm:flex items-center justify-center
                             absolute right-2 top-1/2 -translate-y-1/2 z-10
                             h-10 w-10 rounded-full bg-white/90 backdrop-blur
                             shadow border border-gray-200 hover:bg-white
                             transition"
                >
                  <ArrowRight className="h-5 w-5" />
                </button>
              )}

              {/* Optional edge gradients */}
              <div className="pointer-events-none absolute left-0 top-0 h-full w-8 bg-gradient-to-r from-white/90 to-transparent" />
              <div className="pointer-events-none absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-white/90 to-transparent" />

              {/* Scrollable row */}
              <div
                ref={scrollRef}
                className="flex gap-6 overflow-x-auto pb-4 overscroll-x-contain pr-6"
                style={{ scrollBehavior: "auto" }}
                onScroll={handleUserScroll}
              >
                {(stagesLoading ? [] : columns).map(({ stage, leads }) => (
                  <KanbanColumn
                    key={stage._id}
                    stage={stage}
                    leads={leads}
                    canDragDrop={!!canDragDrop}
                    isLoading={isLoading || stagesLoading}
                    allStages={stages}
                    onChangeStatus={changeStatusViaMenu}
                    stageActions={{
                      addBefore: async (name: string, color?: string) => {
                        await addBefore(stage._id, name, color);
                        await refreshBoard();
                        measureOnNextFrame();
                      },
                      addAfter: async (name: string, color?: string) => {
                        await addAfter(stage._id, name, color);
                        await refreshBoard();
                        measureOnNextFrame();
                      },
                      refresh: async () => {
                        await refreshBoard();
                        measureOnNextFrame();
                      },
                    }}
                    // NEW: refs + highlight
                    registerStageEl={registerStageEl}
                    registerListEl={registerListEl}
                    registerFirstCardEl={registerFirstCardEl}
                    highlightLeadId={highlightLeadId}
                  />
                ))}
              </div>
            </div>
          </DragDropContext>
        )}

        {/* Stats Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-validiz-brown">
              Pipeline Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {columns.map(({ stage, leads }) => {
                const percent = total
                  ? Math.round((leads.length / total) * 100)
                  : 0;
                return (
                  <div key={stage._id} className="text-center">
                    <div
                      className="w-4 h-4 rounded-full mx-auto mb-2"
                      style={{ background: stage.color }}
                    />
                    <p className="text-2xl font-bold text-validiz-brown">
                      {leads.length}
                    </p>
                    <p className="text-sm text-gray-600">{stage.name}</p>
                    <p className="text-xs text-gray-500">{percent}% of total</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <AddLeadModal
          open={isAddModalOpen}
          onOpenChange={setIsAddModalOpen}
          onSuccess={async () => {
            setIsAddModalOpen(false);
            await fetchBoard(buildBoardParams());
            measureOnNextFrame();
          }}
        />
      </div>
    </MainLayout>
  );
}
