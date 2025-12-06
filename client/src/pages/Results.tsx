import { useState } from "react";
import { trpc } from "../lib/trpc";

export default function Results() {
  const utils = trpc.useUtils();
  const [filters, setFilters] = useState<{ status?: "ACTIVE" | "DECLINED" | "ERROR"; country?: string }>({});
  const [selected, setSelected] = useState<number[]>([]);

  const { data, isLoading } = trpc.results.list.useQuery({ ...filters, limit: 100 });
  const { data: countries } = trpc.results.countries.useQuery();

  const deleteMutation = trpc.results.delete.useMutation({ onSuccess: () => utils.results.list.invalidate() });
  const deleteManyMutation = trpc.results.deleteMany.useMutation({ onSuccess: () => { utils.results.list.invalidate(); setSelected([]); } });

  const exportCSV = () => {
    if (!data?.results) return;
    const headers = ["Card Number", "Expiry", "CVV", "Status", "Bank", "Country", "Date"];
    const rows = data.results.map(r => [r.cardNumber, `${r.expiryMonth}/${r.expiryYear}`, r.cvv || "", r.status, r.bank || "", r.country || "", new Date(r.createdAt).toLocaleString()]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `results_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const activeCount = data?.results?.filter(r => r.status === "ACTIVE").length || 0;
  const declinedCount = data?.results?.filter(r => r.status === "DECLINED").length || 0;

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
            نتائج الفحص
          </h1>
          <p className="text-slate-400 mt-1">عرض وإدارة نتائج فحص البطاقات</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center">
            <span className="text-2xl">📊</span>
          </div>
          <div>
            <p className="text-slate-400 text-sm">الإجمالي</p>
            <p className="text-2xl font-bold text-white">{data?.total || 0}</p>
          </div>
        </div>
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
            <span className="text-2xl">✅</span>
          </div>
          <div>
            <p className="text-slate-400 text-sm">ناجحة</p>
            <p className="text-2xl font-bold text-green-400">{activeCount}</p>
          </div>
        </div>
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
            <span className="text-2xl">❌</span>
          </div>
          <div>
            <p className="text-slate-400 text-sm">مرفوضة</p>
            <p className="text-2xl font-bold text-red-400">{declinedCount}</p>
          </div>
        </div>
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
            <span className="text-2xl">📈</span>
          </div>
          <div>
            <p className="text-slate-400 text-sm">نسبة النجاح</p>
            <p className="text-2xl font-bold text-amber-400">
              {data?.total ? Math.round((activeCount / data.total) * 100) : 0}%
            </p>
          </div>
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex flex-wrap gap-3">
          <select 
            value={filters.status || ""} 
            onChange={(e) => setFilters({ ...filters, status: e.target.value as any || undefined })} 
            className="px-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:border-primary/50"
          >
            <option value="">جميع الحالات</option>
            <option value="ACTIVE">ناجحة</option>
            <option value="DECLINED">مرفوضة</option>
            <option value="ERROR">خطأ</option>
          </select>
          <select 
            value={filters.country || ""} 
            onChange={(e) => setFilters({ ...filters, country: e.target.value || undefined })} 
            className="px-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:border-primary/50"
          >
            <option value="">جميع الدول</option>
            {countries?.map(c => <option key={c} value={c!}>{c}</option>)}
          </select>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={exportCSV} 
            className="flex items-center gap-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 px-4 py-2.5 rounded-xl transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            تصدير CSV
          </button>
          {selected.length > 0 && (
            <button 
              onClick={() => { if (confirm(`هل تريد حذف ${selected.length} نتيجة؟`)) deleteManyMutation.mutate({ ids: selected }); }} 
              className="flex items-center gap-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 px-4 py-2.5 rounded-xl transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              حذف ({selected.length})
            </button>
          )}
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-900/50">
                <th className="px-4 py-4 text-right">
                  <input 
                    type="checkbox" 
                    checked={selected.length === data?.results?.length && data?.results?.length > 0} 
                    onChange={(e) => setSelected(e.target.checked ? data?.results?.map(r => r.id) || [] : [])} 
                    className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-primary focus:ring-primary/50" 
                  />
                </th>
                <th className="px-4 py-4 text-right text-sm font-medium text-slate-400">رقم البطاقة</th>
                <th className="px-4 py-4 text-right text-sm font-medium text-slate-400">الانتهاء</th>
                <th className="px-4 py-4 text-right text-sm font-medium text-slate-400">CVV</th>
                <th className="px-4 py-4 text-right text-sm font-medium text-slate-400">الحالة</th>
                <th className="px-4 py-4 text-right text-sm font-medium text-slate-400">البنك</th>
                <th className="px-4 py-4 text-right text-sm font-medium text-slate-400">الدولة</th>
                <th className="px-4 py-4 text-right text-sm font-medium text-slate-400">التاريخ</th>
                <th className="px-4 py-4 text-right text-sm font-medium text-slate-400">إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-slate-400">جاري التحميل...</span>
                    </div>
                  </td>
                </tr>
              ) : data?.results?.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center">
                        <span className="text-3xl">💳</span>
                      </div>
                      <span className="text-slate-400">لا توجد نتائج</span>
                    </div>
                  </td>
                </tr>
              ) : data?.results?.map((r) => (
                <tr key={r.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3">
                    <input 
                      type="checkbox" 
                      checked={selected.includes(r.id)} 
                      onChange={(e) => setSelected(e.target.checked ? [...selected, r.id] : selected.filter(id => id !== r.id))} 
                      className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-primary focus:ring-primary/50" 
                    />
                  </td>
                  <td className="px-4 py-3 font-mono text-white">{r.cardNumber}</td>
                  <td className="px-4 py-3 text-slate-300">{r.expiryMonth}/{r.expiryYear}</td>
                  <td className="px-4 py-3 text-slate-300">{r.cvv || "-"}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
                      r.status === "ACTIVE" ? "bg-green-500/20 text-green-400" : 
                      r.status === "DECLINED" ? "bg-red-500/20 text-red-400" : 
                      "bg-amber-500/20 text-amber-400"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        r.status === "ACTIVE" ? "bg-green-400" : 
                        r.status === "DECLINED" ? "bg-red-400" : 
                        "bg-amber-400"
                      }`}></span>
                      {r.status === "ACTIVE" ? "ناجحة" : r.status === "DECLINED" ? "مرفوضة" : "خطأ"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400">{r.bank || "-"}</td>
                  <td className="px-4 py-3 text-slate-400">{r.country || "-"}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{new Date(r.createdAt).toLocaleString('ar-SA')}</td>
                  <td className="px-4 py-3">
                    <button 
                      onClick={() => { if (confirm("هل تريد حذف هذه النتيجة؟")) deleteMutation.mutate({ id: r.id }); }} 
                      className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {data && (
          <div className="px-6 py-4 border-t border-slate-700/50 bg-slate-900/30 flex items-center justify-between">
            <span className="text-slate-400 text-sm">إجمالي النتائج: <span className="text-white font-medium">{data.total}</span></span>
          </div>
        )}
      </div>
    </div>
  );
}
