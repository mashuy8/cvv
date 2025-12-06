import { useState, useEffect } from "react";
import { trpc } from "./lib/trpc";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Results from "./pages/Results";
import Logs from "./pages/Logs";

type Page = "dashboard" | "users" | "results" | "logs";

function App() {
  const [page, setPage] = useState<Page>("dashboard");
  const { data: user, isLoading, refetch } = trpc.auth.me.useQuery();
  const logoutMutation = trpc.auth.logout.useMutation({ onSuccess: () => refetch() });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Login onSuccess={() => refetch()} />;
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div className="w-56 bg-slate-900 border-r border-slate-700 flex flex-col">
        <div className="p-4 border-b border-slate-700">
          <h1 className="text-xl font-bold text-primary">Card Checker</h1>
        </div>
        <nav className="flex-1 p-2">
          {[
            { id: "dashboard", label: "Dashboard", icon: "📊" },
            { id: "users", label: "Users", icon: "👥" },
            { id: "results", label: "Results", icon: "📋" },
            { id: "logs", label: "Activity Logs", icon: "📝" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setPage(item.id as Page)}
              className={`w-full text-left px-4 py-3 rounded-lg mb-1 flex items-center gap-3 transition-colors ${
                page === item.id ? "bg-primary/20 text-primary" : "hover:bg-slate-800 text-slate-300"
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-700">
          <button
            onClick={() => logoutMutation.mutate()}
            className="w-full bg-red-500/20 text-red-400 px-4 py-2 rounded-lg hover:bg-red-500/30 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {page === "dashboard" && <Dashboard />}
        {page === "users" && <Users />}
        {page === "results" && <Results />}
        {page === "logs" && <Logs />}
      </div>
    </div>
  );
}

export default App;
