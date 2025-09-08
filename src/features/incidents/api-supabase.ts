import { supabase, STORAGE_BUCKET } from '../../lib/supabase';
import { Database } from '../../lib/database.types';
import {
  Incident,
  IncidentCreate,
  IncidentUpdate,
  IncidentListResponse,
  IncidentFilters,
  Action,
  ActionCreate,
  Site,
  Asset,
  Attachment,
  TimelineEvent
} from './types';

type DbIncident = Database['public']['Tables']['incidents']['Row'];
type DbSite = Database['public']['Tables']['sites']['Row'];
type DbAsset = Database['public']['Tables']['assets']['Row'];
type DbAction = Database['public']['Tables']['actions']['Row'];
type DbAttachment = Database['public']['Tables']['incident_attachments']['Row'];
type DbTimeline = Database['public']['Tables']['incident_timeline']['Row'];

export class SupabaseIncidentsApi {
  // Health check
  async health(): Promise<{ ok: boolean }> {
    const { error } = await supabase.from('sites').select('count').limit(1);
    return { ok: !error };
  }

  // Helper function to transform database incident to app incident
  private transformIncident(
    dbIncident: DbIncident,
    site?: DbSite,
    asset?: DbAsset,
    attachments: DbAttachment[] = [],
    timeline: DbTimeline[] = [],
    actions: DbAction[] = []
  ): Incident {
    return {
      id: dbIncident.id,
      title: dbIncident.title,
      description: dbIncident.description,
      status: dbIncident.status as any,
      severity: dbIncident.severity as any,
      siteId: dbIncident.site_id,
      siteName: site?.name || 'Unknown Site',
      assetId: dbIncident.asset_id || undefined,
      assetName: asset?.name,
      location: dbIncident.location || undefined,
      reportedBy: dbIncident.reported_by,
      reportedAt: dbIncident.reported_at,
      updatedAt: dbIncident.updated_at,
      attachments: attachments.map(att => ({
        bucketKey: att.file_path,
        contentType: att.content_type,
        size: att.file_size,
        originalName: att.file_name
      })),
      timeline: timeline.map(t => ({
        id: t.id,
        incidentId: t.incident_id,
        type: t.type as any,
        description: t.description,
        userId: t.user_id,
        userName: t.user_name,
        timestamp: t.created_at,
        metadata: t.metadata as any
      })),
      actions: actions.map(a => ({
        id: a.id,
        incidentId: a.incident_id,
        title: a.title,
        description: a.description || undefined,
        status: a.status as any,
        priority: a.priority as any,
        assignee: a.assignee,
        assigneeName: a.assignee_name,
        dueDate: a.due_date,
        createdAt: a.created_at,
        updatedAt: a.updated_at,
        notes: a.notes || undefined
      }))
    };
  }

  // Sites
  async getSites(): Promise<Site[]> {
    const { data, error } = await supabase
      .from('sites')
      .select('*')
      .order('name');

    if (error) throw new Error(`Failed to fetch sites: ${error.message}`);

    return data.map(site => ({
      id: site.id,
      name: site.name,
      code: site.code,
      location: site.location
    }));
  }

  async getSite(id: string): Promise<Site> {
    const { data, error } = await supabase
      .from('sites')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new Error(`Failed to fetch site: ${error.message}`);

    return {
      id: data.id,
      name: data.name,
      code: data.code,
      location: data.location
    };
  }

  // Assets
  async getAssets(siteId?: string): Promise<Asset[]> {
    let query = supabase.from('assets').select('*').order('name');
    
    if (siteId) {
      query = query.eq('site_id', siteId);
    }

    const { data, error } = await query;
    if (error) throw new Error(`Failed to fetch assets: ${error.message}`);

    return data.map(asset => ({
      id: asset.id,
      name: asset.name,
      code: asset.code,
      siteId: asset.site_id,
      type: asset.type
    }));
  }

  async getAsset(id: string): Promise<Asset> {
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new Error(`Failed to fetch asset: ${error.message}`);

    return {
      id: data.id,
      name: data.name,
      code: data.code,
      siteId: data.site_id,
      type: data.type
    };
  }

