
import { Report, User } from '../App';
import { supabase } from './supabase';

export class CivicDB {
  async init(): Promise<boolean> {
    try {
      // Very fast existence check
      const { error } = await supabase.from('profiles').select('id').limit(1);
      if (error) {
        if (error.code === '42P01' || error.code === '42703') {
          return false;
        }
        return true; 
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  private async uploadImage(base64Data: string, fileName: string): Promise<string | null> {
    try {
      if (!base64Data || !base64Data.startsWith('data:image')) return base64Data;

      const base64Content = base64Data.split(',')[1] || base64Data;
      const byteCharacters = atob(base64Content);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/jpeg' });

      const { data, error } = await supabase.storage
        .from('report-images')
        .upload(`${Date.now()}-${fileName}.jpg`, blob, {
          contentType: 'image/jpeg',
          upsert: true
        });

      if (error) return base64Data;

      const { data: publicUrlData } = supabase.storage
        .from('report-images')
        .getPublicUrl(data.path);

      return publicUrlData.publicUrl;
    } catch (err: any) {
      return base64Data;
    }
  }

  async syncProfile(id: string, email: string, name?: string, role?: string): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: id,
        email: email.toLowerCase(),
        full_name: name,
        role: role || 'citizen',
        points: 0
      }, { onConflict: 'id' });

    if (error) throw new Error(`Profile Sync Error: ${error.message}`);
  }

  async getUserProfile(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) return null;
    
    return {
      id: data.id,
      name: data.full_name || data.email.split('@')[0],
      email: data.email,
      role: data.role,
      points: data.points || 0,
      reportsCount: 0,
      department: data.department
    };
  }

  async getAllReports(): Promise<Report[]> {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return [];
    
    return (data || []).map(r => ({
      id: r.id,
      reporterId: r.reporter_id,
      reporterName: r.reporter_name,
      title: r.title,
      description: r.description,
      location: r.location,
      category: r.category,
      severity: r.severity,
      status: r.status,
      progress: r.progress,
      date: new Date(r.created_at).toLocaleDateString('en-GB'),
      imageUrl: r.image_url,
      supportCount: r.support_count || 0,
      disputeCount: r.dispute_count || 0,
      supportedBy: r.supported_by || [],
      disputedBy: r.disputed_by || [],
      lat: r.lat,
      lng: r.lng,
      // Fallback: assignedUnit is handled in-memory since column is missing in DB
      assignedUnit: undefined 
    }));
  }

  async saveReport(report: Report): Promise<void> {
    const finalImageUrl = await this.uploadImage(report.imageUrl || '', `report-${report.id}`);

    const { error } = await supabase
      .from('reports')
      .insert({
        id: report.id,
        reporter_id: report.reporterId,
        reporter_name: report.reporterName,
        title: report.title,
        description: report.description,
        location: report.location,
        category: report.category,
        severity: report.severity,
        status: report.status,
        progress: report.progress,
        image_url: finalImageUrl,
        lat: report.lat,
        lng: report.lng,
        support_count: 0,
        dispute_count: 0,
        supported_by: [],
        disputed_by: []
        // Removed assigned_unit as it doesn't exist in the DB schema
      });

    if (error) throw new Error(`Report Error: ${error.message}`);
  }

  async updateReport(updatedReport: Report): Promise<void> {
    const { error } = await supabase
      .from('reports')
      .update({
        status: updatedReport.status,
        progress: updatedReport.progress,
        support_count: updatedReport.supportCount,
        dispute_count: updatedReport.disputeCount,
        supported_by: updatedReport.supportedBy,
        disputed_by: updatedReport.disputedBy
        // Removed assigned_unit to fix 'Could not find column' error
      })
      .eq('id', updatedReport.id);

    if (error) throw new Error(`Update Error: ${error.message}`);
  }
}

export const dbService = new CivicDB();
