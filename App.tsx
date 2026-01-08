
import React, { useState, useEffect, useMemo, Suspense, lazy } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import { dbService } from './services/database';
import { supabase } from './services/supabase';
import { Loader2, ShieldCheck, RefreshCw, AlertCircle, X, ArrowRight } from 'lucide-react';

// Lazy load components for performance
// Added About component to the lazy load list
const About = lazy(() => import('./components/About'));
const HowItWorks = lazy(() => import('./components/HowItWorks'));
const Features = lazy(() => import('./components/Features'));
const FeatureDetail = lazy(() => import('./components/FeatureDetail'));
const UserDashboard = lazy(() => import('./components/UserDashboard'));
const GovDashboard = lazy(() => import('./components/GovDashboard'));
const PublicReports = lazy(() => import('./components/PublicReports'));
const HelpCenter = lazy(() => import('./components/HelpCenter'));
const ReportAbuse = lazy(() => import('./components/ReportAbuse'));
const NotificationsView = lazy(() => import('./components/NotificationsView'));
const ReportModal = lazy(() => import('./components/ReportModal'));
const AuthModal = lazy(() => import('./components/AuthModal'));
const Footer = lazy(() => import('./components/Footer'));

export type UserRole = 'citizen' | 'authority';
// Added 'about' to AppView type definition to allow navigation to About page
export type AppView = 'home' | 'about' | 'features' | 'process' | 'public_reports' | 'dashboard' | 'feature_detail' | 'help_center' | 'report_abuse' | 'notifications';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  points: number;
  reportsCount: number;
  department?: string;
}

export interface Report {
  id: string;
  reporterId: string;
  reporterName: string;
  title: string;
  description: string;
  location: string;
  category: string;
  severity: string;
  status: 'New' | 'In Progress' | 'Resolved';
  progress: number;
  date: string;
  imageUrl?: string;
  supportCount: number;
  dis