  // Incidents
  async getIncidents(filters: IncidentFilters = {}): Promise<IncidentListResponse> {
    let query = supabase
      .from('incidents')
      .select(`
        *,
        sites!inner(*),
        assets(*),
        incident_attachments(*),
        incident_timeline(*),
        actions(*)
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters.q) {
      query = query.or(`title.ilike.%${filters.q}%,description.ilike.%${filters.q}%`);
    }
    
    if (filters.siteId) {
      query = query.eq('site_id', filters.siteId);
    }
    
    if (filters.severity) {
      query = query.eq('severity', filters.severity);
    }
    
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    
    if (filters.from) {
      query = query.gte('reported_at', filters.from);
    }
    
    if (filters.to) {
      query = query.lte('reported_at', filters.to);
    }

    // Pagination
    const limit = filters.limit || 20;
    query = query.limit(limit);
    
    if (filters.pageKey) {
      // Use cursor-based pagination
      query = query.lt('created_at', filters.pageKey);
    }

    const { data, error } = await query;
    if (error) throw new Error(`Failed to fetch incidents: ${error.message}`);

    const incidents = data.map((row: any) => 
      this.transformIncident(
        row,
        row.sites,
        row.assets,
        row.incident_attachments || [],
        row.incident_timeline || [],
        row.actions || []
      )
    );

    return {
      incidents,
      totalCount: incidents.length,
      nextPageKey: incidents.length === limit ? incidents[incidents.length - 1].reportedAt : undefined
    };
  }

  async getIncident(id: string): Promise<Incident> {
    const { data, error } = await supabase
      .from('incidents')
      .select(`
        *,
        sites!inner(*),
        assets(*),
        incident_attachments(*),
        incident_timeline(*),
        actions(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw new Error(`Failed to fetch incident: ${error.message}`);

    return this.transformIncident(
      data,
      data.sites,
      data.assets,
      data.incident_attachments || [],
      data.incident_timeline || [],
      data.actions || []
    );
  }

  async createIncident(incident: IncidentCreate): Promise<{ id: string; status: string }> {
    // Get current user (you might want to implement proper auth)
    const { data: { user } } = await supabase.auth.getUser();
    const reportedBy = user?.email || 'anonymous';

    const { data, error } = await supabase
      .from('incidents')
      .insert({
        title: incident.title,
        description: incident.description,
        severity: incident.severity,
        site_id: incident.siteId,
        asset_id: incident.assetId || null,
        location: incident.location || null,
        reported_by: reportedBy,
        reported_at: incident.reportedAt || new Date().toISOString(),
        status: 'OPEN'
      })
      .select('id')
      .single();

    if (error) throw new Error(`Failed to create incident: ${error.message}`);

    const incidentId = data.id;

    // Create timeline entry
    await supabase.from('incident_timeline').insert({
      incident_id: incidentId,
      type: 'CREATED',
      description: 'Incident reported',
      user_id: user?.id || 'anonymous',
      user_name: user?.email || reportedBy
    });

    // Handle attachments
    if (incident.attachments && incident.attachments.length > 0) {
      const attachmentInserts = incident.attachments.map(att => ({
        incident_id: incidentId,
        file_name: att.originalName || 'attachment',
        file_path: att.bucketKey,
        file_size: att.size || 0,
        content_type: att.contentType
      }));

      const { error: attachError } = await supabase
        .from('incident_attachments')
        .insert(attachmentInserts);

      if (attachError) {
        console.error('Failed to save attachments:', attachError);
      }
    }

    return { id: incidentId, status: 'created' };
  }

  async updateIncident(id: string, updates: IncidentUpdate): Promise<Incident> {
    const { data, error } = await supabase
      .from('incidents')
      .update({
        ...(updates.title && { title: updates.title }),
        ...(updates.description && { description: updates.description }),
        ...(updates.status && { status: updates.status }),
        ...(updates.severity && { severity: updates.severity }),
        ...(updates.assignedTo && { assigned_to: updates.assignedTo }),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update incident: ${error.message}`);

    // Add timeline entry if status changed
    if (updates.status) {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('incident_timeline').insert({
        incident_id: id,
        type: 'STATUS_CHANGED',
        description: `Status changed to ${updates.status}`,
        user_id: user?.id || 'system',
        user_name: user?.email || 'System'
      });
    }

    return this.getIncident(id);
  }

  async deleteIncident(id: string): Promise<void> {
    const { error } = await supabase
      .from('incidents')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Failed to delete incident: ${error.message}`);
  }

  // Actions
  async createAction(incidentId: string, action: ActionCreate): Promise<{ id: string; status: string }> {
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('actions')
      .insert({
        incident_id: incidentId,
        title: action.title,
        description: action.description || null,
        assignee: action.assignee,
        assignee_name: action.assigneeName || 'Unknown',
        due_date: action.dueDate,
        priority: action.priority || 'MEDIUM',
        notes: action.notes || null,
        status: 'PENDING'
      })
      .select('id')
      .single();

    if (error) throw new Error(`Failed to create action: ${error.message}`);

    // Add timeline entry
    await supabase.from('incident_timeline').insert({
      incident_id: incidentId,
      type: 'ACTION_CREATED',
      description: `Action created: ${action.title}`,
      user_id: user?.id || 'system',
      user_name: user?.email || 'System'
    });

    return { id: data.id, status: 'created' };
  }

  async updateAction(actionId: string, updates: Partial<Action>): Promise<Action> {
    const { data, error } = await supabase
      .from('actions')
      .update({
        ...(updates.title && { title: updates.title }),
        ...(updates.description && { description: updates.description }),
        ...(updates.status && { status: updates.status }),
        ...(updates.priority && { priority: updates.priority }),
        ...(updates.assignee && { assignee: updates.assignee }),
        ...(updates.assigneeName && { assignee_name: updates.assigneeName }),
        ...(updates.dueDate && { due_date: updates.dueDate }),
        ...(updates.notes && { notes: updates.notes }),
        updated_at: new Date().toISOString()
      })
      .eq('id', actionId)
      .select()
      .single();

    if (error) throw new Error(`Failed to update action: ${error.message}`);

    return {
      id: data.id,
      incidentId: data.incident_id,
      title: data.title,
      description: data.description || undefined,
      status: data.status as any,
      priority: data.priority as any,
      assignee: data.assignee,
      assigneeName: data.assignee_name,
      dueDate: data.due_date,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      notes: data.notes || undefined
    };
  }

  async getActions(incidentId?: string): Promise<Action[]> {
    let query = supabase.from('actions').select('*').order('created_at', { ascending: false });
    
    if (incidentId) {
      query = query.eq('incident_id', incidentId);
    }

    const { data, error } = await query;
    if (error) throw new Error(`Failed to fetch actions: ${error.message}`);

    return data.map(action => ({
      id: action.id,
      incidentId: action.incident_id,
      title: action.title,
      description: action.description || undefined,
      status: action.status as any,
      priority: action.priority as any,
      assignee: action.assignee,
      assigneeName: action.assignee_name,
      dueDate: action.due_date,
      createdAt: action.created_at,
      updatedAt: action.updated_at,
      notes: action.notes || undefined
    }));
  }

  // File upload to Supabase Storage
  async uploadFile(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<{ bucketKey: string; contentType: string; size: number }> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `incidents/${fileName}`;

    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw new Error(`Failed to upload file: ${error.message}`);

    // Note: Supabase doesn't provide progress callbacks for uploads yet
    if (onProgress) onProgress(100);

    return {
      bucketKey: data.path,
      contentType: file.type,
      size: file.size
    };
  }

  // Batch upload files
  async uploadFiles(
    files: File[],
    onProgress?: (fileIndex: number, progress: number) => void
  ): Promise<{ bucketKey: string; contentType: string; size: number }[]> {
    const uploadPromises = files.map(async (file, index) => {
      const result = await this.uploadFile(
        file,
        (progress) => onProgress?.(index, progress)
      );
      return result;
    });

    return Promise.all(uploadPromises);
  }

  // Get signed URL for file access
  async getFileUrl(bucketKey: string): Promise<string> {
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(bucketKey, 3600); // 1 hour expiry

    if (error) throw new Error(`Failed to get file URL: ${error.message}`);
    return data.signedUrl;
  }
}

export const supabaseIncidentsApi = new SupabaseIncidentsApi();