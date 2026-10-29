"use client";

import { useEffect, useRef, useCallback, useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    ImageIcon,
    FileUp,
    Figma,
    MonitorIcon,
    CircleUserRound,
    ArrowUpIcon,
    Paperclip,
    PlusIcon,
    SendIcon,
    XIcon,
    LoaderIcon,
    Sparkles,
    Command,
    Info, 
    ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import * as React from "react"
import { Button } from "./button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { supabase } from "@/lib/supabase/client";

interface UseAutoResizeTextareaProps {
    minHeight: number;
    maxHeight?: number;
}

function useAutoResizeTextarea({
    minHeight,
    maxHeight,
}: UseAutoResizeTextareaProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const adjustHeight = useCallback(
        (reset?: boolean) => {
            const textarea = textareaRef.current;
            if (!textarea) return;

            if (reset) {
                textarea.style.height = `${minHeight}px`;
                return;
            }

            textarea.style.height = `${minHeight}px`;
            const newHeight = Math.max(
                minHeight,
                Math.min(
                    textarea.scrollHeight,
                    maxHeight ?? Number.POSITIVE_INFINITY
                )
            );

            textarea.style.height = `${newHeight}px`;
        },
        [minHeight, maxHeight]
    );

    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = `${minHeight}px`;
        }
    }, [minHeight]);

    useEffect(() => {
        const handleResize = () => adjustHeight();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [adjustHeight]);

    return { textareaRef, adjustHeight };
}

interface CommandSuggestion {
    icon: React.ReactNode;
    label: string;
    description: string;
    prefix: string;
}

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  containerClassName?: string;
  showRing?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, containerClassName, showRing = true, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
    
    return (
      <div className={cn(
        "relative",
        containerClassName
      )}>
        <textarea
          className={cn(
            "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
            "transition-all duration-200 ease-in-out",
            "placeholder:text-muted-foreground",
            "disabled:cursor-not-allowed disabled:opacity-50",
            showRing ? "focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0" : "",
            className
          )}
          ref={ref}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        
        {showRing && isFocused && (
          <motion.span 
            className="absolute inset-0 rounded-md pointer-events-none ring-2 ring-offset-0 ring-violet-500/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}

        {props.onChange && (
          <div 
            className="absolute bottom-2 right-2 opacity-0 w-2 h-2 bg-violet-500 rounded-full"
            style={{
              animation: 'none',
            }}
            id="textarea-ripple"
          />
        )}
      </div>
    )
  }
)
Textarea.displayName = "Textarea"

type Attachment = { name: string; content: string };
type ChatMessage = { id: number; role: "user" | "ai"; content: string };

interface AnimatedAIChatProps {
  projectId: string;
  initialContent?: string;
  onContentChange?: (content: string) => void;
}

