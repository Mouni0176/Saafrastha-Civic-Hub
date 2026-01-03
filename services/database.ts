
import { Report, User } from '../App';
import { supabase } from './supabase';

export class CivicDB {
  async init(): Promise<boolean> {
    try {
      // Precise check for profiles table and the specific 'email' column reported as missing
      // Using .select('*') is safer during check but specifically accessing 'email' triggers the error we need to catch
      const { error } = await supabase.from('profiles').select('id, email').limit(1);
      
      if (error) {
        // PostgREST error codes: 42P01 = table missing, 42703 = column missing
        if (error.code === '42P01' || error.code === '42703' || error.message.includes('email')) {
          console.warn(`CivicDB Init Error: ${error.message} (${error.code})`);
          return false;
        }
        // If it's just a general connection issue, we log it but don't show the repair modal
        console.warn("CivicDB Sync Alert:", error.message);
        return true; 
      }
      
      // Secondary health check for the reports table
      const { error: reportsError } = await supabase.from('reports').select('id').limit(1);
      if (reportsError && (reportsError.code === '42P01' || reportsError.code === '42703')) {
        console.warn(`CivicDB Reports Table Error: ${reportsError.message}`);
        return false;
      }

      return true;
    } catch (e) {
      console.error("CivicDB Critical Sync Failure:", e);
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

      if (error) {
        return base64Data;
      }

      const { data: publicUrlData } = supabase.storage
        .from('report-images')
        .getPublicUrl(data.path);

      return publicUrlData.publicUrl;
    } catch (err: any) {
      return base64Data;
    }
  }

  async saveUser(user: any): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email.toLowerCase(),
        full_name: user.name,
        role: user.role,
        department: user.department,
        points: user.points || 0,
        password: user.password
      }, { onConflict: 'email' });

    if (error) throw new Error(`Registration Error: ${error.message}`);
  }

  async getUserByEmail(email: string): Promise<any> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // No user found
      throw new Error(`Auth Error: ${error.message}. Is your database set up correctly?`);
    }
    
    if (data) {
      return {
        id: data.id,
        name: data.full_name,
        email: data.email,
        role: data.role,
        points: data.points,
        department: data.department,
        password: data.password
      };
    }
    return null;
  }

  async setSession(user: any | null): Promise<void> {
    if (user) {
      localStorage.setItem('saaf_rasta_session', JSON.stringify(user));
    } else {
      localStorage.removeItem('saaf_rasta_session');
    }
  }

  async getSession(): Promise<any | null> {
    const session = localStorage.getItem('saaf_rasta_session');
    return session ? JSON.parse(session) : null;
  }

  async getAllReports(): Promise<Report[]> {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      if (error.code === '42P01') return []; // Table missing, return empty
      throw new Error(`Feed Error: ${error.message}`);
    }
    
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
      lng: r.lng
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
      })
      .eq('id', updatedReport.id);

    if (error) throw new Error(`Update Error: ${error.message}`);
  }
}

export const dbService = new CivicDB();
