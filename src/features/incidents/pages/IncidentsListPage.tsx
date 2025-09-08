import React, { useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, RefreshCw, Calendar } from 'lucide-react';
import { format } from 'date-fns';

import { IncidentFilters, IncidentSeverityType } from '../types';
import { useIncidents, useSites, useOutboxStatus, useSyncOutbox } from '../hooks';
import { Button, Input, Select } from '../../../components/forms';

const severityColors = {
  LOW: 'bg-green-100 text-green-800 border-green-200',
  MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
  HIGH: 'bg-orange-100 text-orange-800 border-orange-200',
  CRITICAL: 'bg-red-100 text-red-800 border-red-200'
};

const statusColors = {
  OPEN: 'bg-blue-100 text-blue-800 border-blue-200',
  IN_PROGRESS: 'bg-purple-100 text-purple-800 border-purple-200',
  RESOLVED: 'bg-green-100 text-green-800 border-green-200',
  CLOSED: 'bg-gray-100 text-gray-800 border-gray-200'
};

export const IncidentsListPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);

  // Extract filters from URL params
  const filters = useMemo<IncidentFilters>(() => ({
    q: searchParams.get('q') || '',
    siteId: searchParams.get('siteId') || '',
    severity: (searchParams.get('severity') as IncidentSeverityType) || '',
    status: searchParams.get('status') || '',
    from: searchParams.get('from') || '',
    to: searchParams.get('to') || '',
  }), [searchParams]);

  const { data: sites = [] } = useSites();
  const { data: outboxStatus } = useOutboxStatus();
  const syncOutbox = useSyncOutbox();
  
  const {
    data: incidentsPages,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    isRefetching
  } = useIncidents(filters);

  const incidents = useMemo(() => 
    incidentsPages?.pages.flatMap(page => page.incidents) || [],
    [incidentsPages]
  );

  // Update URL params when filters change
  const updateFilters = (newFilters: Partial<IncidentFilters>) => {
    const params = new URLSearchParams(searchParams);
    
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value.toString());
      } else {
        params.delete(key);
      }
    });
    
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  const handleSync = () => {
    syncOutbox.mutate();
  };

  const siteOptions = [
    { value: '', label: 'All Sites' },
    ...sites.map(site => ({
      value: site.id,
      label: `${site.name} (${site.code})`
    }))
  ];

  const severityOptions = [
    { value: '', label: 'All Severities' },
    { value: 'LOW', label: 'Low' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HIGH', label: 'High' },
    { value: 'CRITICAL', label: 'Critical' },
  ];

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'OPEN', label: 'Open' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'RESOLVED', label: 'Resolved' },
    { value: 'CLOSED', label: 'Closed' },
  ];

  const hasActiveFilters = filters.q || filters.siteId || filters.severity || filters.status || filters.from || filters.to;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Incidents
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {incidents.length > 0 && `${incidents.length} incidents found`}
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Sync status and button */}
              {outboxStatus && outboxStatus.pending > 0 && (
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1 px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                    <div className="h-1.5 w-1.5 bg-orange-500 rounded-full animate-pulse" />
                    <span>{outboxStatus.pending} pending</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSync}
                    loading={syncOutbox.isPending}
                    disabled={!navigator.onLine}
                  >
                    <RefreshCw className="h-4 w-4" />
                    Sync
                  </Button>
                </div>
              )}
              
              <Button
                onClick={() => navigate('/incidents/new')}
                className="bg-blue-600 hover:bg-blue-500"
              >
                <Plus className="h-4 w-4 mr-1" />
                Report Incident
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
          {/* Search bar */}
          <div className="flex items-center space-x-3">
            <div className="flex-1 relative">
              <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="search"
                placeholder="Search incidents..."
                value={filters.q}
                onChange={(e) => updateFilters({ q: e.target.value })}
                className="pl-10"
              />
            </div>
            
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? 'bg-blue-50 border-blue-300' : ''}
            >
              <Filter className="h-4 w-4 mr-1" />
              Filters
              {hasActiveFilters && (
                <span className="ml-1 px-1.5 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                  {[filters.siteId, filters.severity, filters.status, filters.from, filters.to].filter(Boolean).length}
                </span>
              )}
            </Button>
          </div>

          {/* Filter panel */}
          {showFilters && (
            <div className="border-t pt-4 space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <Select
                  value={filters.siteId}
                  onChange={(e) => updateFilters({ siteId: e.target.value })}
                  options={siteOptions}
                />
                
                <Select
                  value={filters.severity}
                  onChange={(e) => updateFilters({ severity: e.target.value as IncidentSeverityType })}
                  options={severityOptions}
                />
                
                <Select
                  value={filters.status}
                  onChange={(e) => updateFilters({ status: e.target.value })}
                  options={statusOptions}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      From Date
                    </label>
                    <Input
                      type="date"
                      value={filters.from}
                      onChange={(e) => updateFilters({ from: e.target.value })}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      To Date
                    </label>
                    <Input
                      type="date"
                      value={filters.to}
                      onChange={(e) => updateFilters({ to: e.target.value })}
                    />
                  </div>
                </div>
                
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    size="sm"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Incidents List */}
      <div className="max-w-7xl mx-auto px-4 pb-8">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="h-5 bg-gray-200 rounded w-1/2" />
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="flex space-x-2">
                      <div className="h-6 bg-gray-200 rounded-full w-16" />
                      <div className="h-6 bg-gray-200 rounded-full w-20" />
                    </div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : incidents.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-gray-400 mb-4">
              <Search className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No incidents found
            </h3>
            <p className="text-gray-500 mb-6">
              {hasActiveFilters 
                ? 'Try adjusting your search or filters'
                : 'Get started by reporting your first incident'
              }
            </p>
            {!hasActiveFilters && (
              <Button onClick={() => navigate('/incidents/new')}>
                <Plus className="h-4 w-4 mr-1" />
                Report Incident
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Incidents grid */}
            <div className="space-y-4">
              {incidents.map((incident) => (
                <div
                  key={incident.id}
                  className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/incidents/${incident.id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${severityColors[incident.severity]}`}>
                          {incident.severity}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[incident.status]}`}>
                          {incident.status.replace('_', ' ')}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-medium text-gray-900 mb-1 truncate">
                        {incident.title}
                      </h3>
                      
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {incident.description}
                      </p>
                      
                      <div className="flex items-center text-sm text-gray-500 space-x-4">
                        <span>{incident.siteName}</span>
                        {incident.location && <span>• {incident.location}</span>}
                        <span>• {format(new Date(incident.reportedAt), 'MMM d, yyyy')}</span>
                      </div>
                    </div>
                    
                    <div className="ml-4 flex flex-col items-end space-y-2">
                      <span className="text-xs text-gray-500">
                        #{incident.id.slice(-6)}
                      </span>
                      {incident.attachments.length > 0 && (
                        <span className="text-xs text-blue-600">
                          {incident.attachments.length} attachment{incident.attachments.length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Load more */}
            {hasNextPage && (
              <div className="text-center pt-6">
                <Button
                  variant="outline"
                  onClick={() => fetchNextPage()}
                  loading={isFetchingNextPage}
                >
                  Load More
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};