export function AnimatedAIChat({ projectId, initialContent = "", onContentChange }: AnimatedAIChatProps) {
    const router = useRouter();
    const [value, setValue] = useState(initialContent);
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);
    const [isTyping, setIsTyping] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [activeSuggestion, setActiveSuggestion] = useState<number>(-1);
    const [showCommandPalette, setShowCommandPalette] = useState(false);
    const [recentCommand, setRecentCommand] = useState<string | null>(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const { textareaRef, adjustHeight } = useAutoResizeTextarea({
        minHeight: 60,
        maxHeight: 200,
    });
    const [inputFocused, setInputFocused] = useState(false);
    const commandPaletteRef = useRef<HTMLDivElement>(null);
    const chatScrollContainerRef = useRef<HTMLDivElement>(null);
    const [isExpanded, setIsExpanded] = useState(!!initialContent);
    const [showNextButton, setShowNextButton] = useState(false);
    const [confidenceLevel, setConfidenceLevel] = useState(0);

    const commandSuggestions: CommandSuggestion[] = [
        { 
            icon: <ImageIcon className="w-4 h-4" />, 
            label: "Clone UI", 
            description: "Generate a UI from a screenshot", 
            prefix: "/clone" 
        },
        { 
            icon: <Figma className="w-4 h-4" />, 
            label: "Import Figma", 
            description: "Import a design from Figma", 
            prefix: "/figma" 
        },
        { 
            icon: <MonitorIcon className="w-4 h-4" />, 
            label: "Create Page", 
            description: "Generate a new web page", 
            prefix: "/page" 
        },
        { 
            icon: <Sparkles className="w-4 h-4" />, 
            label: "Improve", 
            description: "Improve existing UI design", 
            prefix: "/improve" 
        },
    ];

    useEffect(() => {
        const fetchHistory = async () => {
            if (!projectId) return;
            setIsLoadingHistory(true);
            try {
                const res = await fetch(`/api/brainstorm/chat?projectId=${projectId}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.messages && data.messages.length > 0) {
                        setMessages(data.messages);
                        setIsExpanded(true); // Expand if there's history
                    }
                    if (data.readyToProceed) {
                        setShowNextButton(true);
                    }
                    if (data.confidence !== undefined) {
                        setConfidenceLevel(data.confidence);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch chat history:", error);
            } finally {
                setIsLoadingHistory(false);
            }
        };
        fetchHistory();
    }, [projectId]);

    useEffect(() => {
        if (chatScrollContainerRef.current) {
            chatScrollContainerRef.current.scrollTop = chatScrollContainerRef.current.scrollHeight;
        }
    }, [messages]);
    
    useEffect(() => {
        if (value.startsWith('/') && !value.includes(' ')) {
            setShowCommandPalette(true);
            
            const matchingSuggestionIndex = commandSuggestions.findIndex(
                (cmd) => cmd.prefix.startsWith(value)
            );
            
            if (matchingSuggestionIndex >= 0) {
                setActiveSuggestion(matchingSuggestionIndex);
            } else {
                setActiveSuggestion(-1);
            }
        } else {
            setShowCommandPalette(false);
        }
    }, [value]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            const commandButton = document.querySelector('[data-command-button]');
            
            if (commandPaletteRef.current && 
                !commandPaletteRef.current.contains(target) && 
                !commandButton?.contains(target)) {
                setShowCommandPalette(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (showCommandPalette) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActiveSuggestion(prev => 
                    prev < commandSuggestions.length - 1 ? prev + 1 : 0
                );
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActiveSuggestion(prev => 
                    prev > 0 ? prev - 1 : commandSuggestions.length - 1
                );
            } else if (e.key === 'Tab' || e.key === 'Enter') {
                e.preventDefault();
                if (activeSuggestion >= 0) {
                    const selectedCommand = commandSuggestions[activeSuggestion];
                    setValue(selectedCommand.prefix + ' ');
                    setShowCommandPalette(false);
                    
                    setRecentCommand(selectedCommand.label);
                    setTimeout(() => setRecentCommand(null), 3500);
                }
            } else if (e.key === 'Escape') {
                e.preventDefault();
                setShowCommandPalette(false);
            }
        } else if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (value.trim()) {
                handleSendMessage();
            }
        }
    };

    const handleSendMessage = () => {
        if (!isExpanded) {
            setIsExpanded(true);
        }

        const textInput = value.trim();
        if (!textInput && attachments.length === 0) return;

        let combinedContent = textInput;
        if (attachments.length > 0) {
            const attachmentsContent = attachments.map(att => `--- Attached Content: ${att.name} ---\n${att.content}`).join('\n\n');
            combinedContent = textInput ? `${textInput}\n\n${attachmentsContent}` : attachmentsContent;
        }

        const newUserMessage: ChatMessage = { id: Date.now(), role: "user", content: combinedContent };
        setMessages(prev => [...prev, newUserMessage]);
        
        setValue("");
        setAttachments([]);
        adjustHeight(true);
        setIsTyping(true);

        fetch("/api/brainstorm/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ projectId, message: combinedContent }),
        })
        .then(res => {
            if (!res.ok) {
                throw new Error('Network response was not ok');
            }
            return res.json();
        })
        .then(data => {
            const aiResponse = data.message || "(no content)";
            setMessages(prev => [...prev, { id: Date.now() + 1, role: "ai", content: aiResponse }]);
            
            // Update confidence level
            if (data.confidence !== undefined) {
                setConfidenceLevel(data.confidence);
            }
            
            // Show next button if confidence >= 60%
            if (data.confidence >= 60) {
                setShowNextButton(true);
            }
        })
        .catch(console.error)
        .finally(() => setIsTyping(false));
    };

    const handleAttachFile = () => {
        // Mock implementation for attaching a file
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const content = event.target?.result as string;
                    setAttachments(prev => [...prev, { name: file.name, content }]);
                };
                reader.readAsText(file);
            }
        };
        fileInput.click();
    };

    const removeAttachment = (index: number) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };
    
    const selectCommandSuggestion = (index: number) => {
        const selectedCommand = commandSuggestions[index];
        setValue(selectedCommand.prefix + ' ');
        setShowCommandPalette(false);
        
        setRecentCommand(selectedCommand.label);
        setTimeout(() => setRecentCommand(null), 2000);
    };

    const handleNext = async () => {
        try {
            // Generate project brief and save to brainstorming_context
            const res = await fetch("/api/brainstorm/generate-brief", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ projectId }),
            });
            
            if (res.ok) {
                const data = await res.json();
                console.log("Project brief status:", data.message);
                router.push(`/project/${projectId}/tech-stack`);
            } else {
                const errorData = await res.json();
                console.error("Failed to generate project brief:", errorData.error || errorData.details);
                // Could show a toast notification here in the future
            }
        } catch (error) {
            console.error("Error generating project brief:", error);
            // Could show a toast notification here in the future
        }
    };

    const compactView = (
        <motion.div 
            className="w-full max-w-2xl mx-auto relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
        >
            <div className="text-center space-y-3">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="inline-block"
                >
                    <h1 className="text-3xl font-medium tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white/90 to-white/40 pb-1">
                        How can I help today?
                    </h1>
                    <motion.div 
                        className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: "100%", opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                    />
                </motion.div>
                <motion.p 
                    className="text-sm text-white/40"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    Type a command or ask a question
                </motion.p>
            </div>

            <motion.div 
                className="relative mt-12 backdrop-blur-2xl bg-white/[0.02] rounded-2xl border border-white/[0.05] shadow-2xl"
                initial={{ scale: 0.98 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1 }}
            >
                {/* Textarea and send button for compact view */}
                <div className="p-4">
                    <Textarea
                        ref={textareaRef}
                        value={value}
                        onChange={(e) => {
                            setValue(e.target.value);
                            adjustHeight();
                        }}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setInputFocused(true)}
                        onBlur={() => setInputFocused(false)}
                        placeholder="Ask zap a question..."
                        containerClassName="w-full"
                        className={cn(
                            "w-full px-4 py-3",
                            "resize-none",
                            "bg-transparent",
                            "border-none",
                            "text-white/90 text-sm",
                            "focus:outline-none",
                            "placeholder:text-white/20",
                            "min-h-[60px]"
                        )}
                        style={{
                            overflow: "hidden",
                        }}
                        showRing={false}
                    />
                </div>
                 <div className="p-4 border-t border-white/[0.05] flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        {/* Action buttons */}
                    </div>
                    
                    <motion.button
                        type="button"
                        onClick={handleSendMessage}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={isTyping || !value.trim()}
                        className={cn(
                            "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                            "flex items-center gap-2",
                            value.trim()
                                ? "bg-white text-[#0A0A0B] shadow-lg shadow-white/10"
                                : "bg-white/[0.05] text-white/40"
                        )}
                    >
                        {isTyping ? (
                            <LoaderIcon className="w-4 h-4 animate-[spin_2s_linear_infinite]" />
                        ) : (
                            <SendIcon className="w-4 h-4" />
                        )}
                        <span>Send</span>
                    </motion.button>
                </div>
            </motion.div>
        </motion.div>
    );

    const expandedView = (
        <motion.div 
            className="relative z-10 w-[85vw] h-[85vh] max-w-6xl flex flex-col bg-white/[0.02] rounded-2xl border border-white/[0.05] shadow-2xl backdrop-blur-md"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
        >
            <div ref={chatScrollContainerRef} className="flex-grow overflow-y-auto space-y-4 p-4">
                {isLoadingHistory && (
                    <div className="flex justify-center items-center h-full">
                        <LoaderIcon className="w-6 h-6 animate-spin text-white/50" />
                    </div>
                )}
                {!isLoadingHistory && messages.map(m => (
                    <div key={m.id} className={cn("flex", m.role === 'user' ? 'justify-end' : 'justify-start')}>
                        <div className={cn("max-w-[85%] rounded-lg px-4 py-2 text-sm whitespace-pre-wrap", m.role === "user" ? "bg-violet-500/20 text-white border border-violet-300/20" : "bg-white/10 text-white/90")}>
                            {m.content}
                        </div>
                    </div>
                ))}
                {isTyping && <div className="flex justify-start"><TypingDots /></div>}
            </div>

            <div className="flex-shrink-0 border-t border-white/[0.05] p-2 sm:p-4">
                <div className="relative rounded-lg bg-black/20 border border-white/10">
                    <Textarea
                        ref={textareaRef}
                        value={value}
                        onChange={(e) => {
                            setValue(e.target.value);
                            adjustHeight();
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask zap a question..."
                        containerClassName="w-full"
                        className="w-full p-4 pr-20 bg-transparent resize-none text-white/90 focus:outline-none"
                        rows={1}
                        showRing={false}
                    />
                    <div className="absolute bottom-3 right-3 flex items-center gap-2">
                        <motion.button
                            type="button"
                            onClick={handleAttachFile}
                            className="p-2 text-white/40 hover:text-white/90 rounded-lg transition-colors"
                        >
                            <Paperclip className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                            type="button"
                            onClick={handleSendMessage}
                            disabled={isTyping || !value.trim()}
                            className={cn(
                                "p-2 rounded-lg text-sm font-medium transition-all",
                                "flex items-center justify-center",
                                "bg-white text-[#0A0A0B] shadow-lg shadow-white/10",
                                "h-8 w-8" 
                            )}
                        >
                            {isTyping ? (
                                <LoaderIcon className="w-4 h-4 animate-[spin_2s_linear_infinite]" />
                            ) : (
                                <SendIcon className="w-4 h-4" />
                            )}
                        </motion.button>
                    </div>
                </div>
            </div>
        </motion.div>
    );

    return (
        <div className="min-h-screen flex flex-col w-full items-center justify-center bg-transparent text-white p-6 relative overflow-hidden">
            <div className="absolute inset-0 w-full h-full overflow-hidden">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full mix-blend-normal filter blur-[128px] animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full mix-blend-normal filter blur-[128px] animate-pulse delay-700" />
                <div className="absolute top-1/4 right-1/3 w-64 h-64 bg-fuchsia-500/10 rounded-full mix-blend-normal filter blur-[96px] animate-pulse delay-1000" />
            </div>

            <AnimatePresence mode="wait">
                {isExpanded || messages.length > 0 ? expandedView : compactView}
            </AnimatePresence>

            {inputFocused && (
                <motion.div 
                    className="fixed w-[50rem] h-[50rem] rounded-full pointer-events-none z-0 opacity-[0.02] bg-gradient-to-r from-violet-500 via-fuchsia-500 to-indigo-500 blur-[96px]"
                    animate={{
                        x: mousePosition.x - 400,
                        y: mousePosition.y - 400,
                    }}
                    transition={{
                        type: "spring",
                        damping: 25,
                        stiffness: 150,
                        mass: 0.5,
                    }}
                />
            )}

            {/* Confidence Indicator */}
            <AnimatePresence>
              {isExpanded && confidenceLevel > 0 && (
                  <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="absolute top-8 right-8 z-20"
                  >
                      <div className="bg-black/40 backdrop-blur-md rounded-lg px-4 py-2 border border-white/10">
                          <div className="flex items-center gap-3">
                              <span className="text-sm text-white/70">Project Clarity</span>
                              <div className="flex items-center gap-2">
                                  <div className="w-16 h-2 bg-white/20 rounded-full overflow-hidden">
                                      <motion.div 
                                          className={`h-full rounded-full ${
                                              confidenceLevel >= 80 ? 'bg-green-500' :
                                              confidenceLevel >= 60 ? 'bg-yellow-500' :
                                              confidenceLevel >= 40 ? 'bg-orange-500' : 'bg-red-500'
                                          }`}
                                          initial={{ width: 0 }}
                                          animate={{ width: `${confidenceLevel}%` }}
                                          transition={{ duration: 0.5, ease: "easeOut" }}
                                      />
                                  </div>
                                  <span className={`text-sm font-medium ${
                                      confidenceLevel >= 80 ? 'text-green-400' :
                                      confidenceLevel >= 60 ? 'text-yellow-400' :
                                      confidenceLevel >= 40 ? 'text-orange-400' : 'text-red-400'
                                  }`}>
                                      {confidenceLevel}%
                                  </span>
                              </div>
                          </div>
                      </div>
                  </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {isExpanded && showNextButton && (
                  <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      className="absolute bottom-20 right-8 z-20"
                  >
                      <Button onClick={handleNext} className="bg-violet-600 hover:bg-violet-700">
                          Next: Tech Stack <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                  </motion.div>
              )}
            </AnimatePresence>
        </div>
    );
}

function TypingDots() {
    return (
        <div className="flex items-center ml-1">
            {[1, 2, 3].map((dot) => (
                <motion.div
                    key={dot}
                    className="w-1.5 h-1.5 bg-white/90 rounded-full mx-0.5"
                    initial={{ opacity: 0.3 }}
                    animate={{ 
                        opacity: [0.3, 0.9, 0.3],
                        scale: [0.85, 1.1, 0.85]
                    }}
                    transition={{
                        duration: 1.2,
                        repeat: Infinity,
                        delay: dot * 0.15,
                        ease: "easeInOut",
                    }}
                    style={{
                        boxShadow: "0 0 4px rgba(255, 255, 255, 0.3)"
                    }}
                />
            ))}
        </div>
    );
}

interface ActionButtonProps {
    icon: React.ReactNode;
    label: string;
}

function ActionButton({ icon, label }: ActionButtonProps) {
    const [isHovered, setIsHovered] = useState(false);
    
    return (
        <motion.button
            type="button"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 rounded-full border border-neutral-800 text-neutral-400 hover:text-white transition-all relative overflow-hidden group"
        >
            <div className="relative z-10 flex items-center gap-2">
                {icon}
                <span className="text-xs relative z-10">{label}</span>
            </div>
            
            <AnimatePresence>
                {isHovered && (
                    <motion.div 
                        className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-indigo-500/10"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    />
                )}
            </AnimatePresence>
            
            <motion.span 
                className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-violet-500 to-indigo-500"
                initial={{ width: 0 }}
                whileHover={{ width: "100%" }}
                transition={{ duration: 0.3 }}
            />
        </motion.button>
    );
}

const rippleKeyframes = `
@keyframes ripple {
  0% { transform: scale(0.5); opacity: 0.6; }
  100% { transform: scale(2); opacity: 0; }
}
`;

if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.innerHTML = rippleKeyframes;
    document.head.appendChild(style);
}
