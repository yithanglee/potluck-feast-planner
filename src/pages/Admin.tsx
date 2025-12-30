import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import EventHeader from "@/components/EventHeader";
import { useGoogleSheets, Signup } from "@/hooks/useGoogleSheets";

type Editable = Pick<Signup, "userName" | "notes">;

const ADMIN_TOKEN_STORAGE_KEY = "potluck_admin_token";

function getStoredAdminToken() {
  return localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY) || "";
}

const Admin = () => {
  const { loading, error, getSignups, removeSignup, updateSignup, setAdminToken } = useGoogleSheets();
  const [signups, setSignups] = useState<Signup[]>([]);
  const [filter, setFilter] = useState("");

  const [adminTokenInput, setAdminTokenInput] = useState(getStoredAdminToken());

  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [draft, setDraft] = useState<Editable>({ userName: "", notes: "" });

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return signups;
    return signups.filter((s) => {
      const haystack = [
        s.category,
        s.item,
        String(s.slot),
        s.userEmail,
        s.userName,
        s.notes,
        s.timestamp,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [filter, signups]);

  const refresh = async () => {
    const data = await getSignups();
    setSignups(data);
  };

  useEffect(() => {
    // Initialize admin token for API calls (if provided).
    const token = adminTokenInput.trim();
    if (token) setAdminToken(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    refresh().catch((e) => {
      console.error(e);
      toast.error(e instanceof Error ? e.message : "Failed to load signups");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const keyOf = (s: Signup) => `${s.category}::${s.item}::${s.slot}`;

  const beginEdit = (s: Signup) => {
    setEditingKey(keyOf(s));
    setDraft({ userName: s.userName, notes: s.notes });
  };

  const cancelEdit = () => {
    setEditingKey(null);
    setDraft({ userName: "", notes: "" });
  };

  const saveEdit = async (s: Signup) => {
    await updateSignup(s.category, s.item, s.slot, {
      user_name: draft.userName,
      notes: draft.notes,
    });
    toast.success("已更新");
    cancelEdit();
    refresh();
  };

  const doDelete = async (s: Signup) => {
    await removeSignup(s.category, s.item, s.slot, s.userEmail);
    toast.success("已删除");
    refresh();
  };

  const saveAdminToken = () => {
    const token = adminTokenInput.trim();
    localStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, token);
    setAdminToken(token);
    toast.success(token ? "Admin token saved" : "Admin token cleared");
  };

  return (
    <div className="min-h-screen gradient-sky">
      <EventHeader />

      <main className="container mx-auto px-4 pb-12 pt-6 max-w-5xl">
        <div className="card-picnic p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-xl font-display font-bold text-foreground">Admin</h2>
              <p className="text-sm text-muted-foreground mt-1">
                管理报名记录（编辑/删除）
              </p>
            </div>

            <Button asChild variant="outline" size="sm">
              <Link to="/">返回主页</Link>
            </Button>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <Input
              placeholder="搜索（类别/食物/名字/备注/时间）"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
            <Input
              placeholder="Admin token (optional)"
              value={adminTokenInput}
              onChange={(e) => setAdminTokenInput(e.target.value)}
            />
            <div className="flex gap-2">
              <Button variant="secondary" onClick={saveAdminToken} className="flex-1">
                保存 Token
              </Button>
              <Button variant="outline" onClick={() => refresh()} disabled={loading}>
                刷新
              </Button>
            </div>
          </div>

          {error && (
            <div className="mt-4 bg-destructive/10 text-destructive text-sm p-3 rounded-xl">
              {error}
            </div>
          )}

          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="py-2 pr-3">类别</th>
                  <th className="py-2 pr-3">项目</th>
                  <th className="py-2 pr-3">Slot</th>
                  <th className="py-2 pr-3">用户名</th>
                  <th className="py-2 pr-3">备注</th>
                  <th className="py-2 pr-3">时间</th>
                  <th className="py-2 text-right">操作</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => {
                  const k = keyOf(s);
                  const isEditing = editingKey === k;
                  return (
                    <tr key={`${k}::${s.userEmail}`} className="border-b border-border/60 align-top">
                      <td className="py-3 pr-3 font-medium text-foreground">{s.category}</td>
                      <td className="py-3 pr-3">{s.item}</td>
                      <td className="py-3 pr-3">{s.slot}</td>
                      <td className="py-3 pr-3">
                        {isEditing ? (
                          <Input
                            value={draft.userName}
                            onChange={(e) => setDraft((d) => ({ ...d, userName: e.target.value }))}
                          />
                        ) : (
                          s.userName
                        )}
                      </td>
                      <td className="py-3 pr-3 min-w-[260px]">
                        {isEditing ? (
                          <Input
                            value={draft.notes}
                            onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))}
                          />
                        ) : (
                          <span className="text-muted-foreground">{s.notes || "-"}</span>
                        )}
                      </td>
                      <td className="py-3 pr-3 text-muted-foreground whitespace-nowrap">{s.timestamp}</td>
                      <td className="py-3 text-right">
                        {isEditing ? (
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="secondary" onClick={() => saveEdit(s)} disabled={loading}>
                              保存
                            </Button>
                            <Button size="sm" variant="outline" onClick={cancelEdit} disabled={loading}>
                              取消
                            </Button>
                          </div>
                        ) : (
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="outline" onClick={() => beginEdit(s)} disabled={loading}>
                              编辑
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => doDelete(s)}
                              disabled={loading}
                            >
                              删除
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted-foreground">
                      没有记录
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Admin;


