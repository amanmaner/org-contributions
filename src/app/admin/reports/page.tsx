"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminReportsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else if (status === "authenticated") {
      if ((session.user as any).role !== "admin") {
        router.push("/dashboard");
      } else {
        setLoading(false);
      }
    }
  }, [status, router, session]);

  const downloadReport = async (type: string, label: string) => {
    setDownloading(type);
    try {
      const params = new URLSearchParams({ type });
      if (type === "contributions" || type === "unpaid") {
        params.set("year", String(year));
      }

      const res = await fetch(`/api/admin/reports?${params.toString()}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Download failed");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = res.headers.get("Content-Disposition")?.split('filename="')[1]?.replace('"', "") || `${type}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setDownloading(null);
    }
  };

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  const reports = [
    {
      type: "members",
      title: "All Members",
      description: "Complete list of all registered members with personal details.",
      icon: "👥",
      color: "indigo",
      yearFilter: false,
    },
    {
      type: "active-members",
      title: "Active Members",
      description: "List of currently active members only.",
      icon: "✅",
      color: "green",
      yearFilter: false,
    },
    {
      type: "contributions",
      title: "Contributions",
      description: "All contribution records with member details and payment info.",
      icon: "💰",
      color: "blue",
      yearFilter: true,
    },
    {
      type: "unpaid",
      title: "Unpaid Members",
      description: "Active members who have not yet paid their contribution for the selected year.",
      icon: "⚠️",
      color: "orange",
      yearFilter: true,
    },
  ];

  const colorMap: Record<string, string> = {
    indigo: "bg-indigo-600 hover:bg-indigo-700",
    green: "bg-green-600 hover:bg-green-700",
    blue: "bg-blue-600 hover:bg-blue-700",
    orange: "bg-orange-500 hover:bg-orange-600",
  };

  const borderMap: Record<string, string> = {
    indigo: "border-indigo-200 bg-indigo-50",
    green: "border-green-200 bg-green-50",
    blue: "border-blue-200 bg-blue-50",
    orange: "border-orange-200 bg-orange-50",
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-indigo-600 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/admin" className="text-white hover:text-indigo-200 px-3 py-2 rounded-md text-sm font-medium">
                Overview
              </Link>
              <Link href="/admin/members" className="text-white hover:text-indigo-200 px-3 py-2 rounded-md text-sm font-medium">
                Members
              </Link>
              <Link href="/admin/approvals" className="text-white hover:text-indigo-200 px-3 py-2 rounded-md text-sm font-medium">
                Approvals
              </Link>
              <Link href="/admin/contributions" className="text-white hover:text-indigo-200 px-3 py-2 rounded-md text-sm font-medium">
                Contributions
              </Link>
              <Link href="/admin/reports" className="text-white bg-indigo-800 px-3 py-2 rounded-md text-sm font-medium">
                Reports
              </Link>
              <span className="text-white">{session?.user?.name}</span>
              <button
                onClick={() => signOut({ callbackUrl: "/auth/login" })}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Download Reports</h2>
            <p className="text-sm text-gray-500 mt-1">Export data as CSV files. Open with Excel or Google Sheets.</p>
          </div>

          {/* Year selector for year-based reports */}
          <div className="bg-white shadow rounded-lg p-4 mb-6 flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Year for year-based reports:</label>
            <input
              type="number"
              min="2000"
              max="2100"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="border border-gray-300 rounded-md px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 w-28"
            />
            <span className="text-xs text-gray-500">Used for Contributions and Unpaid Members reports</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reports.map((report) => (
              <div
                key={report.type}
                className={`border-2 rounded-lg p-6 ${borderMap[report.color]}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">{report.icon}</span>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{report.title}</h3>
                      {report.yearFilter && (
                        <span className="text-xs text-gray-500">Year: {year}</span>
                      )}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4">{report.description}</p>
                <button
                  onClick={() => downloadReport(report.type, report.title)}
                  disabled={downloading !== null}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-2 text-white rounded-md font-medium disabled:opacity-50 ${colorMap[report.color]}`}
                >
                  {downloading === report.type ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                      Preparing...
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                      </svg>
                      Download CSV
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
