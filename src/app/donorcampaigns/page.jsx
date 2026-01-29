"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { CampaignList } from "@/components/campaigns/campaign-list";
import { useCampaigns } from "@/hooks/use-campaigns";
import Link from "next/link";
import { Users, TrendingUp } from "lucide-react";
import { LogoutButton } from "@/components/logout-button";

function getNavigation() {
  return [
    { name: "My Profile", href: "/profile", icon: Users },
    { name: "Campaigns", href: "/donorcampaigns", icon: TrendingUp },
  ];
}

export default function DonorCampaignsPage() {
  return <DonorCampaignsClient />;
}

function DonorCampaignsClient() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const { data, loading, error, pagination } = useCampaigns({
    search: debouncedSearch,
    status,
    sortBy,
    sortOrder,
    page,
    limit: 20,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <>
      {/* Navigation header (donor style) */}
      <nav className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo and main nav */}
            <div className="flex items-center gap-8">
              <Link href="/" className="text-xl font-bold text-blue-700 hover:underline">DonorConnect</Link>
              <div className="hidden md:flex gap-1">
                {getNavigation().map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                    >
                      <Icon className="h-4 w-4" />
                      <span className="hidden sm:inline">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
            {/* User info and logout */}
            <div className="flex items-center gap-4">
              <LogoutButton />
            </div>
          </div>
          {/* Mobile navigation */}
          <div className="md:hidden flex gap-1 pb-2 overflow-x-auto">
            {getNavigation().map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors whitespace-nowrap"
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
      {/* Main content */}
      <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Campaigns</h1>
        </div>
        {/* Filters */}
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="text-sm font-medium mb-1.5 block">Search</label>
            <Input
              placeholder="Search campaigns..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="w-48">
            <label className="text-sm font-medium mb-1.5 block">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">All Status</option>
              <option value="DRAFT">Draft</option>
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
          <div className="w-48">
            <label className="text-sm font-medium mb-1.5 block">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="createdAt">Date Created</option>
              <option value="name">Name</option>
              <option value="startDate">Start Date</option>
              <option value="endDate">End Date</option>
              <option value="goal">Goal</option>
            </select>
          </div>
          <div className="w-32">
            <label className="text-sm font-medium mb-1.5 block">Order</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
        </div>
        {/* Results */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
            {error}
          </div>
        )}
        {loading ? (
          <div className="text-center py-12">Loading campaigns...</div>
        ) : (
          <>
            <CampaignList campaigns={data} hideActions={true} />
            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <button
                  className="px-4 py-2 rounded border bg-white text-gray-700 disabled:opacity-50"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </button>
                <span className="py-2 px-4">
                  Page {page} of {pagination.pages}
                </span>
                <button
                  className="px-4 py-2 rounded border bg-white text-gray-700 disabled:opacity-50"
                  disabled={page === pagination.pages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
