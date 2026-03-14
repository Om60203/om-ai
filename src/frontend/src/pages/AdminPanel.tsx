import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronDown,
  ChevronRight,
  LogOut,
  MessageSquare,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useState } from "react";
import type { Conversation, UserProfile } from "../backend.d";
import { useActor } from "../hooks/useActor";

interface AdminPanelProps {
  onLogout: () => void;
}

const STATS_LABELS = ["Total Users", "Total Conversations", "Total Messages"];

function formatDate(ts: bigint): string {
  const ms = Number(ts) / 1_000_000;
  return new Date(ms).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function UserRow({
  profile,
  conversations,
  index,
}: { profile: UserProfile; conversations: Conversation[]; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <TableRow
          className="cursor-pointer hover:bg-muted/50 transition-colors"
          data-ocid={`admin.user.row.${index}`}
        >
          <TableCell>
            <div className="flex items-center gap-2">
              {open ? (
                <ChevronDown size={14} className="text-primary" />
              ) : (
                <ChevronRight size={14} className="text-muted-foreground" />
              )}
              <span className="font-medium">{profile.displayName}</span>
            </div>
          </TableCell>
          <TableCell className="text-muted-foreground font-mono text-sm">
            {profile.username}
          </TableCell>
          <TableCell className="text-muted-foreground text-sm">
            {profile.email}
          </TableCell>
          <TableCell>
            <Badge variant="secondary" className="text-xs">
              {conversations.length} chats
            </Badge>
          </TableCell>
          <TableCell className="text-muted-foreground text-sm">
            {formatDate(profile.createdDate)}
          </TableCell>
        </TableRow>
      </CollapsibleTrigger>
      <CollapsibleContent asChild>
        <TableRow>
          <TableCell colSpan={5} className="p-0">
            <div
              className="mx-4 my-2 rounded-lg p-4 space-y-3"
              style={{
                background: "oklch(0.08 0.02 220)",
                border: "1px solid oklch(0.18 0.05 185)",
              }}
            >
              {conversations.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">
                  No conversations yet.
                </p>
              ) : (
                conversations.map((conv) => (
                  <div key={conv.id.toString()} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MessageSquare size={13} className="text-primary" />
                      <span className="text-sm font-medium text-foreground">
                        {conv.title}
                      </span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {conv.messages.length} messages
                      </span>
                    </div>
                    {conv.messages.slice(0, 3).map((msg) => (
                      <div
                        key={msg.id.toString()}
                        className="flex gap-2 text-xs pl-5"
                      >
                        <span
                          className="shrink-0 px-1.5 py-0.5 rounded font-mono"
                          style={{
                            background:
                              msg.role === "user"
                                ? "oklch(0.2 0.06 185)"
                                : "oklch(0.15 0.04 120)",
                            color:
                              msg.role === "user"
                                ? "oklch(0.75 0.18 185)"
                                : "oklch(0.75 0.18 120)",
                          }}
                        >
                          {msg.role}
                        </span>
                        <span className="text-muted-foreground line-clamp-1">
                          {msg.content.substring(0, 100)}
                          {msg.content.length > 100 ? "..." : ""}
                        </span>
                      </div>
                    ))}
                    {conv.messages.length > 3 && (
                      <p className="text-xs text-muted-foreground pl-5">
                        +{conv.messages.length - 3} more messages
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </TableCell>
        </TableRow>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function AdminPanel({ onLogout }: AdminPanelProps) {
  const { actor, isFetching } = useActor();

  const { data: users = [], isLoading: usersLoading } = useQuery<UserProfile[]>(
    {
      queryKey: ["admin", "users"],
      queryFn: async () => {
        if (!actor) return [];
        return actor.getAllUsers();
      },
      enabled: !!actor && !isFetching,
    },
  );

  const { data: allConversations = [], isLoading: convsLoading } = useQuery<
    Array<[unknown, Conversation[]]>
  >({
    queryKey: ["admin", "conversations"],
    queryFn: async () => {
      if (!actor) return [];
      const raw = await actor.getAllConversations();
      return raw as Array<[unknown, Conversation[]]>;
    },
    enabled: !!actor && !isFetching,
  });

  const getUserConversations = (username: string): Conversation[] => {
    const idx = users.findIndex((u) => u.username === username);
    if (idx >= 0 && allConversations[idx])
      return allConversations[idx][1] || [];
    return [];
  };

  const totalMessages = allConversations.reduce(
    (sum, [, convs]) => sum + convs.reduce((s, c) => s + c.messages.length, 0),
    0,
  );
  const totalConvs = allConversations.reduce((s, [, c]) => s + c.length, 0);
  const isLoading = usersLoading || convsLoading;
  const statValues = [users.length, totalConvs, totalMessages];

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "oklch(0.06 0.02 220)" }}
    >
      <header
        className="flex items-center justify-between px-6 py-4"
        style={{
          borderBottom: "1px solid oklch(0.15 0.04 220)",
          background: "oklch(0.08 0.03 220)",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{
              background: "oklch(0.15 0.05 30)",
              border: "1px solid oklch(0.3 0.1 30)",
            }}
          >
            <ShieldCheck size={18} style={{ color: "oklch(0.7 0.22 30)" }} />
          </div>
          <div>
            <span
              className="font-display font-bold text-lg"
              style={{ color: "oklch(0.88 0.15 185)" }}
            >
              Om<span style={{ color: "oklch(0.65 0.22 185)" }}>.ai</span>
            </span>
            <Badge
              className="ml-2 text-xs"
              style={{
                background: "oklch(0.15 0.05 30)",
                color: "oklch(0.7 0.22 30)",
                border: "1px solid oklch(0.3 0.1 30)",
              }}
            >
              ADMIN
            </Badge>
          </div>
        </div>
        <Button
          onClick={onLogout}
          variant="ghost"
          size="sm"
          className="gap-2 text-muted-foreground hover:text-foreground"
          data-ocid="admin.secondary_button"
        >
          <LogOut size={16} /> Logout
        </Button>
      </header>

      <div className="flex-1 p-6 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-3 gap-4 mb-8">
          {STATS_LABELS.map((label, i) => (
            <div
              key={label}
              className="rounded-xl p-4"
              style={{
                background: "oklch(0.09 0.03 220)",
                border: "1px solid oklch(0.18 0.05 185)",
              }}
            >
              <p className="text-sm text-muted-foreground">{label}</p>
              {isLoading ? (
                <Skeleton
                  className="h-8 w-16 mt-1"
                  data-ocid="admin.loading_state"
                />
              ) : (
                <p
                  className="text-3xl font-display font-bold mt-1"
                  style={{ color: "oklch(0.75 0.2 185)" }}
                >
                  {statValues[i]}
                </p>
              )}
            </div>
          ))}
        </div>

        <div
          className="rounded-xl overflow-hidden"
          style={{
            background: "oklch(0.09 0.03 220)",
            border: "1px solid oklch(0.18 0.05 185)",
          }}
        >
          <div
            className="px-6 py-4"
            style={{ borderBottom: "1px solid oklch(0.15 0.04 185)" }}
          >
            <h2
              className="font-display font-semibold text-lg"
              style={{ color: "oklch(0.85 0.1 185)" }}
            >
              Registered Users
            </h2>
            <p className="text-sm text-muted-foreground">
              Click a row to expand conversation history
            </p>
          </div>
          <ScrollArea className="h-[500px]">
            {isLoading ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : users.length === 0 ? (
              <div className="p-12 text-center" data-ocid="admin.empty_state">
                <Users
                  size={40}
                  className="mx-auto mb-3 text-muted-foreground opacity-40"
                />
                <p className="text-muted-foreground">
                  No registered users yet.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow
                    style={{ borderBottom: "1px solid oklch(0.15 0.04 185)" }}
                  >
                    <TableHead>Display Name</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Chats</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user, idx) => (
                    <UserRow
                      key={user.username}
                      profile={user}
                      conversations={getUserConversations(user.username)}
                      index={idx + 1}
                    />
                  ))}
                </TableBody>
              </Table>
            )}
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
