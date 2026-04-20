
import { RiskStatus, Supplier, Disruption, IntelligenceBrief } from './types';

export const CATEGORIES = [
  'Electronics',
  'Semiconductors',
  'Automotive',
  'Textiles',
  'F&B',
  'Logistics'
];

export const MOCK_SUPPLIERS: Supplier[] = [
  {
    id: 's1',
    name: 'Advanced Micro Circuits',
    category: 'Semiconductors',
    location: 'Taiwan, Hsinchu',
    coordinates: [24.78, 120.99],
    status: RiskStatus.STABLE,
    contactEmail: 'logistics@amc-taiwan.com',
    lastUpdated: '2026-04-15T10:00:00Z'
  },
  {
    id: 's2',
    name: 'Global Logistics Hub',
    category: 'Logistics',
    location: 'Netherlands, Rotterdam',
    coordinates: [51.92, 4.47],
    status: RiskStatus.CAUTION,
    contactEmail: 'ops@glh-rotterdam.nl',
    lastUpdated: '2026-04-15T08:30:00Z'
  },
  {
    id: 's3',
    name: 'South Sea Textiles',
    category: 'Textiles',
    location: 'Vietnam, Ho Chi Minh',
    coordinates: [10.82, 106.62],
    status: RiskStatus.RISKY,
    contactEmail: 'sales@southsea-tex.vn',
    lastUpdated: '2026-04-15T14:15:00Z'
  },
  {
    id: 's4',
    name: 'Bavarian Motor Parts',
    category: 'Automotive',
    location: 'Germany, Munich',
    coordinates: [48.13, 11.58],
    status: RiskStatus.STABLE,
    contactEmail: 'procurement@bmp-ag.de',
    lastUpdated: '2026-04-14T09:00:00Z'
  },
  {
    id: 's5',
    name: 'Tokyo Electron Components',
    category: 'Electronics',
    location: 'Japan, Tokyo',
    coordinates: [35.67, 139.65],
    status: RiskStatus.CAUTION,
    contactEmail: 'support@tokyo-el.jp',
    lastUpdated: '2026-04-15T11:00:00Z'
  },
  {
    id: 's6',
    name: 'Organic Grain Corp',
    category: 'F&B',
    location: 'USA, Chicago',
    coordinates: [41.87, -87.62],
    status: RiskStatus.STABLE,
    contactEmail: 'orders@organic-grain.com',
    lastUpdated: '2026-04-15T16:45:00Z'
  }
];

export const MOCK_DISRUPTIONS: Disruption[] = [
  {
    id: 'd1',
    title: 'Port Strike in Rotterdam',
    type: 'Strike',
    severity: 'High',
    location: 'Netherlands, Rotterdam',
    timestamp: '2026-04-15T06:00:00Z',
    summary: 'Ongoing union strikes at major terminals causing 48-hour vessel delays.',
    impactedSuppliers: ['s2']
  },
  {
    id: 'd2',
    title: 'Typhoon Ewan Alert',
    type: 'Weather',
    severity: 'Medium',
    location: 'Vietnam, Taiwan, South China Sea',
    timestamp: '2026-04-15T18:00:00Z',
    summary: 'Expected heavy rainfall and strong winds affecting regional shipping routes.',
    impactedSuppliers: ['s3', 's1']
  },
  {
    id: 'd3',
    title: 'Semiconductor Shortage Spike',
    type: 'Logistics',
    severity: 'High',
    location: 'Taiwan, Japan, East Asia',
    timestamp: '2026-04-15T09:00:00Z',
    summary: 'Sudden demand spike in consumer electronics straining existing chip allocations.',
    impactedSuppliers: ['s1', 's5']
  }
];

export const HISTORICAL_ARCHIVE_2024 = [
  { id: 202401, title: '2024 Global Logistics Whitepaper', type: 'PDF', date: 'May 2024', category: 'reports', location: 'Global' },
  { id: 202402, title: 'Taiwan Semiconductor Cluster Analysis', type: 'Report', date: 'May 2024', category: 'reports', location: 'Taiwan' },
  { id: 202403, title: 'Maritime Trade Disruption Protocol', type: 'Manual', date: 'Apr 2024', category: 'handbooks', location: 'Maritime' },
  { id: 202404, title: 'Reuters Supply Chain Index 2024', type: 'Link', date: 'Jun 2024', category: 'reports', url: 'https://www.reuters.com', location: 'Global' },
  { id: 202405, title: 'South China Sea Security Brief', type: 'Report', date: 'May 2024', category: 'reports', location: 'South China Sea' },
  { id: 202406, title: 'CASE STUDY: 2024 Rotterdam Port Strike', type: 'Report', date: 'May 2024', category: 'reports', location: 'Rotterdam' },
  { id: 202407, title: 'CASE STUDY: Typhoon Ewan Impact Analysis', type: 'Report', date: 'May 2024', category: 'reports', location: 'South China Sea' },
];
