import { useState } from "react";
import { trpc } from "../lib/trpc";

export default function Users() {
  const utils = trpc.useUtils();
  const { data: users, isLoading } = trpc.scriptUsers.list.useQuery();
  const [showCreate, setShowCreate] = useState(false);
  const [newUser, setNewUser] = useState({ username: "", password: "", maxDailyChecks: 1000, expiresAt: "" });

  const createMutation = trpc.scriptUsers.create.useMutation({
    onSuccess: () => { utils.scriptUsers.list.invalidate(); setShowCreate(false); setNewUser({ username: "", password: "", maxDailyChecks: 1000, expiresAt: "" }); },
  });

  const deleteMutation = trpc.scriptUsers.delete.useMutation({
    onSuccess: () => utils.scriptUsers.list.invalidate(),
  });

  const toggleMutation = trpc.scriptUsers.update.useMutation({
    onSuccess: () => utils.scriptUsers.list.invalidate(),
  });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-primary">Script Users</h2>
        <button onClick={() => setShowCreate(true)} className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg">
          + Add User
        </button>
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-900 p-6 rounded-xl w-full max-w-md border border-slate-700">
            <h3 className="text-xl font-bold mb-4">Create New User</h3>
            <div className="space-y-4">
              <input type="text" placeholder="Username" value={newUser.username} onChange={(e) => setNewUser({ ...newUser, username: e.target.value })} className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white" />
              <input type="password" placeholder="Password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white" />
              <input type="number" placeholder="Max Daily Checks" value={newUser.maxDailyChecks} onChange={(e) => setNewUser({ ...newUser, maxDailyChecks: parseInt(e.target.value) })} className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white" />
              <input type="datetime-local" placeholder="Expires At" value={newUser.expiresAt} onChange={(e) => setNewUser({ ...newUser, expiresAt: e.target.value })} className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white" />
              <div className="flex gap-2">
                <button onClick={() => setShowCreate(false)} className="flex-1 bg-slate-700 text-white px-4 py-2 rounded-lg">Cancel</button>
                <button onClick={() => createMutation.mutate(newUser)} disabled={createMutation.isPending} className="flex-1 bg-primary text-white px-4 py-2 rounded-lg">
                  {createMutation.isPending ? "Creating..." : "Create"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-900">
            <tr>
              <th className="px-4 py-3 text-left text-slate-400">Username</th>
              <th className="px-4 py-3 text-left text-slate-400">Status</th>
              <th className="px-4 py-3 text-left text-slate-400">Today/Max</th>
              <th className="px-4 py-3 text-left text-slate-400">Total</th>
              <th className="px-4 py-3 text-left text-slate-400">Success Rate</th>
              <th className="px-4 py-3 text-left text-slate-400">Expires</th>
              <th className="px-4 py-3 text-left text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-400">Loading...</td></tr>
            ) : users?.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-400">No users found</td></tr>
            ) : users?.map((user) => (
              <tr key={user.id} className="border-t border-slate-700">
                <td className="px-4 py-3 font-medium">{user.username}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs ${user.isActive ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                    {user.isActive ? "Active" : "Disabled"}
                  </span>
                </td>
                <td className="px-4 py-3">{user.todayChecks || 0} / {user.maxDailyChecks || 1000}</td>
                <td className="px-4 py-3">{user.totalChecks || 0}</td>
                <td className="px-4 py-3">
                  {user.totalChecks ? Math.round(((user.successfulChecks || 0) / user.totalChecks) * 100) : 0}%
                </td>
                <td className="px-4 py-3 text-sm text-slate-400">
                  {user.expiresAt ? new Date(user.expiresAt).toLocaleDateString() : "Never"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => toggleMutation.mutate({ id: user.id, isActive: !user.isActive })} className={`px-2 py-1 rounded text-xs ${user.isActive ? "bg-yellow-500/20 text-yellow-400" : "bg-green-500/20 text-green-400"}`}>
                      {user.isActive ? "Disable" : "Enable"}
                    </button>
                    <button onClick={() => { if (confirm("Delete this user?")) deleteMutation.mutate({ id: user.id }); }} className="px-2 py-1 rounded text-xs bg-red-500/20 text-red-400">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
