"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import EditMemberModal from "./EditMemberModal";
import ResetPasswordModal from "./ResetPasswordModal";

interface Member {
  _id: string;
  name: string;
  email: string;
  membershipNumber: string;
  homeNumber?: string;
  phone?: string;
  address?: string;
  housingType?: "owned" | "rented";
  fatherName?: string;
  motherName?: string;
  spouseName?: string;
  childrenCount?: number;
  occupation?: string;
  joiningDate: string;
  isActive: boolean;
  approvalStatus: "pending" | "approved" | "rejected";
}

export default function AdminMembersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"members" | "homes">("members");
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [resetPasswordMember, setResetPasswordMember] = useState<Member | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else if (status === "authenticated") {
      checkAdminRole();
    }
  }, [status, router]);

  const checkAdminRole = async () => {
    try {
      const response = await fetch("/api/users");
      if (response.ok) {
        const data = await response.json();
        if (data.role !== "admin") {
          router.push("/dashboard");
          return;
        }
        fetchMembers();
      }
    } catch (error) {
      console.error("Error checking role:", error);
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await fetch("/api/admin/members");
      if (response.ok) {
        const data = await response.json();
        setMembers(data);
      }
    } catch (error) {
      console.error("Error fetching members:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleMemberStatus = async (memberId: string, currentStatus: boolean) => {
    try {
      const response = await fetch("/api/admin/members", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: memberId,
          isActive: !currentStatus,
        }),
      });

      if (response.ok) {
        fetchMembers();
      }
    } catch (error) {
      console.error("Error updating member:", error);
    }
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: "/auth/login" });
  };

  const filteredMembers = members.filter((member) => {
    if (filter === "active") return member.isActive;
    if (filter === "inactive") return !member.isActive;
    if (filter === "owned") return member.housingType === "owned";
    if (filter === "rented") return member.housingType === "rented";
    return true;
  });

  // Group members by home number
  const membersByHome = members.reduce((acc, member) => {
    if (member.homeNumber) {
      if (!acc[member.homeNumber]) {
        acc[member.homeNumber] = [];
      }
      acc[member.homeNumber].push(member);
    }
    return acc;
  }, {} as Record<string, Member[]>);

  const totalHomes = Object.keys(membersByHome).length;
  const membersWithoutHome = members.filter(m => !m.homeNumber).length;
  
  // Get homes array for home view
  const homes = Object.entries(membersByHome).map(([homeNumber, homeMembers]) => ({
    homeNumber,
    members: homeMembers,
    memberCount: homeMembers.length,
    activeMembers: homeMembers.filter(m => m.isActive).length,
    housingType: homeMembers[0]?.housingType || "unknown",
  }));

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
              <Link
                href="/admin"
                className="text-white hover:text-indigo-200 px-3 py-2 rounded-md text-sm font-medium"
              >
                Dashboard
              </Link>
              <Link
                href="/admin/members"
                className="text-white bg-indigo-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                Members
              </Link>
              <Link
                href="/admin/approvals"
                className="text-white hover:text-indigo-200 px-3 py-2 rounded-md text-sm font-medium"
              >
                Approvals
              </Link>
              <Link
                href="/admin/contributions"
                className="text-white hover:text-indigo-200 px-3 py-2 rounded-md text-sm font-medium"
              >
                Contributions
              </Link>
              <Link
                href="/admin/reports"
                className="text-white hover:text-indigo-200 px-3 py-2 rounded-md text-sm font-medium"
              >
                Reports
              </Link>
              <span className="text-white">{session?.user?.name}</span>
              <button
                onClick={handleSignOut}
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
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm font-medium text-gray-500">Total Members</div>
              <div className="mt-1 text-3xl font-semibold text-indigo-600">{members.length}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm font-medium text-gray-500">Total Homes</div>
              <div className="mt-1 text-3xl font-semibold text-blue-600">{totalHomes}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm font-medium text-gray-500">Active Members</div>
              <div className="mt-1 text-3xl font-semibold text-green-600">
                {members.filter(m => m.isActive).length}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm font-medium text-gray-500">Without Home#</div>
              <div className="mt-1 text-3xl font-semibold text-orange-600">{membersWithoutHome}</div>
            </div>
            <Link href="/admin/approvals" className="bg-orange-50 border-2 border-orange-300 rounded-lg shadow p-4 hover:bg-orange-100 transition-colors">
              <div className="text-sm font-medium text-orange-600">Pending Approvals</div>
              <div className="mt-1 text-3xl font-semibold text-orange-600">
                {members.filter(m => m.approvalStatus === "pending").length}
              </div>
              <div className="text-xs text-orange-500 mt-1">Click to review →</div>
            </Link>
          </div>

          {/* View Mode Toggle */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex space-x-2">
              <button
                onClick={() => setViewMode("members")}
                className={`px-4 py-2 rounded-md font-medium ${
                  viewMode === "members"
                    ? "bg-indigo-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                }`}
              >
                👤 Members View
              </button>
              <button
                onClick={() => setViewMode("homes")}
                className={`px-4 py-2 rounded-md font-medium ${
                  viewMode === "homes"
                    ? "bg-indigo-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                }`}
              >
                🏠 Homes View
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {viewMode === "members" ? "Members Management" : "Homes Management"}
            </h2>
            {viewMode === "members" && (
              <div className="flex space-x-2">
                <button
                  onClick={() => setFilter("all")}
                  className={`px-4 py-2 rounded-md ${
                    filter === "all"
                      ? "bg-indigo-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  All ({members.length})
                </button>
                <button
                  onClick={() => setFilter("active")}
                  className={`px-4 py-2 rounded-md ${
                    filter === "active"
                      ? "bg-green-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Active ({members.filter((m) => m.isActive).length})
                </button>
                <button
                  onClick={() => setFilter("inactive")}
                  className={`px-4 py-2 rounded-md ${
                    filter === "inactive"
                      ? "bg-red-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Inactive ({members.filter((m) => !m.isActive).length})
                </button>
                <button
                  onClick={() => setFilter("owned")}
                  className={`px-4 py-2 rounded-md ${
                    filter === "owned"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Owned ({members.filter((m) => m.housingType === "owned").length})
                </button>
                <button
                  onClick={() => setFilter("rented")}
                  className={`px-4 py-2 rounded-md ${
                    filter === "rented"
                      ? "bg-purple-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Rented ({members.filter((m) => m.housingType === "rented").length})
                </button>
              </div>
            )}
          </div>

          {/* Members View */}
          {viewMode === "members" && (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              {filteredMembers.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No members found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Member ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Home #
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Phone
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Housing
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Family
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Parents
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Joining Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredMembers.map((member) => (
                      <tr key={member._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {member.membershipNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {member.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                          {member.homeNumber || (
                            <span className="text-orange-500 text-xs">Not set</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {member.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {member.phone || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {member.housingType ? (
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                member.housingType === "owned"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-purple-100 text-purple-800"
                              }`}
                            >
                              {member.housingType.charAt(0).toUpperCase() + member.housingType.slice(1)}
                            </span>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {member.spouseName || member.childrenCount ? (
                            <div className="text-xs">
                              {member.spouseName && <div>Spouse: {member.spouseName}</div>}
                              {member.childrenCount !== undefined && <div>Children: {member.childrenCount}</div>}
                            </div>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {member.fatherName || member.motherName ? (
                            <div className="text-xs">
                              {member.fatherName && <div>Father: {member.fatherName}</div>}
                              {member.motherName && <div>Mother: {member.motherName}</div>}
                            </div>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(member.joiningDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              member.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {member.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => setEditingMember(member)}
                            className="text-indigo-600 hover:text-indigo-900 mr-3"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setResetPasswordMember(member)}
                            className="text-yellow-600 hover:text-yellow-900 mr-3"
                          >
                            Reset Password
                          </button>
                          <button
                            onClick={() => toggleMemberStatus(member._id, member.isActive)}
                            className={`${
                              member.isActive
                                ? "text-red-600 hover:text-red-900"
                                : "text-green-600 hover:text-green-900"
                            }`}
                          >
                            {member.isActive ? "Deactivate" : "Activate"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          )}

          {/* Homes View */}
          {viewMode === "homes" && (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              {homes.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No homes registered yet.</p>
              ) : (
                <div className="space-y-4 p-6">
                  {homes.map((home) => (
                    <div
                      key={home.homeNumber}
                      className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <div className="bg-gray-50 px-6 py-3 flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                          <h3 className="text-lg font-semibold text-gray-900">
                            🏠 Home # {home.homeNumber}
                          </h3>
                          <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
                            {home.memberCount} {home.memberCount === 1 ? "Member" : "Members"}
                          </span>
                          {home.housingType && (
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium ${
                                home.housingType === "owned"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-purple-100 text-purple-800"
                              }`}
                            >
                              {home.housingType.charAt(0).toUpperCase() + home.housingType.slice(1)}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {home.activeMembers} Active
                        </div>
                      </div>
                      <div className="px-6 py-4">
                        <table className="min-w-full">
                          <thead>
                            <tr className="text-left text-xs font-medium text-gray-500 uppercase">
                              <th className="pb-2">Member ID</th>
                              <th className="pb-2">Name</th>
                              <th className="pb-2">Email</th>
                              <th className="pb-2">Phone</th>
                              <th className="pb-2">Status</th>
                              <th className="pb-2">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="text-sm">
                            {home.members.map((member) => (
                              <tr key={member._id} className="border-t border-gray-100">
                                <td className="py-2 font-medium text-gray-900">
                                  {member.membershipNumber}
                                </td>
                                <td className="py-2 text-gray-900">{member.name}</td>
                                <td className="py-2 text-gray-500">{member.email}</td>
                                <td className="py-2 text-gray-500">{member.phone || "-"}</td>
                                <td className="py-2">
                                  <span
                                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                      member.isActive
                                        ? "bg-green-100 text-green-800"
                                        : "bg-red-100 text-red-800"
                                    }`}
                                  >
                                    {member.isActive ? "Active" : "Inactive"}
                                  </span>
                                </td>
                                <td className="py-2">
                                  <button
                                    onClick={() => setEditingMember(member)}
                                    className="text-indigo-600 hover:text-indigo-900 text-sm"
                                  >
                                    Edit
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {editingMember && (
        <EditMemberModal
          member={editingMember}
          onClose={() => setEditingMember(null)}
          onSave={() => {
            fetchMembers();
            setEditingMember(null);
          }}
        />
      )}

      <ResetPasswordModal
        member={resetPasswordMember}
        onClose={() => setResetPasswordMember(null)}
      />
    </div>
  );
}
