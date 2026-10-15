'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Stethoscope, Clock, CheckCircle2, AlertTriangle,
  Users, MapPin, ArrowRight, TrendingUp
} from 'lucide-react';
import apiClient from '@/lib/api-client';
import type { DashboardStats } from '@/types/api';
import type { ConsultationListResponse } from '@/types/consultation';
import { formatRelativeTime, statusLabel, priorityLabel } from '@/lib/utils';

function StatCard({
  label, value, icon: Icon, accent, iconBg, delay = '0s'
}: {
  label: string; value: number | string; icon: React.ElementType;
  accent: string; iconBg: string; delay?: string;
}) {
  return (
    <div
      className="stat-card animate-fadeIn"
      style={{ '--card-accent': accent, '--icon-bg': iconBg, animationDelay: delay } as React.CSSProperties}
    >
      <div className="stat-icon">
        <Icon size={22} />
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats]             = useState<DashboardStats | null>(null);
  const [recent, setRecent]           = useState<ConsultationListResponse | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingRecent, setLoadingRecent] = useState(true);

  useEffect(() => {
    apiClient.get<DashboardStats>('/dashboard/stats')
      .then(r => setStats(r.data))
      .finally(() => setLoadingStats(false));

    apiClient.get<ConsultationListResponse>('/consultations?page=1&page_size=5')
      .then(r => setRecent(r.data))
      .finally(() => setLoadingRecent(false));
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Welcome banner */}
      <div style={{
        background: 'linear-gradient(135deg, hsl(221,88%,15%) 0%, hsl(224,85%,12%) 100%)',
        border: '1px solid rgba(59,130,246,0.2)',
        borderRadius: 'var(--radius-xl)',
        padding: '28px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', right: '-40px', top: '-40px',
          width: '200px', height: '200px', borderRadius: '50%',
          background: 'rgba(59,130,246,0.1)',
          pointerEvents: 'none',
        }} />
        <div>
          <h1 style={{ fontSize: '1.375rem', marginBottom: '6px' }}>Good day, Doctor 👋</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Here&apos;s an overview of today&apos;s consultations across all zones.
          </p>
        </div>
        <Link href="/consultations" className="btn btn-primary" style={{ flexShrink: 0 }}>
          <Stethoscope size={16} /> View All Cases
        </Link>
      </div>

      {/* Stats grid */}
      <div>
        <h2 style={{ marginBottom: '16px', fontSize: '1rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
          At a Glance
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
          {loadingStats ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: '140px' }} />
            ))
          ) : stats ? (
            <>
              <StatCard label="Total Cases"      value={stats.total_consultations}    icon={Stethoscope}    accent="hsl(213,91%,60%)" iconBg="hsl(213,91%,8%)"  delay="0s"    />
              <StatCard label="Pending"          value={stats.pending_consultations}  icon={Clock}          accent="hsl(43,96%,56%)"  iconBg="hsl(43,96%,8%)"   delay="0.05s" />
              <StatCard label="In Progress"      value={stats.in_progress_consultations} icon={TrendingUp}  accent="hsl(213,91%,60%)" iconBg="hsl(213,91%,8%)"  delay="0.10s" />
              <StatCard label="Responded"        value={stats.responded_consultations} icon={CheckCircle2}  accent="hsl(142,70%,50%)" iconBg="hsl(142,70%,6%)"  delay="0.15s" />
              <StatCard label="Overdue"          value={stats.overdue_consultations}  icon={AlertTriangle}  accent="hsl(0,84%,60%)"   iconBg="hsl(0,84%,8%)"    delay="0.20s" />
              <StatCard label="Active Zones"     value={stats.active_zones}           icon={MapPin}         accent="hsl(270,91%,65%)" iconBg="hsl(270,91%,8%)"  delay="0.25s" />
            </>
          ) : null}
        </div>
      </div>

      {/* Recent consultations */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '1rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
            Recent Consultations
          </h2>
          <Link href="/consultations" className="btn btn-ghost" style={{ fontSize: '0.8125rem' }}>
            View all <ArrowRight size={14} />
          </Link>
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {loadingRecent ? (
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: '60px' }} />
              ))}
            </div>
          ) : recent?.items.length === 0 ? (
            <div className="empty-state">
              <Stethoscope size={48} />
              <p>No consultations yet.</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Animal</th>
                  <th>Zone</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {recent?.items.map((c, i) => (
                  <tr key={c.id} className={`animate-fadeIn stagger-${Math.min(i + 1, 5)}`}>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.8125rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                        {c.aisp_reference ?? `#${c.id}`}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{c.animal_species}</div>
                      {c.animal_breed && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.animal_breed}</div>}
                    </td>
                    <td>{c.zone_name ?? '—'}</td>
                    <td><span className={`badge badge-${c.priority}`}>{priorityLabel(c.priority)}</span></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div className={`status-dot ${c.status}`} />
                        <span>{statusLabel(c.status)}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: '0.8125rem' }}>{formatRelativeTime(c.submitted_at)}</td>
                    <td>
                      <Link href={`/consultations/${c.id}`} className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: '0.8125rem' }}>
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
