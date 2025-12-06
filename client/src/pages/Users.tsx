import { useState } from "react";
import { trpc } from "../lib/trpc";

export default function Users() {
  const utils = trpc.useUtils();
  const { data: users, isLoading } = trpc.scriptUsers.list.useQuery();
  const [showCreate, setShowCreate] = useState(false);
  const [newUser, setNewUser] = useState({ username: "", password: "", maxDailyChecks: 1000, expiresAt: "" });
  const [searchTerm, setSearchTerm] = useState("");

  const createMutation = trpc.scriptUsers.create.useMutation({
    onSuccess: () => { utils.scriptUsers.list.invalidate(); setShowCreate(false); setNewUser({ username: "", password: "", maxDailyChecks: 1000, expiresAt: "" }); },
  });

  const deleteMutation = trpc.scriptUsers.delete.useMutation({
    onSuccess: () => utils.scriptUsers.list.invalidate(),
  });

  const toggleMutation = trpc.scriptUsers.update.useMutation({
    onSuccess: () => utils.scriptUsers.list.invalidate(),
  });

  const filteredUsers = users?.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalUsers = users?.length || 0;
  const activeUsers = users?.filter(u => u.isActive).length || 0;

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
            إدارة المستخدمين
          </h1>
          <p className="text-slate-400 mt-1">إدارة مستخدمي السكريبت والصلاحيات</p>
        </div>
        <button 
          onClick={() => setShowCreate(true)} 
          className="flex items-center gap-2 bg-gradient-to-r from-primary to-cyan-500 hover:from-primary/90 hover:to-cyan-500/90 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg shadow-primary/25 hover:shadow-primary/40"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          إضافة مستخدم
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
            <span className="text-2xl">👥</span>
          </div>
          <div>
            <p className="text-slate-400 text-sm">إجمالي المستخدمين</p>
            <p className="text-2xl font-bold text-white">{totalUsers}</p>
          </div>
        </div>
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
            <span className="text-2xl">✅</span>
          </div>
          <div>
            <p className="text-slate-400 text-sm">المستخدمين النشطين</p>
            <p className="text-2xl font-bold text-green-400">{activeUsers}</p>
          </div>
        </div>
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
            <span className="text-2xl">🚫</span>
          </div>
          <div>
            <p className="text-slate-400 text-sm">المستخدمين المعطلين</p>
            <p className="text-2xl font-bold text-red-400">{totalUsers - activeUsers}</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="البحث عن مستخدم..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-80 pr-12 pl-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-primary/50 transition-colors"
        />
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 p-8 rounded-2xl w-full max-w-md border border-slate-700/50 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white">إنشاء مستخدم جديد</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-slate-400 text-sm mb-2">اسم المستخدم</label>
                <input type="text" placeholder="أدخل اسم المستخدم" value={newUser.username} onChange={(e) => setNewUser({ ...newUser, username: e.target.value })} className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-primary/50" />
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-2">كلمة المرور</label>
                <input type="password" placeholder="أدخل كلمة المرور" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-primary/50" />
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-2">الحد اليومي للفحوصات</label>
                <input type="number" placeholder="1000" value={newUser.maxDailyChecks} onChange={(e) => setNewUser({ ...newUser, maxDailyChecks: parseInt(e.target.value) })} className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-primary/50" />
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-2">تاريخ الانتهاء (اختياري)</label>
                <input type="datetime-local" value={newUser.expiresAt} onChange={(e) => setNewUser({ ...newUser, expiresAt: e.target.value })} className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:border-primary/50" />
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => setShowCreate(false)} className="flex-1 bg-slate-700/50 hover:bg-slate-700 text-white px-4 py-3 rounded-xl transition-colors">
                  إلغاء
                </button>
                <button onClick={() => createMutation.mutate(newUser)} disabled={createMutation.isPending || !newUser.username || !newUser.password} className="flex-1 bg-gradient-to-r from-primary to-cyan-500 hover:from-primary/90 hover:to-cyan-500/90 text-white px-4 py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  {createMutation.isPending ? "جاري الإنشاء..." : "إنشاء"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-900/50">
                <th className="px-6 py-4 text-right text-sm font-medium text-slate-400">المستخدم</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-slate-400">الحالة</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-slate-400">اليوم / الحد</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-slate-400">الإجمالي</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-slate-400">نسبة النجاح</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-slate-400">الانتهاء</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-slate-400">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-slate-400">جاري التحميل...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers?.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center">
                        <span className="text-3xl">👤</span>
                      </div>
                      <span className="text-slate-400">لا يوجد مستخدمين</span>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers?.map((user) => (
                <tr key={user.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-cyan-500/20 flex items-center justify-center text-primary font-bold">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-white">{user.username}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${user.isActive ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${user.isActive ? "bg-green-400" : "bg-red-400"}`}></span>
                      {user.isActive ? "نشط" : "معطل"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">{user.todayChecks || 0}</span>
                      <span className="text-slate-500">/</span>
                      <span className="text-slate-400">{user.maxDailyChecks || 1000}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-white font-medium">{user.totalChecks || 0}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
                          style={{ width: `${user.totalChecks ? Math.round(((user.successfulChecks || 0) / user.totalChecks) * 100) : 0}%` }}
                        ></div>
                      </div>
                      <span className="text-slate-300 text-sm">
                        {user.totalChecks ? Math.round(((user.successfulChecks || 0) / user.totalChecks) * 100) : 0}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-400">
                    {user.expiresAt ? new Date(user.expiresAt).toLocaleDateString('ar-SA') : "غير محدد"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => toggleMutation.mutate({ id: user.id, isActive: !user.isActive })} 
                        className={`p-2 rounded-lg transition-colors ${user.isActive ? "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30" : "bg-green-500/20 text-green-400 hover:bg-green-500/30"}`}
                        title={user.isActive ? "تعطيل" : "تفعيل"}
                      >
                        {user.isActive ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                      <button 
                        onClick={() => { if (confirm("هل أنت متأكد من حذف هذا المستخدم؟")) deleteMutation.mutate({ id: user.id }); }} 
                        className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                        title="حذف"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
