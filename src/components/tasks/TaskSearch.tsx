import { useState, type FormEvent } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

/** Keyword search box; submits the query to the parent. */
export function TaskSearch({ initial, onSearch }: { initial: string; onSearch: (q: string) => void }) {
  const [q, setQ] = useState(initial);
  function submit(e: FormEvent) {
    e.preventDefault();
    onSearch(q.trim());
  }
  return (
    <form onSubmit={submit} role="search" className="flex gap-2">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search tasks by keyword…" aria-label="Search tasks" className="pl-9" />
      </div>
      <Button type="submit">Search</Button>
    </form>
  );
}
