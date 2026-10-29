import React, { useState } from "react";
import {
  Globe,
  Smartphone,
  Monitor,
  MoreHorizontal,
  Trash2,
  Edit,
  Archive,
  Share,
} from "lucide-react";
import { getPhaseIndex } from "@/lib/phases";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export type ProjectPlatform = "Web" | "Mobile" | "Desktop";

export interface ProjectCardProps {
  project: {
    id: string;
    name: string;
    description: string;
    progress: number;
    platform: ProjectPlatform;
    createdAt: string;
    isDemo?: boolean;
    status?: string;
  };
  onDelete: (projectId: string) => void;
  onRename?: (projectId: string, newName: string) => void;
  onArchive?: (projectId: string) => void;
}

// Helper component for project progress circles
const ProjectProgressCircles: React.FC<{ status?: string }> = ({ status }) => {
  const currentStep = getPhaseIndex(status);
  const totalSteps = 7;
  
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: totalSteps }, (_, index) => (
        <div
          key={index}
          className={`w-2 h-2 rounded-full transition-colors ${
            index <= currentStep
              ? 'bg-gradient-to-r from-blue-500 to-purple-500'
              : 'bg-white/20'
          }`}
        />
      ))}
    </div>
  );
};

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onDelete,
  onRename,
  onArchive,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(project.name);
  // Determine platform icon
  const PlatformIcon = () => {
    switch (project.platform) {
      case "Mobile":
        return <Smartphone className="w-4 h-4" />;
      case "Desktop":
        return <Monitor className="w-4 h-4" />;
      default:
        return <Globe className="w-4 h-4" />;
    }
  };

  const handleRename = () => {
    if (onRename && editedName.trim() && editedName !== project.name) {
      onRename(project.id, editedName.trim());
    }
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRename();
    } else if (e.key === 'Escape') {
      setEditedName(project.name);
      setIsEditing(false);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(project.id);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 shadow-lg flex flex-col h-full p-6 group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-white/20">
      {/* Gradient border effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
      
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent -z-20" />
      
      {/* Dropdown Menu for actions */}
      {!project.isDemo && (
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-20">
          <AlertDialog>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsEditing(true);
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  <span>Rename</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onArchive?.(project.id);
                  }}
                >
                  <Archive className="mr-2 h-4 w-4" />
                  <span>Archive</span>
                </DropdownMenuItem>
                <DropdownMenuItem disabled>
                  <Share className="mr-2 h-4 w-4" />
                  <span>Share</span>
                </DropdownMenuItem>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem className="text-red-500 hover:!text-red-500 focus:!text-red-500">
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Delete</span>
                  </DropdownMenuItem>
                </AlertDialogTrigger>
              </DropdownMenuContent>
            </DropdownMenu>
            <AlertDialogContent
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  your project and remove all associated data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteClick}
                  className="bg-red-500 hover:bg-red-600"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}

      {/* Demo badge */}
      {project.isDemo && (
        <div className="absolute top-3 left-3 bg-purple-500/20 text-purple-300 text-xs px-2 py-0.5 rounded-full">
          Demo
        </div>
      )}

      {/* Title row */}
      <div className="mb-1 pr-6">
      {isEditing ? (
        <input
          type="text"
          value={editedName}
          onChange={(e) => setEditedName(e.target.value)}
          onBlur={handleRename}
          onKeyDown={handleKeyPress}
            className="font-bold text-lg text-white flex-1 bg-transparent border border-white/20 rounded px-2 py-1 focus:outline-none focus:border-white/40"
          autoFocus
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
          <h3 className="font-bold text-lg text-white flex-1 line-clamp-1">
          {project.name}
        </h3>
      )}
      </div>
      <span className="text-xs text-white/60 mb-4 flex items-center gap-1.5">
        <span className="w-3.5 h-3.5 flex items-center justify-center text-white/70">
          <PlatformIcon />
        </span>
        {project.platform} App
      </span>

      <p className="text-white/70 text-sm flex-grow line-clamp-3 mb-6">
        {project.description}
      </p>

      <div className="mb-4">
        <div className="flex items-center justify-between">
          <ProjectProgressCircles status={project.status} />
          <span className="text-xs text-white/60">
            {getPhaseIndex(project.status) + 1}/7 steps
          </span>
        </div>
      </div>

      <div className="text-xs text-white/50 flex items-center gap-1 mt-auto">
        <span>Created {project.createdAt}</span>
      </div>
    </div>
  );
};

export default ProjectCard;
