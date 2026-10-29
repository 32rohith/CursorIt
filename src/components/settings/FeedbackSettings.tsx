import React, { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

const FeedbackSettings: React.FC = () => {
  const [rating, setRating] = useState<number>(0);
  const [hover, setHover] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [recommend, setRecommend] = useState<string>("yes");
  const [feature, setFeature] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "submitted">("idle");

  const submit = async () => {
    setStatus("submitting");
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("feedback").insert({
      user_id: user?.id,
      rating,
      comment,
      recommend,
      feature_request: feature,
    });
    setStatus("submitted");
    setComment("");
  };

  return (
    <div className="space-y-4 max-w-md">
      <div>
        <label className="block text-sm text-white/70 mb-2">How satisfied are you with CursorIt?</label>
        <div className="flex gap-1">
          {[1,2,3,4,5].map((r)=>(
            <Star
              key={r}
              onClick={()=>setRating(r)}
              onMouseEnter={()=>setHover(r)}
              onMouseLeave={()=>setHover(null)}
              className={`w-6 h-6 cursor-pointer transition-colors ${ (hover!==null ? r<=hover : r<=rating) ? 'text-yellow-400 fill-yellow-400' : 'text-white/30'}`}
            />
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm text-white/70 mb-1">Additional comments</label>
        <textarea
          value={comment}
          onChange={(e)=>setComment(e.target.value)}
          rows={4}
          className="w-full rounded-lg bg-white/10 text-white px-3 py-2 focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-sm text-white/70 mb-1">Would you recommend CursorIt to a friend?</label>
        <div className="flex gap-4 text-white text-sm">
          <label className="flex items-center gap-1">
            <input
              type="radio"
              name="rec"
              value="yes"
              checked={recommend === "yes"}
              onChange={() => setRecommend("yes")}
            />
            Yes
          </label>
          <label className="flex items-center gap-1">
            <input
              type="radio"
              name="rec"
              value="no"
              checked={recommend === "no"}
              onChange={() => setRecommend("no")}
            />
            No
          </label>
        </div>
      </div>
      <div>
        <label className="block text-sm text-white/70 mb-1">Which feature would you like to see next?</label>
        <input
          type="text"
          value={feature}
          onChange={(e)=>setFeature(e.target.value)}
          className="w-full rounded-lg bg-white/10 text-white px-3 py-2 focus:outline-none"
        />
      </div>
      <Button onClick={submit} disabled={status!="idle"}>
        {status==="submitted" ? "Thank you!" : status==="submitting" ? "Submitting..." : "Submit Feedback"}
      </Button>
    </div>
  );
};

export default FeedbackSettings; 