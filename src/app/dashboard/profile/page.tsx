"use client";

import { useEffect, useState, FormEvent } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function UserProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [warning, setWarning] = useState("");
  const [formData, setFormData] = useState({
    homeNumber: "",
    phone: "",
    address: "",
    housingType: "",
    fatherName: "",
    motherName: "",
    spouseName: "",
    childrenCount: "",
    occupation: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else if (status === "authenticated") {
      fetchUserData();
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
        setFormData({
          homeNumber: data.homeNumber || "",
          phone: data.phone || "",
          address: data.address || "",
          housingType: data.housingType || "",
          fatherName: data.fatherName || "",
          motherName: data.motherName || "",
          spouseName: data.spouseName || "",
          childrenCount: data.childrenCount?.toString() || "",
          occupation: data.occupation || "",
        });
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setWarning("");
    setSaving(true);

    try {
      const response = await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          homeNumber: formData.homeNumber || undefined,
          phone: formData.phone || undefined,
          address: formData.address || undefined,
          housingType: formData.housingType || undefined,
          fatherName: formData.fatherName || undefined,
          motherName: formData.motherName || undefined,
          spouseName: formData.spouseName || undefined,
          childrenCount: formData.childrenCount ? parseInt(formData.childrenCount) : undefined,
          occupation: formData.occupation || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      setSuccess("Profile updated successfully!");
      if (data.warning) {
        setWarning(data.warning);
      }
      setTimeout(() => {
        setSuccess("");
        setWarning("");
      }, 5000);
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
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
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard/profile"
                className="text-indigo-600 bg-indigo-50 px-3 py-2 rounded-md text-sm font-medium"
              >
                Profile
              </Link>
              <span className="text-gray-700">{session?.user?.name}</span>
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

      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Profile</h2>

            {error && (
              <div className="rounded-md bg-red-50 p-4 mb-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
            {success && (
              <div className="rounded-md bg-green-50 p-4 mb-4">
                <p className="text-sm text-green-800">{success}</p>
              </div>
            )}
            {warning && (
              <div className="rounded-md bg-yellow-50 p-4 mb-4">
                <p className="text-sm text-yellow-800">{warning}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Housing Information */}
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Housing Information</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="homeNumber" className="block text-sm font-medium text-gray-700">
                      Home Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="homeNumber"
                      name="homeNumber"
                      type="text"
                      value={formData.homeNumber}
                      onChange={handleChange}
                      className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="e.g., H123, A-45, HOUSE-10"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Enter your home/house number. Family members living in the same home should use the same number.
                    </p>
                  </div>
                  <div>
                    <label htmlFor="housingType" className="block text-sm font-medium text-gray-700">
                      Housing Type
                    </label>
                    <select
                      id="housingType"
                      name="housingType"
                      value={formData.housingType}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      <option value="">Select housing type</option>
                      <option value="owned">Owned</option>
                      <option value="rented">Rented</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Parent Information */}
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Parent Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    {/* eslint-disable-next-line react/no-unescaped-entities */}
                    <label htmlFor="fatherName" className="block text-sm font-medium text-gray-700">
                      {"Father's Name"}
                    </label>
                    <input
                      id="fatherName"
                      name="fatherName"
                      type="text"
                      value={formData.fatherName}
                      onChange={handleChange}
                      className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="Father's full name"
                    />
                  </div>
                  <div>
                    {/* eslint-disable-next-line react/no-unescaped-entities */}
                    <label htmlFor="motherName" className="block text-sm font-medium text-gray-700">
                      {"Mother's Name"}
                    </label>
                    <input
                      id="motherName"
                      name="motherName"
                      type="text"
                      value={formData.motherName}
                      onChange={handleChange}
                      className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="Mother's full name"
                    />
                  </div>
                </div>
              </div>

              {/* Family Information */}
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Family Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="spouseName" className="block text-sm font-medium text-gray-700">
                      Spouse Name
                    </label>
                    <input
                      id="spouseName"
                      name="spouseName"
                      type="text"
                      value={formData.spouseName}
                      onChange={handleChange}
                      className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="Spouse's full name"
                    />
                  </div>
                  <div>
                    <label htmlFor="childrenCount" className="block text-sm font-medium text-gray-700">
                      Number of Children
                    </label>
                    <input
                      id="childrenCount"
                      name="childrenCount"
                      type="number"
                      min="0"
                      value={formData.childrenCount}
                      onChange={handleChange}
                      className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                      Phone Number
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="+1234567890"
                    />
                  </div>
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                      Address
                    </label>
                    <textarea
                      id="address"
                      name="address"
                      rows={3}
                      value={formData.address}
                      onChange={handleChange}
                      className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="Your address"
                    />
                  </div>
                  <div>
                    <label htmlFor="occupation" className="block text-sm font-medium text-gray-700">
                      Occupation
                    </label>
                    <input
                      id="occupation"
                      name="occupation"
                      type="text"
                      value={formData.occupation}
                      onChange={handleChange}
                      className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="Your occupation"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <Link
                  href="/dashboard"
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
