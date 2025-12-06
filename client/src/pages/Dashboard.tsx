import { trpc } from "../lib/trpc";

export default function Dashboard() {
  const { data: stats, isLoading } = trpc.statistics.overview.useQuery();

  const cards = [
    { label: "Total Users", value: stats?.totalUsers || 0, color: "bg-blue-500" },
    { label: "Active Users", value: stats?.activeUsers || 0, color: "bg-green-500" },
    { label: "Total Checks", value: stats?.totalChecks || 0, color: "bg-purple-500" },
    { label: "Today Checks", value: stats?.todayChecks || 0, color: "bg-yellow-500" },
    { label: "Successful", value: stats?.successfulChecks || 0, color: "bg-emerald-500" },
    { label: "Failed", value: stats?.failedChecks || 0, color: "bg-red-500" },
  ];

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-primary mb-8">Dashboard</h2>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-slate-800 rounded-xl p-6 animate-pulse">
              <div className="h-4 bg-slate-700 rounded mb-4"></div>
              <div className="h-8 bg-slate-700 rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {cards.map((card, i) => (
            <div key={i} className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <p className="text-slate-400 text-sm mb-2">{card.label}</p>
              <p className={`text-3xl font-bold ${card.color.replace("bg-", "text-")}`}>
                {card.value.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
