import { useState, type FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ShieldPlus } from "lucide-react";
import { toast } from "sonner";
import { createFirstAdmin, getAdminSetupStatus } from "@/lib/first-admin.functions";
import { FormError } from "@/components/auth/AuthCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

/** Shows "Create Admin User" only until the first admin exists. */
export function FirstAdminSetup() {
  const status = useServerFn(getAdminSetupStatus);
  const create = useServerFn(createFirstAdmin);
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["admin-setup"], queryFn: () => status() });
  const [open, setOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!data || data.adminExists) return null;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) return setError("Password must be at least 8 characters.");
    setBusy(true);
    try {
      await create({ data: { fullName, email, password } });
      toast.success("Admin created. You can now sign in with it.");
      setOpen(false);
      qc.setQueryData(["admin-setup"], { adminExists: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create admin.");
      qc.invalidateQueries({ queryKey: ["admin-setup"] });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto mt-6 flex w-[min(1280px,94%)] justify-end">
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
        <ShieldPlus className="size-4" /> Create Admin User
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create the first admin</DialogTitle>
            <DialogDescription>This can be done only once.</DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="a-name">Full name</Label>
              <Input id="a-name" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="a-email">Email</Label>
              <Input id="a-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="a-pass">Password</Label>
              <Input id="a-pass" type="password" autoComplete="new-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <FormError message={error} />
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? "Creating…" : "Create admin"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
