export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      sites: {
        Row: {
          id: string
          name: string
          code: string
          location: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          code: string
          location: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          code?: string
          location?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      assets: {
        Row: {
          id: string
          name: string
          code: string
          site_id: string
          type: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          code: string
          site_id: string
          type: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          code?: string
          site_id?: string
          type?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assets_site_id_fkey"
            columns: ["site_id"]
            referencedRelation: "sites"
            referencedColumns: ["id"]
          }
        ]
      }
      incidents: {
        Row: {
          id: string
          title: string
          description: string
          status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
          severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
          site_id: string
          asset_id: string | null
          location: string | null
          reported_by: string
          reported_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          status?: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
          severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
          site_id: string
          asset_id?: string | null
          location?: string | null
          reported_by: string
          reported_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          status?: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
          severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
          site_id?: string
          asset_id?: string | null
          location?: string | null
          reported_by?: string
          reported_at?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "incidents_site_id_fkey"
            columns: ["site_id"]
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_asset_id_fkey"
            columns: ["asset_id"]
            referencedRelation: "assets"
            referencedColumns: ["id"]
          }
        ]
      }
      incident_attachments: {
        Row: {
          id: string
          incident_id: string
          file_name: string
          file_path: string
          file_size: number
          content_type: string
          created_at: string
        }
        Insert: {
          id?: string
          incident_id: string
          file_name: string
          file_path: string
          file_size: number
          content_type: string
          created_at?: string
        }
        Update: {
          id?: string
          incident_id?: string
          file_name?: string
          file_path?: string
          file_size?: number
          content_type?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "incident_attachments_incident_id_fkey"
            columns: ["incident_id"]
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          }
        ]
      }
      incident_timeline: {
        Row: {
          id: string
          incident_id: string
          type: 'CREATED' | 'UPDATED' | 'STATUS_CHANGED' | 'ACTION_CREATED' | 'COMMENT_ADDED'
          description: string
          user_id: string
          user_name: string
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          incident_id: string
          type: 'CREATED' | 'UPDATED' | 'STATUS_CHANGED' | 'ACTION_CREATED' | 'COMMENT_ADDED'
          description: string
          user_id: string
          user_name: string
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          incident_id?: string
          type?: 'CREATED' | 'UPDATED' | 'STATUS_CHANGED' | 'ACTION_CREATED' | 'COMMENT_ADDED'
          description?: string
          user_id?: string
          user_name?: string
          metadata?: Json | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "incident_timeline_incident_id_fkey"
            columns: ["incident_id"]
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          }
        ]
      }
      actions: {
        Row: {
          id: string
          incident_id: string
          title: string
          description: string | null
          status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE'
          priority: 'LOW' | 'MEDIUM' | 'HIGH'
          assignee: string
          assignee_name: string
          due_date: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          incident_id: string
          title: string
          description?: string | null
          status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE'
          priority?: 'LOW' | 'MEDIUM' | 'HIGH'
          assignee: string
          assignee_name: string
          due_date: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          incident_id?: string
          title?: string
          description?: string | null
          status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE'
          priority?: 'LOW' | 'MEDIUM' | 'HIGH'
          assignee?: string
          assignee_name?: string
          due_date?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "actions_incident_id_fkey"
            columns: ["incident_id"]
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      incident_status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
      incident_severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
      action_status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE'
      action_priority: 'LOW' | 'MEDIUM' | 'HIGH'
      timeline_event_type: 'CREATED' | 'UPDATED' | 'STATUS_CHANGED' | 'ACTION_CREATED' | 'COMMENT_ADDED'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}