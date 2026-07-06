"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface PendingMember {
  _id: string;
  name: string;
  email: string;
  membershipNumber: string;
  phone?: string;
  homeNumber?: string;
  address?: string;
  createdAt: string;
}

export default function AdminApprovalsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [pendingMembers, setPendingMembers] = useState<PendingMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else if (status === "authenticated") {
      if ((session.user as any).role !== "admin") {
        router.push("/dashboard");
        return;
      }
      fetchPending();
    }
  }, [status, router, session]);

  const fetchPending = async () => {
    try {
      const res = await fetch("/api/admin/approvals");
      if (res.ok) {
        const data = await res.json();
        setPendingMembers(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (userId: string, action: "approve" | "reject") => {
    setProcessing(userId + action);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/approvals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed");
      }

      setMessage({
        type: "success",
        text: action === "approve" ? "Member approved successfully!" : "Member rejected.",
      });
      fetchPending();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setProcessing(null);
    }
  };

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

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
              <Link href="/admin/approvals" className="text-white bg-indigo-800 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2">
                Approvals
                {pendingMembers.length > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {pendingMembers.length}
                  </span>
                )}
              </Link>
              <Link href="/admin/contributions" className="text-white hover:text-indigo-200 px-3 py-2 rounded-md text-sm font-medium">
                Contributions
              </Link>
              <Link href="/admin/reports" className="text-white hover:text-indigo-200 px-3 py-2 rounded-md text-sm font-medium">
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
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Pending Approvals</h2>
              <p className="text-sm text-gray-500 mt-1">
                New members who registered and are waiting for your approval
              </p>
            </div>
            <span className="px-4 py-2 bg-orange-100 text-orange-800 rounded-full font-semibold text-sm">
              {pendingMembers.length} Pending
            </span>
          </div>

          {message && (
            <div
              className={`rounded-md p-4 mb-4 ${
                message.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="bg-white shadow rounded-lg overflow-x-auto">
            {pendingMembers.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">✅</div>
                <p className="text-xl font-medium text-gray-700">All caught up!</p>
                <p className="text-gray-500 mt-1">No pending member approvals at this time.</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Membership #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mobile
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      House No.
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Address
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Registered On
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pendingMembers.map((member) => (
                    <tr key={member._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-medium text-indigo-600">
                        {member.membershipNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{member.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {member.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {member.phone || <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {member.homeNumber || <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {member.address || <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(member.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                        <button
                          onClick={() => handleAction(member._id, "approve")}
                          disabled={processing !== null}
                          className="inline-flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 font-medium"
                        >
                          {processing === member._id + "approve" ? "..." : "✓ Approve"}
                        </button>
                        <button
                          onClick={() => handleAction(member._id, "reject")}
                          disabled={processing !== null}
                          className="inline-flex items-center gap-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 font-medium"
                        >
                          {processing === member._id + "reject" ? "..." : "✗ Reject"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
