import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  User, 
  FileText, 
  Plus,
  ExternalLink,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';

import { useIncident, useCreateAction, useActions } from '../hooks';
import { Button } from '../../../components/forms';
import { ActionCreate } from '../types';

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

const actionStatusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
  OVERDUE: 'bg-red-100 text-red-800'
};

export const IncidentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showCreateAction, setShowCreateAction] = useState(false);

  const { data: incident, isLoading, error } = useIncident(id!);
  const { data: actions = [] } = useActions(id);
  const createAction = useCreateAction();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3" />
            <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
              <div className="h-6 bg-gray-200 rounded w-1/2" />
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-3/4" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !incident) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Incident not found
            </h3>
            <p className="text-gray-500 mb-6">
              The incident you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate('/incidents')}>
              Back to Incidents
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleCreateAction = async (actionData: ActionCreate) => {
    try {
      await createAction.mutateAsync({
        incidentId: incident.id,
        action: actionData
      });
      setShowCreateAction(false);
    } catch (error) {
      console.error('Failed to create action:', error);
    }
  };

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
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${severityColors[incident.severity]}`}>
                    {incident.severity}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[incident.status]}`}>
                    {incident.status.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-gray-500">
                    #{incident.id.slice(-8)}
                  </span>
                </div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {incident.title}
                </h1>
              </div>
            </div>
            
            <Button
              onClick={() => setShowCreateAction(true)}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Action
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Main Details */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Incident Details
          </h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Description
              </h3>
              <p className="text-gray-900 whitespace-pre-wrap">
                {incident.description}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">
                  Site
                </h4>
                <div className="flex items-center text-gray-900">
                  <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                  {incident.siteName}
                </div>
              </div>

              {incident.location && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">
                    Location
                  </h4>
                  <p className="text-gray-900">{incident.location}</p>
                </div>
              )}

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">
                  Reported By
                </h4>
                <div className="flex items-center text-gray-900">
                  <User className="h-4 w-4 mr-1 text-gray-400" />
                  {incident.reportedBy}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">
                  Reported At
                </h4>
                <div className="flex items-center text-gray-900">
                  <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                  {format(new Date(incident.reportedAt), 'MMM d, yyyy h:mm a')}
                </div>
              </div>

              {incident.assetName && (
                <div className="md:col-span-2">
                  <h4 className="text-sm font-medium text-gray-700 mb-1">
                    Related Asset
                  </h4>
                  <p className="text-gray-900">{incident.assetName}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Attachments */}
        {incident.attachments.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Attachments ({incident.attachments.length})
            </h2>
            
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {incident.attachments.map((attachment, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <FileText className="h-8 w-8 text-blue-500 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {attachment.originalName || 'Attachment'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {attachment.contentType}
                          {attachment.size && ` • ${Math.round(attachment.size / 1024)}KB`}
                        </p>
                      </div>
                    </div>
                    <button
                      className="text-gray-400 hover:text-blue-500 ml-2"
                      onClick={() => {
                        // TODO: Open attachment in new tab using signed URL
                        console.log('Opening attachment:', attachment.bucketKey);
                      }}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">
              Actions ({actions.length})
            </h2>
          </div>
          
          {actions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No actions have been created yet</p>
              <Button
                variant="outline"
                onClick={() => setShowCreateAction(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Create First Action
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {actions.map((action) => (
                <div
                  key={action.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${actionStatusColors[action.status]}`}>
                          {action.status.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-gray-500">
                          Priority: {action.priority}
                        </span>
                      </div>
                      
                      <h3 className="text-sm font-medium text-gray-900 mb-1">
                        {action.title}
                      </h3>
                      
                      {action.description && (
                        <p className="text-sm text-gray-600 mb-2">
                          {action.description}
                        </p>
                      )}
                      
                      <div className="flex items-center text-xs text-gray-500 space-x-4">
                        <span>Assigned to: {action.assigneeName}</span>
                        <span>Due: {format(new Date(action.dueDate), 'MMM d, yyyy')}</span>
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      #{action.id.slice(-6)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Timeline */}
        {incident.timeline.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Timeline ({incident.timeline.length})
            </h2>
            
            <div className="space-y-4">
              {incident.timeline.map((event) => (
                <div key={event.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    <Clock className="h-4 w-4 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">
                      {event.description}
                    </p>
                    <div className="flex items-center text-xs text-gray-500 mt-1 space-x-2">
                      <span>{event.userName}</span>
                      <span>•</span>
                      <span>{format(new Date(event.timestamp), 'MMM d, yyyy h:mm a')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create Action Modal would go here */}
      {showCreateAction && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Create Action
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              This would be a form to create a new action...
            </p>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowCreateAction(false)}
              >
                Cancel
              </Button>
              <Button onClick={() => setShowCreateAction(false)}>
                Create Action
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};