"use client";

import React, { useState, useEffect, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import ReactFlow, {
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  MarkerType,
  Node,
  NodeTypes,
  Handle,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";

// Custom CSS for ReactFlow default nodes
const customNodeStyles = `
  .react-flow__node-default {
    background: rgb(31, 41, 55) !important;
    border: 2px solid rgb(75, 85, 99) !important;
    border-radius: 12px !important;
    padding: 16px 24px !important;
    color: white !important;
    font-weight: 500 !important;
    font-size: 14px !important;
    min-width: 140px !important;
    text-align: center !important;
    transition: all 0.2s ease !important;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
    backdrop-filter: blur(4px) !important;
  }
  
  .react-flow__node-default:hover {
    border-color: rgb(107, 114, 128) !important;
    background: rgb(55, 65, 81) !important;
  }
  
  .react-flow__node-default.selected {
    border-color: rgb(167, 139, 250) !important;
    box-shadow: 0 0 0 2px rgba(167, 139, 250, 0.5), 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
    background: rgba(139, 92, 246, 0.3) !important;
  }
  
  .react-flow__handle {
    background: #8b5cf6 !important;
    border: 2px solid white !important;
    width: 12px !important;
    height: 12px !important;
  }
  
  .react-flow__handle-connecting {
    background: #a855f7 !important;
  }
  
  .react-flow__handle-valid {
    background: #10b981 !important;
  }
`;

// Inject custom styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = customNodeStyles;
  document.head.appendChild(styleElement);
}
import { ArrowRight, Plus, Loader2, ServerCrash, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import ProjectLayout from "@/components/layouts/ProjectLayout";
import { cn } from "@/lib/utils";
import { v4 as uuidv4 } from "uuid";

type Diagram = {
  mermaid: string;
  reactFlow: {
    nodes: any[];
    edges: any[];
  };
};

type UserFlowDiagram = {
  userFlow: Diagram;
};

// Use ReactFlow's default node types - no custom components
const nodeTypes: NodeTypes = {
  // Using ReactFlow's built-in default node type
};

export default function FlowchartPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const projectId = resolvedParams.id;

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  
  const [userFlowDiagram, setUserFlowDiagram] = useState<UserFlowDiagram | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);

  // Auto-save functionality
  const autoSave = useCallback(async () => {
    if (!userFlowDiagram) return;
    
    try {
      const updatedUserFlow = {
        ...userFlowDiagram.userFlow,
        reactFlow: { nodes, edges },
      };
      
      // Get existing workflow_diagram and update only userFlow
      const { data: currentProject } = await supabase
        .from('projects')
        .select('workflow_diagram')
        .eq('id', projectId)
        .single();
      
      const updatedWorkflowDiagram = {
        ...currentProject?.workflow_diagram,
        userFlow: updatedUserFlow,
      };

      const { error: updateError } = await supabase
        .from("projects")
        .update({ workflow_diagram: updatedWorkflowDiagram })
        .eq("id", projectId);

      if (updateError) {
        console.error('Auto-save failed:', updateError);
      }
    } catch (err: any) {
      console.error('Auto-save error:', err);
    }
  }, [userFlowDiagram, nodes, edges, projectId]);

  // Handler for deleting nodes via keyboard
  const handleNodeDelete = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
    setSelectedNodes((selected) => selected.filter((id) => id !== nodeId));
    setTimeout(autoSave, 500);
  }, [setNodes, setEdges, autoSave]);

  const addNewNode = useCallback((position: { x: number; y: number }) => {
    const newNode: Node = {
      id: uuidv4(),
      type: 'default', // Use ReactFlow's default node type
      position,
      data: { 
        label: 'New Node',
      },
    };
    setNodes((nds) => [...nds, newNode]);
    setTimeout(autoSave, 500);
  }, [setNodes, autoSave]);

  // Fetch or generate user flow diagram
  useEffect(() => {
    const getUserFlowDiagram = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // First try to load existing diagram from database
        const { data: project } = await supabase
          .from('projects')
          .select('workflow_diagram')
          .eq('id', projectId)
          .single();

        if (project?.workflow_diagram?.userFlow) {
          const diagram = { userFlow: project.workflow_diagram.userFlow };
          setUserFlowDiagram(diagram);
          
          // Initialize React Flow state with default node type
          const flowData = project.workflow_diagram.userFlow.reactFlow;
          if (flowData) {
            const enhancedNodes = flowData.nodes.map((node: any) => ({
              ...node,
              type: 'default', // Use ReactFlow's default node type
              data: {
                ...node.data,
              },
            }));
            setNodes(enhancedNodes);
            setEdges(flowData.edges || []);
          }
        } else {
          // Generate new diagram if none exists
          const res = await fetch("/api/flowchart/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ projectId }),
          });

          if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.error || "Failed to generate diagrams.");
          }

          const data = await res.json();
          
          if (!data.diagrams?.userFlow) {
            throw new Error("No user flow diagram received from API");
          }

          const diagram = { userFlow: data.diagrams.userFlow };
          setUserFlowDiagram(diagram);

          // Initialize React Flow state with default node type
          const flowData = data.diagrams.userFlow.reactFlow;
          if (flowData) {
            const enhancedNodes = flowData.nodes.map((node: any) => ({
              ...node,
              type: 'default', // Use ReactFlow's default node type
              data: {
                ...node.data,
              },
            }));
            setNodes(enhancedNodes);
            setEdges(flowData.edges || []);
          }
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    getUserFlowDiagram();
  }, [projectId, setNodes, setEdges]);

  const onConnect = useCallback((params: Connection | Edge) => {
    const newEdge = { 
      ...params, 
      type: 'smoothstep', 
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { 
        stroke: '#8b5cf6', 
        strokeWidth: 3,
        strokeDasharray: '0'
      },
      animated: false
    };
    setEdges((eds) => addEdge(newEdge, eds));
    setTimeout(autoSave, 500);
  }, [setEdges, autoSave]);




  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    
    // Get the ReactFlow wrapper element
    const reactFlowWrapper = event.currentTarget;
    const reactFlowBounds = reactFlowWrapper.getBoundingClientRect();
    
    // Calculate position relative to the canvas
    const position = {
      x: event.clientX - reactFlowBounds.left - 70, // Center node horizontally
      y: event.clientY - reactFlowBounds.top - 25,  // Center node vertically
    };
    
    addNewNode(position);
  }, [addNewNode]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onSelectionChange = useCallback((elements: any) => {
    const nodeIds = elements.nodes.map((node: any) => node.id);
    setSelectedNodes(nodeIds);
  }, []);

  // Handle keyboard delete
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.key === 'Delete' || event.key === 'Backspace') && selectedNodes.length > 0) {
        selectedNodes.forEach(nodeId => handleNodeDelete(nodeId));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodes, handleNodeDelete]);

  // Auto-save when nodes or edges change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if ((nodes.length > 0 || edges.length > 0) && userFlowDiagram) {
        autoSave();
      }
    }, 1000); // Debounce auto-save by 1 second

    return () => clearTimeout(timeoutId);
  }, [nodes, edges, autoSave, userFlowDiagram]);
  
  const handleNext = async () => {
    await autoSave();
    // Update status and navigate
    await supabase.from("projects").update({ status: "ui_design" }).eq("id", projectId);
    router.push(`/project/${projectId}/ui-design`);
  };

  const renderLoading = () => (
    <div className="flex flex-col items-center justify-center h-full text-white">
      <Loader2 className="w-12 h-12 animate-spin text-violet-400 mb-4" />
      <p>AI generating system blueprints...</p>
    </div>
  );
  
  const renderError = () => (
     <div className="flex flex-col items-center justify-center h-full text-white bg-red-500/10 p-8 rounded-lg">
      <ServerCrash className="w-12 h-12 text-red-400 mb-4" />
      <p className="font-semibold">Failed to generate diagrams</p>
      <p className="text-sm text-white/70 mb-4">{error}</p>
      <Button onClick={() => window.location.reload()}>Try Again</Button>
    </div>
  );

  return (
    <ProjectLayout projectId={projectId}>
      <div className="fixed inset-0 w-screen h-screen bg-black overflow-hidden">
        {/* Add Node Button */}
        <div className="absolute top-4 left-4 z-20">
          <Button
            draggable
            onDragStart={(e) => {
              setIsDragging(true);
              e.dataTransfer.effectAllowed = 'move';
            }}
            onDragEnd={() => setIsDragging(false)}
            onClick={() => {
              // Add node at center when clicked
              addNewNode({ x: 400, y: 300 });
            }}
            className="bg-violet-600 hover:bg-violet-700 text-white border-violet-500 cursor-grab active:cursor-grabbing"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Box
          </Button>
        </div>

        {/* Main Canvas */}
        <div className="absolute inset-0 w-full h-full">
          {isLoading ? renderLoading() : error ? renderError() : (
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onSelectionChange={onSelectionChange}
              fitView
              className={cn(
                "w-full h-full",
                isDragging && "cursor-crosshair"
              )}
              style={{ width: '100vw', height: '100vh' }}
            >
              <Controls className="bg-white/10 border-white/20" />
              <Background 
                variant={BackgroundVariant.Dots}
                color="#ffffff" 
                gap={30} 
                size={2}
                className="opacity-20"
              />
            </ReactFlow>
          )}
        </div>

        {/* Next Button */}
        <div className="absolute bottom-4 right-4 z-10">
          <Button onClick={handleNext} className="bg-violet-600 hover:bg-violet-700">
            Next: UI Design <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </div>
    </ProjectLayout>
  );
} 