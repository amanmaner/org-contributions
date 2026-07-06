"use client";

import { useEffect, useState, FormEvent } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Contribution {
  _id: string;
  year: number;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  transactionId?: string;
  notes?: string;
}

interface PaymentRequest {
  _id: string;
  year: number;
  amount: number;
  referenceNumber: string;
  status: "pending" | "confirmed" | "rejected";
  createdAt: string;
}

interface UserData {
  name: string;
  email: string;
  membershipNumber: string;
  homeNumber?: string;
  phone?: string;
  address?: string;
  housingType?: string;
  fatherName?: string;
  motherName?: string;
  spouseName?: string;
  childrenCount?: number;
  occupation?: string;
  joiningDate: string;
}

export default function UserDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPayForm, setShowPayForm] = useState(false);
  const [payForm, setPayForm] = useState({
    year: new Date().getFullYear(),
    amount: "",
    referenceNumber: "",
    notes: "",
  });
  const [payError, setPayError] = useState("");
  const [paySuccess, setPaySuccess] = useState("");
  const [paySubmitting, setPaySubmitting] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else if (status === "authenticated") {
      fetchUserData();
      fetchContributions();
      fetchPaymentRequests();
    }
  }, [status, router]);

  const fetchUserData = async () => {
    try {
      const response = await fetch("/api/users");
      if (response.ok) {
        const data = await response.json();
        if (data.role === "admin") {
          router.push("/admin");
          return;
        }
        setUserData(data);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchContributions = async () => {
    try {
      const response = await fetch("/api/contributions");
      if (response.ok) {
        const data = await response.json();
        setContributions(data);
      }
    } catch (error) {
      console.error("Error fetching contributions:", error);
    }
  };

  const fetchPaymentRequests = async () => {
    try {
      const response = await fetch("/api/payments");
      if (response.ok) {
        const data = await response.json();
        setPaymentRequests(data);
      }
    } catch (error) {
      console.error("Error fetching payment requests:", error);
    }
  };

  const handlePaySubmit = async (e: FormEvent) => {
    e.preventDefault();
    setPayError("");
    setPaySuccess("");

    if (!payForm.amount || !payForm.referenceNumber) {
      setPayError("Amount and reference number are required");
      return;
    }

    setPaySubmitting(true);
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          year: payForm.year,
          amount: parseFloat(payForm.amount),
          referenceNumber: payForm.referenceNumber,
          notes: payForm.notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");

      setPaySuccess("Payment submitted! Admin will confirm it shortly.");
      setPayForm({ year: new Date().getFullYear(), amount: "", referenceNumber: "", notes: "" });
      setShowPayForm(false);
      fetchPaymentRequests();
    } catch (err: any) {
      setPayError(err.message);
    } finally {
      setPaySubmitting(false);
    }
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: "/auth/login" });
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
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Member Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="text-indigo-600 bg-indigo-50 px-3 py-2 rounded-md text-sm font-medium"
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard/profile"
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Profile
              </Link>
              <span className="text-gray-700">{userData?.name}</span>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
                <Link
                  href="/dashboard/profile"
                  className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                >
                  Edit Profile →
                </Link>
              </div>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Name</dt>
                  <dd className="text-sm text-gray-900">{userData?.name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="text-sm text-gray-900">{userData?.email}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Membership Number</dt>
                  <dd className="text-sm text-gray-900">{userData?.membershipNumber}</dd>
                </div>
                {userData?.homeNumber && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Home Number</dt>
                    <dd className="text-sm font-semibold text-blue-600">{userData.homeNumber}</dd>
                  </div>
                )}
                {userData?.housingType && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Housing Type</dt>
                    <dd className="text-sm text-gray-900 capitalize">{userData.housingType}</dd>
                  </div>
                )}
                {userData?.phone && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Phone</dt>
                    <dd className="text-sm text-gray-900">{userData.phone}</dd>
                  </div>
                )}
                {userData?.address && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Address</dt>
                    <dd className="text-sm text-gray-900">{userData.address}</dd>
                  </div>
                )}
                {userData?.occupation && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Occupation</dt>
                    <dd className="text-sm text-gray-900">{userData.occupation}</dd>
                  </div>
                )}
                {(userData?.fatherName || userData?.motherName) && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Parents</dt>
                    <dd className="text-sm text-gray-900">
                      {userData?.fatherName && <div>Father: {userData.fatherName}</div>}
                      {userData?.motherName && <div>Mother: {userData.motherName}</div>}
                    </dd>
                  </div>
                )}
                {(userData?.spouseName || userData?.childrenCount !== undefined) && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Family</dt>
                    <dd className="text-sm text-gray-900">
                      {userData?.spouseName && <div>Spouse: {userData.spouseName}</div>}
                      {userData?.childrenCount !== undefined && <div>Children: {userData.childrenCount}</div>}
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm font-medium text-gray-500">Member Since</dt>
                  <dd className="text-sm text-gray-900">
                    {userData?.joiningDate ? new Date(userData.joiningDate).toLocaleDateString() : "N/A"}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Contribution Summary</h2>
              <div className="space-y-4">
                <div className="bg-indigo-50 p-4 rounded-md">
                  <p className="text-sm text-indigo-600 font-medium">Total Contributions</p>
                  <p className="text-2xl font-bold text-indigo-900">{contributions.length}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-md">
                  <p className="text-sm text-green-600 font-medium">Total Amount</p>
                  <p className="text-2xl font-bold text-green-900">
                    ${contributions.reduce((sum, c) => sum + c.amount, 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* QR Payment Section */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Make a Payment</h2>
                <p className="text-sm text-gray-500 mt-1">Scan the QR code and submit your reference number</p>
              </div>
              <button
                onClick={() => { setShowPayForm(!showPayForm); setPayError(""); setPaySuccess(""); }}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 text-sm font-medium"
              >
                {showPayForm ? "Cancel" : "Pay Now"}
              </button>
            </div>

            {paySuccess && (
              <div className="rounded-md bg-green-50 p-3 mb-4">
                <p className="text-sm text-green-800">{paySuccess}</p>
              </div>
            )}

            {showPayForm && (
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  {/* QR Code */}
                  <div className="flex flex-col items-center">
                    <div className="border-4 border-indigo-600 rounded-lg p-2 bg-white">
                      <svg width="180" height="180" viewBox="0 0 180 180" xmlns="http://www.w3.org/2000/svg">
                        <rect width="180" height="180" fill="white"/>
                        {/* Top-left finder */}
                        <rect x="10" y="10" width="50" height="50" fill="none" stroke="#111827" strokeWidth="5" rx="3"/>
                        <rect x="22" y="22" width="26" height="26" fill="#111827" rx="2"/>
                        {/* Top-right finder */}
                        <rect x="120" y="10" width="50" height="50" fill="none" stroke="#111827" strokeWidth="5" rx="3"/>
                        <rect x="132" y="22" width="26" height="26" fill="#111827" rx="2"/>
                        {/* Bottom-left finder */}
                        <rect x="10" y="120" width="50" height="50" fill="none" stroke="#111827" strokeWidth="5" rx="3"/>
                        <rect x="22" y="132" width="26" height="26" fill="#111827" rx="2"/>
                        {/* Data modules (decorative) */}
                        <rect x="72" y="10" width="8" height="8" fill="#111827"/>
                        <rect x="84" y="10" width="8" height="8" fill="#111827"/>
                        <rect x="96" y="10" width="8" height="8" fill="#111827"/>
                        <rect x="72" y="22" width="8" height="8" fill="#111827"/>
                        <rect x="96" y="22" width="8" height="8" fill="#111827"/>
                        <rect x="72" y="34" width="8" height="8" fill="#111827"/>
                        <rect x="84" y="34" width="8" height="8" fill="#111827"/>
                        <rect x="10" y="72" width="8" height="8" fill="#111827"/>
                        <rect x="22" y="72" width="8" height="8" fill="#111827"/>
                        <rect x="46" y="72" width="8" height="8" fill="#111827"/>
                        <rect x="72" y="72" width="8" height="8" fill="#111827"/>
                        <rect x="84" y="72" width="8" height="8" fill="#111827"/>
                        <rect x="96" y="72" width="8" height="8" fill="#111827"/>
                        <rect x="108" y="72" width="8" height="8" fill="#111827"/>
                        <rect x="132" y="72" width="8" height="8" fill="#111827"/>
                        <rect x="156" y="72" width="8" height="8" fill="#111827"/>
                        <rect x="10" y="84" width="8" height="8" fill="#111827"/>
                        <rect x="34" y="84" width="8" height="8" fill="#111827"/>
                        <rect x="72" y="84" width="8" height="8" fill="#111827"/>
                        <rect x="96" y="84" width="8" height="8" fill="#111827"/>
                        <rect x="120" y="84" width="8" height="8" fill="#111827"/>
                        <rect x="144" y="84" width="8" height="8" fill="#111827"/>
                        <rect x="10" y="96" width="8" height="8" fill="#111827"/>
                        <rect x="22" y="96" width="8" height="8" fill="#111827"/>
                        <rect x="46" y="96" width="8" height="8" fill="#111827"/>
                        <rect x="72" y="96" width="8" height="8" fill="#111827"/>
                        <rect x="84" y="96" width="8" height="8" fill="#111827"/>
                        <rect x="108" y="96" width="8" height="8" fill="#111827"/>
                        <rect x="132" y="96" width="8" height="8" fill="#111827"/>
                        <rect x="156" y="96" width="8" height="8" fill="#111827"/>
                        <rect x="72" y="120" width="8" height="8" fill="#111827"/>
                        <rect x="84" y="120" width="8" height="8" fill="#111827"/>
                        <rect x="108" y="120" width="8" height="8" fill="#111827"/>
                        <rect x="120" y="120" width="8" height="8" fill="#111827"/>
                        <rect x="144" y="120" width="8" height="8" fill="#111827"/>
                        <rect x="72" y="132" width="8" height="8" fill="#111827"/>
                        <rect x="96" y="132" width="8" height="8" fill="#111827"/>
                        <rect x="120" y="132" width="8" height="8" fill="#111827"/>
                        <rect x="156" y="132" width="8" height="8" fill="#111827"/>
                        <rect x="72" y="144" width="8" height="8" fill="#111827"/>
                        <rect x="84" y="144" width="8" height="8" fill="#111827"/>
                        <rect x="108" y="144" width="8" height="8" fill="#111827"/>
                        <rect x="132" y="144" width="8" height="8" fill="#111827"/>
                        <rect x="72" y="156" width="8" height="8" fill="#111827"/>
                        <rect x="96" y="156" width="8" height="8" fill="#111827"/>
                        <rect x="120" y="156" width="8" height="8" fill="#111827"/>
                        <rect x="144" y="156" width="8" height="8" fill="#111827"/>
                        <rect x="156" y="156" width="8" height="8" fill="#111827"/>
                      </svg>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 text-center">Scan to Pay</p>
                    <p className="text-xs text-indigo-500 mt-1 text-center font-medium">Replace with your real QR</p>
                  </div>

                  {/* Payment Form */}
                  <form onSubmit={handlePaySubmit} className="flex-1 space-y-4">
                    {payError && (
                      <div className="rounded-md bg-red-50 p-3">
                        <p className="text-sm text-red-800">{payError}</p>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Year *</label>
                      <input
                        type="number"
                        required
                        min="2000"
                        max="2100"
                        value={payForm.year}
                        onChange={(e) => setPayForm({ ...payForm, year: parseInt(e.target.value) })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Amount *</label>
                      <input
                        type="number"
                        required
                        min="1"
                        step="0.01"
                        value={payForm.amount}
                        onChange={(e) => setPayForm({ ...payForm, amount: e.target.value })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                        placeholder="e.g. 500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Reference Number *</label>
                      <input
                        type="text"
                        required
                        value={payForm.referenceNumber}
                        onChange={(e) => setPayForm({ ...payForm, referenceNumber: e.target.value })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                        placeholder="From your GCash/payment receipt"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Notes</label>
                      <input
                        type="text"
                        value={payForm.notes}
                        onChange={(e) => setPayForm({ ...payForm, notes: e.target.value })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                        placeholder="Optional notes"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={paySubmitting}
                      className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 font-medium"
                    >
                      {paySubmitting ? "Submitting..." : "Submit Payment"}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* My payment requests history */}
            {paymentRequests.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">My Payment Requests</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Ref #</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paymentRequests.map((pr) => (
                        <tr key={pr._id}>
                          <td className="px-4 py-2 text-gray-900">{pr.year}</td>
                          <td className="px-4 py-2 text-gray-900">${pr.amount.toFixed(2)}</td>
                          <td className="px-4 py-2 text-gray-500 font-mono">{pr.referenceNumber}</td>
                          <td className="px-4 py-2">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              pr.status === "confirmed" ? "bg-green-100 text-green-800" :
                              pr.status === "rejected" ? "bg-red-100 text-red-800" :
                              "bg-yellow-100 text-yellow-800"
                            }`}>
                              {pr.status.charAt(0).toUpperCase() + pr.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-gray-500">
                            {new Date(pr.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Contribution History</h2>
            {contributions.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No contributions recorded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Year
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Method
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Transaction ID
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {contributions.map((contribution) => (
                      <tr key={contribution._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {contribution.year}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${contribution.amount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(contribution.paymentDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {contribution.paymentMethod.replace("_", " ")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {contribution.transactionId || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
