"use client";

import { useState, useEffect, FormEvent } from "react";

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
  isActive: boolean;
}

interface EditMemberModalProps {
  member: Member | null;
  onClose: () => void;
  onSave: () => void;
}

export default function EditMemberModal({ member, onClose, onSave }: EditMemberModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    homeNumber: "",
    phone: "",
    address: "",
    housingType: "",
    fatherName: "",
    motherName: "",
    spouseName: "",
    childrenCount: "",
    occupation: "",
    isActive: true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name || "",
        email: member.email || "",
        homeNumber: member.homeNumber || "",
        phone: member.phone || "",
        address: member.address || "",
        housingType: member.housingType || "",
        fatherName: member.fatherName || "",
        motherName: member.motherName || "",
        spouseName: member.spouseName || "",
        childrenCount: member.childrenCount?.toString() || "",
        occupation: member.occupation || "",
        isActive: member.isActive,
      });
    }
  }, [member]);

  if (!member) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const response = await fetch("/api/admin/members", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: member._id,
          name: formData.name,
          email: formData.email,
          homeNumber: formData.homeNumber || undefined,
          phone: formData.phone || undefined,
          address: formData.address || undefined,
          housingType: formData.housingType || undefined,
          fatherName: formData.fatherName || undefined,
          motherName: formData.motherName || undefined,
          spouseName: formData.spouseName || undefined,
          childrenCount: formData.childrenCount ? parseInt(formData.childrenCount) : undefined,
          occupation: formData.occupation || undefined,
          isActive: formData.isActive,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update member");
      }

      onSave();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to update member");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 my-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              Edit Member: {member.membershipNumber}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <span className="text-2xl">&times;</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 max-h-[70vh] overflow-y-auto">
          {error && (
            <div className="rounded-md bg-red-50 p-4 mb-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Basic Information */}
          <div className="mb-6">
            <h4 className="text-md font-medium text-gray-900 mb-3">Basic Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Name *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* Housing Information */}
          <div className="mb-6 pb-6 border-b border-gray-200">
            <h4 className="text-md font-medium text-gray-900 mb-3">Housing Information</h4>
            <div className="space-y-4">
              <div>
                <label htmlFor="homeNumber" className="block text-sm font-medium text-gray-700">
                  Home Number
                </label>
                <input
                  id="homeNumber"
                  name="homeNumber"
                  type="text"
                  value={formData.homeNumber}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="e.g., H123, A-45"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Members with the same home number are considered from the same household
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
          <div className="mb-6 pb-6 border-b border-gray-200">
            <h4 className="text-md font-medium text-gray-900 mb-3">Parent Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="fatherName" className="block text-sm font-medium text-gray-700">
                  Father&apos;s Name
                </label>
                <input
                  id="fatherName"
                  name="fatherName"
                  type="text"
                  value={formData.fatherName}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="motherName" className="block text-sm font-medium text-gray-700">
                  Mother&apos;s Name
                </label>
                <input
                  id="motherName"
                  name="motherName"
                  type="text"
                  value={formData.motherName}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* Family Information */}
          <div className="mb-6 pb-6 border-b border-gray-200">
            <h4 className="text-md font-medium text-gray-900 mb-3">Family Information</h4>
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
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="mb-6 pb-6 border-b border-gray-200">
            <h4 className="text-md font-medium text-gray-900 mb-3">Contact Information</h4>
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
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* Account Status */}
          <div className="mb-6">
            <h4 className="text-md font-medium text-gray-900 mb-3">Account Status</h4>
            <div className="flex items-center">
              <input
                id="isActive"
                name="isActive"
                type="checkbox"
                checked={formData.isActive}
                onChange={handleChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                Active Member
              </label>
            </div>
          </div>
        </form>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
