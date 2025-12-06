import { trpc } from "../lib/trpc";

export default function Dashboard() {
  const { data: stats, isLoading } = trpc.statistics.overview.useQuery();

  const statCards = [
    { 
      title: "إجمالي المستخدمين", 
      value: stats?.totalUsers || 0, 
      icon: "👥", 
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/30"
    },
    { 
      title: "المستخدمين النشطين", 
      value: stats?.activeUsers || 0, 
      icon: "✅", 
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/30"
    },
    { 
      title: "إجمالي الفحوصات", 
      value: stats?.totalChecks || 0, 
      icon: "📊", 
      color: "from-violet-500 to-violet-600",
      bgColor: "bg-violet-500/10",
      borderColor: "border-violet-500/30"
    },
    { 
      title: "فحوصات اليوم", 
      value: stats?.todayChecks || 0, 
      icon: "📅", 
      color: "from-amber-500 to-amber-600",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/30"
    },
    { 
      title: "البطاقات الناجحة", 
      value: stats?.successfulChecks || 0, 
      icon: "💳", 
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/30"
    },
    { 
      title: "البطاقات المرفوضة", 
      value: stats?.failedChecks || 0, 
      icon: "❌", 
      color: "from-red-500 to-red-600",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/30"
    },
  ];

  const successRate = stats?.totalChecks 
    ? Math.round((stats.successfulChecks / stats.totalChecks) * 100) 
    : 0;

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
            لوحة التحكم
          </h1>
          <p className="text-slate-400 mt-1">نظرة عامة على إحصائيات النظام</p>
        </div>
        <div className="text-sm text-slate-500">
          آخر تحديث: {new Date().toLocaleString('ar-SA')}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className={`relative overflow-hidden rounded-2xl border ${stat.borderColor} ${stat.bgColor} p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/10`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium mb-2">{stat.title}</p>
                <p className="text-4xl font-bold text-white">{stat.value.toLocaleString()}</p>
              </div>
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-2xl shadow-lg`}>
                {stat.icon}
              </div>
            </div>
            <div className={`absolute -bottom-4 -right-4 w-24 h-24 rounded-full bg-gradient-to-br ${stat.color} opacity-10 blur-2xl`}></div>
          </div>
        ))}
      </div>

      {/* Success Rate & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-700/50 bg-slate-800/30 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center text-sm">📈</span>
            معدل النجاح
          </h3>
          <div className="flex items-center gap-6">
            <div className="relative w-32 h-32">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="none" className="text-slate-700" />
                <circle cx="64" cy="64" r="56" stroke="url(#gradient)" strokeWidth="12" fill="none" strokeLinecap="round" strokeDasharray={`${successRate * 3.52} 352`} className="transition-all duration-1000" />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#22d3ee" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold text-white">{successRate}%</span>
              </div>
            </div>
            <div className="flex-1 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">ناجحة</span>
                <span className="text-green-400 font-semibold">{stats?.successfulChecks || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">مرفوضة</span>
                <span className="text-red-400 font-semibold">{stats?.failedChecks || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">الإجمالي</span>
                <span className="text-white font-semibold">{stats?.totalChecks || 0}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-700/50 bg-slate-800/30 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-sm">⚡</span>
            إحصائيات سريعة
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">👥</div>
                <span className="text-slate-300">نسبة المستخدمين النشطين</span>
              </div>
              <span className="text-xl font-bold text-white">
                {stats?.totalUsers ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0}%
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">📊</div>
                <span className="text-slate-300">متوسط الفحوصات لكل مستخدم</span>
              </div>
              <span className="text-xl font-bold text-white">
                {stats?.totalUsers && stats.totalUsers > 0 ? Math.round(stats.totalChecks / stats.totalUsers) : 0}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center text-green-400">🎯</div>
                <span className="text-slate-300">حالة النظام</span>
              </div>
              <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm font-medium">يعمل</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
