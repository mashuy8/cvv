import { trpc } from "../lib/trpc";

export default function Logs() {
  const utils = trpc.useUtils();
  const { data: logs, isLoading } = trpc.activityLogs.list.useQuery({ limit: 200 });
  const clearMutation = trpc.activityLogs.clear.useMutation({ onSuccess: () => utils.activityLogs.list.invalidate() });

  const getActionIcon = (action: string) => {
    if (action.includes("login")) return "🔐";
    if (action.includes("logout")) return "🚪";
    if (action.includes("create") || action.includes("SUCCESS")) return "✅";
    if (action.includes("delete") || action.includes("FAILED")) return "❌";
    if (action.includes("update")) return "✏️";
    if (action.includes("check")) return "💳";
    return "📝";
  };

  const getActionColor = (action: string) => {
    if (action.includes("SUCCESS") || action.includes("login") || action.includes("create")) 
      return "bg-green-500/20 text-green-400 border-green-500/30";
    if (action.includes("FAILED") || action.includes("delete") || action.includes("error")) 
      return "bg-red-500/20 text-red-400 border-red-500/30";
    if (action.includes("update")) 
      return "bg-amber-500/20 text-amber-400 border-amber-500/30";
    return "bg-blue-500/20 text-blue-400 border-blue-500/30";
  };

  const loginCount = logs?.filter(l => l.action.includes("login")).length || 0;
  const successCount = logs?.filter(l => l.action.includes("SUCCESS")).length || 0;
  const failedCount = logs?.filter(l => l.action.includes("FAILED")).length || 0;

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
            سجل النشاط
          </h1>
          <p className="text-slate-400 mt-1">متابعة جميع الأنشطة والعمليات في النظام</p>
        </div>
        <button 
          onClick={() => { if (confirm("هل تريد مسح جميع السجلات؟")) clearMutation.mutate(); }} 
          disabled={clearMutation.isPending}
          className="flex items-center gap-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 px-5 py-2.5 rounded-xl transition-colors disabled:opacity-50"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          {clearMutation.isPending ? "جاري المسح..." : "مسح الكل"}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center">
            <span className="text-2xl">📋</span>
          </div>
          <div>
            <p className="text-slate-400 text-sm">إجمالي السجلات</p>
            <p className="text-2xl font-bold text-white">{logs?.length || 0}</p>
          </div>
        </div>
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
            <span className="text-2xl">🔐</span>
          </div>
          <div>
            <p className="text-slate-400 text-sm">تسجيلات الدخول</p>
            <p className="text-2xl font-bold text-blue-400">{loginCount}</p>
          </div>
        </div>
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
            <span className="text-2xl">✅</span>
          </div>
          <div>
            <p className="text-slate-400 text-sm">عمليات ناجحة</p>
            <p className="text-2xl font-bold text-green-400">{successCount}</p>
          </div>
        </div>
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
            <span className="text-2xl">❌</span>
          </div>
          <div>
            <p className="text-slate-400 text-sm">عمليات فاشلة</p>
            <p className="text-2xl font-bold text-red-400">{failedCount}</p>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-900/50">
                <th className="px-6 py-4 text-right text-sm font-medium text-slate-400">الوقت</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-slate-400">الإجراء</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-slate-400">التفاصيل</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-slate-400">عنوان IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-slate-400">جاري التحميل...</span>
                    </div>
                  </td>
                </tr>
              ) : logs?.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center">
                        <span className="text-3xl">📝</span>
                      </div>
                      <span className="text-slate-400">لا توجد سجلات</span>
                    </div>
                  </td>
                </tr>
              ) : logs?.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-lg">
                        {getActionIcon(log.action)}
                      </div>
                      <div>
                        <p className="text-white text-sm">{new Date(log.createdAt).toLocaleDateString('ar-SA')}</p>
                        <p className="text-slate-500 text-xs">{new Date(log.createdAt).toLocaleTimeString('ar-SA')}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border ${getActionColor(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-slate-300 max-w-md truncate">{log.details || "-"}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs text-slate-400 bg-slate-800/50 px-2 py-1 rounded">
                      {log.ipAddress || "-"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {logs && logs.length > 0 && (
          <div className="px-6 py-4 border-t border-slate-700/50 bg-slate-900/30">
            <span className="text-slate-400 text-sm">عرض <span className="text-white font-medium">{logs.length}</span> سجل</span>
          </div>
        )}
      </div>
    </div>
  );
}
