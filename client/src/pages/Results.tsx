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

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-primary">Card Results</h2>
        <div className="flex gap-2">
          <select value={filters.status || ""} onChange={(e) => setFilters({ ...filters, status: e.target.value as any || undefined })} className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white">
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="DECLINED">Declined</option>
            <option value="ERROR">Error</option>
          </select>
          <select value={filters.country || ""} onChange={(e) => setFilters({ ...filters, country: e.target.value || undefined })} className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white">
            <option value="">All Countries</option>
            {countries?.map(c => <option key={c} value={c!}>{c}</option>)}
          </select>
          <button onClick={exportCSV} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">Export CSV</button>
          {selected.length > 0 && (
            <button onClick={() => { if (confirm(`Delete ${selected.length} results?`)) deleteManyMutation.mutate({ ids: selected }); }} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg">
              Delete ({selected.length})
            </button>
          )}
        </div>
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-900">
            <tr>
              <th className="px-3 py-3 text-left">
                <input type="checkbox" checked={selected.length === data?.results?.length && data?.results?.length > 0} onChange={(e) => setSelected(e.target.checked ? data?.results?.map(r => r.id) || [] : [])} className="rounded" />
              </th>
              <th className="px-3 py-3 text-left text-slate-400">Card</th>
              <th className="px-3 py-3 text-left text-slate-400">Expiry</th>
              <th className="px-3 py-3 text-left text-slate-400">CVV</th>
              <th className="px-3 py-3 text-left text-slate-400">Status</th>
              <th className="px-3 py-3 text-left text-slate-400">Bank</th>
              <th className="px-3 py-3 text-left text-slate-400">Country</th>
              <th className="px-3 py-3 text-left text-slate-400">Date</th>
              <th className="px-3 py-3 text-left text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={9} className="px-4 py-8 text-center text-slate-400">Loading...</td></tr>
            ) : data?.results?.length === 0 ? (
              <tr><td colSpan={9} className="px-4 py-8 text-center text-slate-400">No results found</td></tr>
            ) : data?.results?.map((r) => (
              <tr key={r.id} className="border-t border-slate-700 hover:bg-slate-800/50">
                <td className="px-3 py-2">
                  <input type="checkbox" checked={selected.includes(r.id)} onChange={(e) => setSelected(e.target.checked ? [...selected, r.id] : selected.filter(id => id !== r.id))} className="rounded" />
                </td>
                <td className="px-3 py-2 font-mono">{r.cardNumber}</td>
                <td className="px-3 py-2">{r.expiryMonth}/{r.expiryYear}</td>
                <td className="px-3 py-2">{r.cvv || "-"}</td>
                <td className="px-3 py-2">
                  <span className={`px-2 py-1 rounded text-xs ${r.status === "ACTIVE" ? "bg-green-500/20 text-green-400" : r.status === "DECLINED" ? "bg-red-500/20 text-red-400" : "bg-yellow-500/20 text-yellow-400"}`}>
                    {r.status}
                  </span>
                </td>
                <td className="px-3 py-2 text-slate-400">{r.bank || "-"}</td>
                <td className="px-3 py-2 text-slate-400">{r.country || "-"}</td>
                <td className="px-3 py-2 text-slate-400">{new Date(r.createdAt).toLocaleString()}</td>
                <td className="px-3 py-2">
                  <button onClick={() => { if (confirm("Delete?")) deleteMutation.mutate({ id: r.id }); }} className="text-red-400 hover:text-red-300">🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data && <div className="px-4 py-3 border-t border-slate-700 text-slate-400 text-sm">Total: {data.total} results</div>}
      </div>
    </div>
  );
}
