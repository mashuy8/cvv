import { useState } from "react";
import { trpc } from "../lib/trpc";

// دالة للتعرف على نوع البطاقة من رقمها
const getCardType = (cardNumber: string): { type: string; name: string; color: string } => {
  const num = cardNumber.replace(/\s/g, '');
  
  // Visa: يبدأ بـ 4
  if (/^4/.test(num)) {
    return { type: 'visa', name: 'Visa', color: '#1A1F71' };
  }
  
  // Mastercard: يبدأ بـ 51-55 أو 2221-2720
  if (/^5[1-5]/.test(num) || /^2[2-7]/.test(num)) {
    return { type: 'mastercard', name: 'Mastercard', color: '#EB001B' };
  }
  
  // American Express: يبدأ بـ 34 أو 37
  if (/^3[47]/.test(num)) {
    return { type: 'amex', name: 'Amex', color: '#006FCF' };
  }
  
  // Discover: يبدأ بـ 6011, 644-649, 65
  if (/^6011|^64[4-9]|^65/.test(num)) {
    return { type: 'discover', name: 'Discover', color: '#FF6000' };
  }
  
  // JCB: يبدأ بـ 3528-3589
  if (/^35(2[89]|[3-8])/.test(num)) {
    return { type: 'jcb', name: 'JCB', color: '#0B4EA2' };
  }
  
  // Diners Club: يبدأ بـ 300-305, 36, 38
  if (/^3(?:0[0-5]|[68])/.test(num)) {
    return { type: 'diners', name: 'Diners', color: '#004A97' };
  }
  
  // UnionPay: يبدأ بـ 62
  if (/^62/.test(num)) {
    return { type: 'unionpay', name: 'UnionPay', color: '#D8232A' };
  }
  
  return { type: 'unknown', name: 'Unknown', color: '#6B7280' };
};

