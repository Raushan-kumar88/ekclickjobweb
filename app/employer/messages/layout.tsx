import type { ReactNode } from "react";
import { MessageSquareIcon } from "lucide-react";
import { ConversationList } from "@/components/messaging/ConversationList";

export default function EmployerMessagesLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4 overflow-hidden">
      {/* Sidebar — conversation list */}
      <aside className="hidden w-72 shrink-0 flex-col rounded-xl border bg-background overflow-hidden lg:flex">
        <div className="flex items-center gap-2 border-b px-4 py-3.5">
          <MessageSquareIcon className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-sm">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          <ConversationList basePath="/employer/messages" />
        </div>
      </aside>

      <main className="min-w-0 flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
