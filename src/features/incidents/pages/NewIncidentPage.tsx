import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { z } from 'zod';

import { IncidentCreateSchema, IncidentCreate, IncidentSeverityType } from '../types';
import { useCreateIncident, useSites, useAssets } from '../hooks';
import { 
  Button, 
  FormField, 
  Input, 
  Textarea, 
  Select, 
  FileUpload,
  SeverityToggle
} from '../../../components/forms';

type IncidentFormData = IncidentCreate & {
  files: File[];
};

export const NewIncidentPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedSite, setSelectedSite] = useState<string>('');
  
  const { data: sites = [], isLoading: sitesLoading } = useSites();
  const { data: assets = [], isLoading: assetsLoading } = useAssets(selectedSite);
  const createIncident = useCreateIncident();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    reset
  } = useForm<IncidentFormData>({
    resolver: zodResolver(IncidentCreateSchema.extend({
      files: z.array(z.instanceof(File)).optional().default([])
    })),
    defaultValues: {
      title: '',
      description: '',
      severity: 'MEDIUM',
      siteId: '',
      assetId: '',
      location: '',
      files: []
    }
  });

  const watchedSiteId = watch('siteId');
  React.useEffect(() => {
    setSelectedSite(watchedSiteId);
    if (watchedSiteId) {
      setValue('assetId', ''); // Reset asset when site changes
    }
  }, [watchedSiteId, setValue]);

  const onSubmit = async (data: IncidentFormData) => {
    try {
      const { files, ...incidentData } = data;
      
      const incident = await createIncident.mutateAsync({
        ...incidentData,
        files: files || []
      });

      toast.success('Incident reported successfully');
      
      // Navigate to the incident detail page or incidents list
      navigate('/incidents', { 
        replace: true,
        state: { newIncidentId: incident.id }
      });
    } catch (error: any) {
      console.error('Failed to create incident:', error);
      // Error is handled by the mutation hook
    }
  };

  const handleCancel = () => {
    if (window.confirm('Discard this incident report? All information will be lost.')) {
      reset();
      navigate('/incidents');
    }
  };

  // Location detection
  const [locationLoading, setLocationLoading] = useState(false);
  
  const detectLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by this browser');
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setValue('location', `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
        setLocationLoading(false);
        toast.success('Location detected');
      },
      (error) => {
        setLocationLoading(false);
        toast.error('Failed to detect location');
        console.error('Geolocation error:', error);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const siteOptions = sites.map(site => ({
    value: site.id,
    label: `${site.name} (${site.code})`
  }));

  const assetOptions = assets.map(asset => ({
    value: asset.id,
    label: `${asset.name} (${asset.code})`
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => navigate('/incidents')}
                className="p-2 -ml-2 text-gray-400 hover:text-gray-600 rounded-md"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-6 w-6 text-orange-500" />
                <h1 className="text-xl font-semibold text-gray-900">
                  Report Incident
                </h1>
              </div>
            </div>
            
            {/* Online/Offline indicator */}
            <div className="flex items-center space-x-2">
              <div className={`h-2 w-2 rounded-full ${
                navigator.onLine ? 'bg-green-500' : 'bg-orange-500'
              }`} />
              <span className="text-sm text-gray-500">
                {navigator.onLine ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Basic Information
            </h2>
            
            <div className="space-y-4">
              {/* Title */}
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <FormField 
                    label="Incident Title" 
                    error={errors.title} 
                    required
                  >
                    <Input
                      {...field}
                      placeholder="Brief description of what happened"
                      error={errors.title?.message}
                    />
                  </FormField>
                )}
              />

              {/* Description */}
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <FormField 
                    label="Detailed Description" 
                    error={errors.description} 
                    required
                  >
                    <Textarea
                      {...field}
                      placeholder="Provide detailed information about the incident, including what happened, when, and any immediate actions taken..."
                      rows={4}
                      error={errors.description?.message}
                    />
                  </FormField>
                )}
              />

              {/* Severity */}
              <Controller
                name="severity"
                control={control}
                render={({ field }) => (
                  <FormField 
                    label="Severity Level" 
                    error={errors.severity} 
                    required
                  >
                    <SeverityToggle
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.severity?.message}
                    />
                  </FormField>
                )}
              />
            </div>
          </div>

          {/* Location Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Location Information
            </h2>
            
            <div className="grid gap-4 md:grid-cols-2">
              {/* Site */}
              <Controller
                name="siteId"
                control={control}
                render={({ field }) => (
                  <FormField 
                    label="Site" 
                    error={errors.siteId} 
                    required
                  >
                    <Select
                      {...field}
                      options={siteOptions}
                      placeholder="Select a site"
                      error={errors.siteId?.message}
                      disabled={sitesLoading}
                    />
                  </FormField>
                )}
              />

              {/* Asset */}
              <Controller
                name="assetId"
                control={control}
                render={({ field }) => (
                  <FormField 
                    label="Asset (Optional)" 
                    error={errors.assetId}
                  >
                    <Select
                      {...field}
                      options={assetOptions}
                      placeholder="Select an asset"
                      error={errors.assetId?.message}
                      disabled={!selectedSite || assetsLoading}
                    />
                  </FormField>
                )}
              />

              {/* Location */}
              <div className="md:col-span-2">
                <Controller
                  name="location"
                  control={control}
                  render={({ field }) => (
                    <FormField 
                      label="Specific Location" 
                      error={errors.location}
                    >
                      <div className="flex space-x-2">
                        <Input
                          {...field}
                          placeholder="Building, floor, room, coordinates, etc."
                          error={errors.location?.message}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="md"
                          onClick={detectLocation}
                          loading={locationLoading}
                          disabled={locationLoading}
                        >
                          <MapPin className="h-4 w-4" />
                          GPS
                        </Button>
                      </div>
                    </FormField>
                  )}
                />
              </div>
            </div>
          </div>

          {/* Attachments */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Photos & Documents
            </h2>
            
            <Controller
              name="files"
              control={control}
              render={({ field }) => (
                <FileUpload
                  onFilesChange={field.onChange}
                  value={field.value}
                  maxFiles={10}
                  maxSize={10 * 1024 * 1024} // 10MB
                  accept={{
                    'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
                    'application/pdf': ['.pdf'],
                    'text/plain': ['.txt'],
                    'application/msword': ['.doc'],
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
                  }}
                />
              )}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={isSubmitting || createIncident.isPending}
              disabled={isSubmitting || createIncident.isPending}
            >
              {isSubmitting || createIncident.isPending ? 'Reporting...' : 'Report Incident'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};