// مكون أيقونة البطاقة
const CardIcon = ({ cardNumber }: { cardNumber: string }) => {
  const card = getCardType(cardNumber);
  
  const icons: Record<string, JSX.Element> = {
    visa: (
      <svg viewBox="0 0 48 48" className="w-8 h-6">
        <rect width="48" height="48" rx="4" fill="#1A1F71"/>
        <path d="M19.5 31h-3.2l2-12.3h3.2l-2 12.3zm13.3-12c-.6-.3-1.6-.5-2.9-.5-3.2 0-5.4 1.7-5.4 4.1 0 1.8 1.6 2.8 2.8 3.4 1.2.6 1.6 1 1.6 1.5 0 .8-1 1.2-1.9 1.2-1.2 0-1.9-.2-2.9-.6l-.4-.2-.4 2.6c.7.3 2.1.6 3.5.6 3.4 0 5.6-1.7 5.6-4.2 0-1.4-.8-2.5-2.7-3.4-1.1-.6-1.8-.9-1.8-1.5 0-.5.6-1 1.8-1 1 0 1.8.2 2.4.5l.3.1.4-2.6zm8.4-.3h-2.5c-.8 0-1.4.2-1.7 1l-4.8 11.3h3.4l.7-1.9h4.1l.4 1.9h3l-2.6-12.3zm-4.2 8l1.3-3.5.4-1.1.2 1 .8 3.6h-2.7zM15.4 18.7l-3 8.4-.3-1.6c-.6-1.9-2.3-4-4.3-5l2.9 10.5h3.4l5.1-12.3h-3.8z" fill="white"/>
      </svg>
    ),
    mastercard: (
      <svg viewBox="0 0 48 48" className="w-8 h-6">
        <rect width="48" height="48" rx="4" fill="#000"/>
        <circle cx="18" cy="24" r="10" fill="#EB001B"/>
        <circle cx="30" cy="24" r="10" fill="#F79E1B"/>
        <path d="M24 16.5a10 10 0 000 15 10 10 0 000-15z" fill="#FF5F00"/>
      </svg>
    ),
    amex: (
      <svg viewBox="0 0 48 48" className="w-8 h-6">
        <rect width="48" height="48" rx="4" fill="#006FCF"/>
        <path d="M8 28h4l.8-2h1.8l.8 2h8v-1.5l.7 1.5h4.2l.7-1.5V28h16v-8H29.3l-.7 1.5V20h-4.2l-.7 1.5-.7-1.5H8v8zm3.5-6.5h2.2l2.5 5.7v-5.7h2.4l1.9 4 1.8-4h2.4v6.5h-1.5l-.1-5.1-2.2 5.1h-1.4l-2.2-5.1v5.1h-3l-.8-2h-4.2l-.8 2H8l3.5-6.5zm1.1 3.3h2.4l-1.2-2.9-1.2 2.9z" fill="white"/>
      </svg>
    ),
    discover: (
      <svg viewBox="0 0 48 48" className="w-8 h-6">
        <rect width="48" height="48" rx="4" fill="#FF6000"/>
        <ellipse cx="24" cy="24" rx="8" ry="8" fill="white"/>
        <text x="24" y="28" textAnchor="middle" fontSize="8" fill="#FF6000" fontWeight="bold">D</text>
      </svg>
    ),
    jcb: (
      <svg viewBox="0 0 48 48" className="w-8 h-6">
        <rect width="48" height="48" rx="4" fill="white"/>
        <rect x="8" y="12" width="10" height="24" rx="2" fill="#0B4EA2"/>
        <rect x="19" y="12" width="10" height="24" rx="2" fill="#E4002B"/>
        <rect x="30" y="12" width="10" height="24" rx="2" fill="#009B3A"/>
      </svg>
    ),
    diners: (
      <svg viewBox="0 0 48 48" className="w-8 h-6">
        <rect width="48" height="48" rx="4" fill="#004A97"/>
        <circle cx="24" cy="24" r="12" fill="white"/>
        <circle cx="20" cy="24" r="8" fill="none" stroke="#004A97" strokeWidth="2"/>
        <circle cx="28" cy="24" r="8" fill="none" stroke="#004A97" strokeWidth="2"/>
      </svg>
    ),
    unionpay: (
      <svg viewBox="0 0 48 48" className="w-8 h-6">
        <rect width="48" height="48" rx="4" fill="#D8232A"/>
        <path d="M12 12h8l4 24h-8l-4-24z" fill="#00447C"/>
        <path d="M22 12h8l4 24h-8l-4-24z" fill="#D8232A"/>
        <path d="M32 12h8l-4 24h-8l4-24z" fill="#00447C"/>
      </svg>
    ),
    unknown: (
      <svg viewBox="0 0 48 48" className="w-8 h-6">
        <rect width="48" height="48" rx="4" fill="#6B7280"/>
        <rect x="8" y="16" width="32" height="4" rx="1" fill="white" opacity="0.5"/>
        <rect x="8" y="24" width="20" height="3" rx="1" fill="white" opacity="0.3"/>
        <rect x="8" y="30" width="12" height="3" rx="1" fill="white" opacity="0.3"/>
      </svg>
    ),
  };
  
  return (
    <div className="flex items-center gap-2" title={card.name}>
      {icons[card.type]}
      <span className="text-xs text-slate-400">{card.name}</span>
    </div>
  );
};

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
    const headers = ["Card Number", "Card Type", "Expiry", "CVV", "Status", "Bank", "Country", "Date"];
    const rows = data.results.map(r => [
      r.cardNumber, 
      getCardType(r.cardNumber).name,
      `${r.expiryMonth}/${r.expiryYear}`, 
      r.cvv || "", 
      r.status, 
      r.bank || "", 
      r.country || "", 
      new Date(r.createdAt).toLocaleString()
    ]);
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
                <th className="px-4 py-4 text-right text-sm font-medium text-slate-400">نوع البطاقة</th>
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
                  <td colSpan={10} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-slate-400">جاري التحميل...</span>
                    </div>
                  </td>
                </tr>
              ) : data?.results?.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center">
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
                  <td className="px-4 py-3">
                    <CardIcon cardNumber={r.cardNumber} />
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
