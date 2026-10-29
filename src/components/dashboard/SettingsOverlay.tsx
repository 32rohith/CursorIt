"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  User,
  CreditCard,
  Gift,
} from "lucide-react";
import ProfileSettings from "@/components/settings/ProfileSettings";
import BillingPlanSettings from "@/components/settings/BillingPlanSettings";
import ReferFriendSettings from "@/components/settings/ReferFriendSettings";
import FeedbackSettings from "@/components/settings/FeedbackSettings";

interface SettingsOverlayProps {
  onClose: () => void;
}

const SettingsSection: React.FC<{
  id?: string;
  title: string;
  description: string;
  children?: React.ReactNode;
}> = ({ id, title, description, children }) => (
  <section id={id} className="py-8 first:pt-0">
    <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur p-6 shadow-lg">
      <h2 className="text-xl font-semibold text-white mb-1">{title}</h2>
      <p className="text-sm text-white/60 mb-6">{description}</p>
      {children}
  </div>
  </section>
);

type SectionID = "profile" | "billing" | "refer" | "feedback";

const SettingsOverlay: React.FC<SettingsOverlayProps> = ({ onClose }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<SectionID>("profile");

  // Observe section visibility
  useEffect(() => {
    const container = contentRef.current;
    if (!container) return;

    const sections = Array.from(container.querySelectorAll("section[id]"));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("id") as SectionID;
            setActive(id);
          }
        });
      },
      { root: container, threshold: 0.4 }
    );
    sections.forEach((sec) => observer.observe(sec));
    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: SectionID) => {
    const el = document.getElementById(id);
    setActive(id);
    const container = contentRef.current;
    if (el && container) {
      const top = el.offsetTop - container.offsetTop;
      container.scrollTo({ top: top - 20, behavior: "smooth" });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Panel */}
      <div className="relative w-full max-w-5xl h-[90vh] rounded-2xl border border-white/10 bg-white/10 backdrop-blur-lg shadow-2xl flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-1/4 min-w-[250px] bg-white/5 backdrop-blur-lg border-r border-white/10 p-6 space-y-4">
          <h3 className="text-sm font-semibold text-white/50 px-3">Account</h3>
          <button
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${active === "profile" ? "bg-white/10 text-white" : "text-white/80 hover:bg-white/5"}`}
            onClick={() => scrollToSection("profile")}
          >
            <User className="w-5 h-5" />
            <span>Profile</span>
          </button>
          <button
            className={`w-full flex items-center gap-3 px-3 py-2 mt-2 rounded-lg transition-colors ${active === "billing" ? "bg-white/10 text-white" : "text-white/80 hover:bg-white/5"}`}
            onClick={() => scrollToSection("billing")}
          >
            <CreditCard className="w-5 h-5" />
            <span>Billing & Plan</span>
          </button>

          <button
            className={`w-full flex items-center gap-3 px-3 py-2 mt-2 rounded-lg transition-colors ${active === "refer" ? "bg-white/10 text-white" : "text-white/80 hover:bg-white/5"}`}
            onClick={() => scrollToSection("refer")}
          >
            <Gift className="w-5 h-5" />
            <span>Refer a Friend</span>
            </button>
          <button
            className={`w-full flex items-center gap-3 px-3 py-2 mt-2 rounded-lg transition-colors ${active === "feedback" ? "bg-white/10 text-white" : "text-white/80 hover:bg-white/5"}`}
            onClick={() => setActive("feedback")}
          >
            <User className="w-5 h-5" />
            <span>Feedback</span>
            </button>
        </aside>

        {/* Content */}
        <main className="flex-1 p-10 overflow-y-auto scroll-smooth">
          <header className="flex justify-between items-center mb-10">
            <h1 className="text-3xl font-bold text-white">Settings</h1>
            <button
              onClick={onClose}
              className="text-white/50 hover:text-white transition-colors"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M6 6L18 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </header>

          {active === "profile" && (
            <SettingsSection id="profile" title="Profile" description="Update your personal information.">
              <ProfileSettings />
            </SettingsSection>
          )}
          {active === "billing" && (
            <SettingsSection id="billing" title="Billing & Plan" description="Manage your subscription and payment details.">
              <BillingPlanSettings />
            </SettingsSection>
          )}
          {active === "refer" && (
            <SettingsSection id="refer" title="Refer a Friend" description="Share your referral link and earn rewards.">
              <ReferFriendSettings />
            </SettingsSection>
          )}
          {active === "feedback" && (
            <SettingsSection id="feedback" title="Feedback" description="Tell us what you think.">
              <FeedbackSettings />
            </SettingsSection>
          )}
        </main>
      </div>
    </div>
  );
};

export default SettingsOverlay;
