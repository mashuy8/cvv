import { trpc } from "../lib/trpc";

export default function Logs() {
  const utils = trpc.useUtils();
  const { data: logs, isLoading } = trpc.activityLogs.list.useQuery({ limit: 200 });
  const clearMutation = trpc.activityLogs.clear.useMutation({ onSuccess: () => utils.activityLogs.list.invalidate() });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-primary">Activity Logs</h2>
        <button onClick={() => { if (confirm("Clear all logs?")) clearMutation.mutate(); }} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg">
          Clear All
        </button>
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-900">
            <tr>
              <th className="px-4 py-3 text-left text-slate-400">Time</th>
              <th className="px-4 py-3 text-left text-slate-400">Action</th>
              <th className="px-4 py-3 text-left text-slate-400">Details</th>
              <th className="px-4 py-3 text-left text-slate-400">IP Address</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-400">Loading...</td></tr>
            ) : logs?.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-400">No logs found</td></tr>
            ) : logs?.map((log) => (
              <tr key={log.id} className="border-t border-slate-700 hover:bg-slate-800/50">
                <td className="px-4 py-3 text-slate-400">{new Date(log.createdAt).toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs ${
                    log.action.includes("SUCCESS") || log.action.includes("login") ? "bg-green-500/20 text-green-400" :
                    log.action.includes("FAILED") || log.action.includes("delete") ? "bg-red-500/20 text-red-400" :
                    "bg-blue-500/20 text-blue-400"
                  }`}>
                    {log.action}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-300">{log.details || "-"}</td>
                <td className="px-4 py-3 text-slate-400 font-mono text-xs">{log.ipAddress || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
