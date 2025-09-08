# Supabase Setup Guide for Kyntri EHS

This guide will help you set up Supabase as the database backend for your Kyntri EHS incident reporting system.

## 🚀 Quick Start

### 1. Create a Supabase Project

1. Go to [Supabase](https://supabase.com) and create a new account
2. Create a new project
3. Wait for the project to be initialized (takes ~2 minutes)

### 2. Set Up the Database Schema

1. Go to the **SQL Editor** in your Supabase dashboard
2. Copy the contents of `supabase-schema.sql` from this repository
3. Paste and run the SQL script to create all tables and sample data

### 3. Configure Storage

1. Go to **Storage** in your Supabase dashboard
2. Create a new bucket named `incident-attachments`
3. Set the bucket to **Private** (not public)
4. Configure policies if you want Row Level Security (optional for now)

### 4. Environment Configuration

1. Copy `.env.example` to `.env`
2. Update the following variables:

```bash
# Enable Supabase
VITE_USE_SUPABASE=true
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Disable mock data (optional)
VITE_USE_MOCK_DATA=false
```

**Finding Your Keys:**
- Go to **Settings** → **API** in your Supabase dashboard
- Copy the **URL** and **anon/public** key

### 5. Test the Integration

1. Start your development server: `npm run dev`
2. Login to your app
3. Try creating a new incident
4. Check your Supabase dashboard to see the data

## 📋 Database Schema Overview

The schema includes the following tables:

### Core Tables
- **sites** - Physical locations/facilities
- **assets** - Equipment and machinery at sites  
- **incidents** - Safety incidents and reports
- **incident_attachments** - Photos and documents
- **incident_timeline** - Audit trail of changes
- **actions** - CAPA (Corrective and Preventive Actions)

### Features
- ✅ UUID primary keys
- ✅ Timestamps with auto-update triggers
- ✅ Foreign key relationships
- ✅ Enums for status/severity values
- ✅ Optimized indexes for performance
- ✅ Sample data included

## 🔐 Authentication (Optional)

Currently the app uses the existing AWS Cognito authentication. To switch to Supabase Auth:

1. **Enable Auth in Supabase:**
   - Configure auth providers in Supabase dashboard
   - Set up email templates and policies

2. **Update the Frontend:**
   - Replace AWS Cognito calls with Supabase auth
   - Update the `AuthProvider` component
   - Modify user session management

## 🔒 Row Level Security (RLS)

For production deployments, consider enabling RLS:

```sql
-- Enable RLS on all tables
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
-- ... etc

-- Create policies based on your security requirements
CREATE POLICY "Users can read their site incidents" 
ON incidents FOR SELECT 
USING (site_id IN (
  SELECT site_id FROM user_site_access WHERE user_id = auth.uid()
));
```

## 📦 Advanced Configuration

### Real-time Subscriptions

Enable real-time updates for live incident tracking:

```typescript
// In your hooks
const { data, error } = useQuery({
  queryKey: ['incidents'],
  queryFn: getIncidents,
});

// Add real-time subscription
useEffect(() => {
  const subscription = supabase
    .channel('incidents')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'incidents'
    }, (payload) => {
      // Refetch incidents when data changes
      queryClient.invalidateQueries(['incidents']);
    })
    .subscribe();

  return () => subscription.unsubscribe();
}, []);
```

### Performance Optimization

1. **Enable Connection Pooling** in Supabase settings
2. **Use Indexes** - already included in schema
3. **Implement Caching** - already setup with React Query

### Backup and Recovery

1. Go to **Settings** → **Database** in Supabase
2. Configure automated backups
3. Set up point-in-time recovery

## 🚀 Deployment

### Vercel/Netlify
1. Add environment variables in deployment platform
2. Ensure `VITE_USE_SUPABASE=true` is set
3. Deploy your app

### AWS Amplify
1. Update build settings to include Supabase env vars
2. Configure the amplify.yml with new environment variables

## 🔧 Troubleshooting

### Common Issues

1. **"Missing Supabase environment variables"**
   - Check that `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set
   - Verify the values are correct from your Supabase dashboard

2. **"Failed to fetch sites/assets"**
   - Ensure the SQL schema was run successfully
   - Check that sample data was inserted
   - Verify your anon key has the correct permissions

3. **File upload failures**
   - Confirm the `incident-attachments` storage bucket exists
   - Check bucket permissions and policies
   - Verify bucket is set to private (not public)

4. **Authentication issues**
   - Currently uses AWS Cognito - no changes needed
   - For Supabase auth, you'll need to implement the auth provider

### Debug Mode

Enable additional logging:

```typescript
// In your api-supabase.ts, add console logs
console.log('Supabase operation:', operation, data);
```

## 📚 Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [React Query Integration](https://tanstack.com/query/latest)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

## 🎯 Next Steps

Once Supabase is working:

1. **Enable Real-time Features** - Live incident updates
2. **Implement Full-Text Search** - Advanced incident search
3. **Add Analytics** - Incident reporting dashboards  
4. **Set up Alerts** - Email notifications for critical incidents
5. **Mobile Offline Sync** - Enhanced PWA capabilities

---

**Need Help?** Check the Supabase community or create an issue in this repository.