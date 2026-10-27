/**
 * Gym Management System (GMS) - LocalStorage Data Layer & Persistence Contract
 * Note: LocalStorage is browser-local demonstration storage for PBL, not a remote database.
 */

const GMSStorage = (function () {
  'use strict';

  const KEYS = {
    MEMBERS: 'gms_members',
    PLANS: 'gms_plans',
    MEMBERSHIPS: 'gms_memberships',
    INITIALIZED: 'gms_initialized'
  };

  // Seed sample demonstration data
  const DEFAULT_MEMBERS = [
    {
      id: 'MEM-1001',
      fullName: 'Sarah Jenkins',
      email: 'sarah.jenkins@example.com',
      phone: '+1-555-0142',
      age: 28,
      gender: 'Female',
      address: '742 Evergreen Terrace, Springfield',
      registrationDate: '2026-01-15',
      status: 'Active'
    },
    {
      id: 'MEM-1002',
      fullName: 'Marcus Vance',
      email: 'marcus.vance@example.com',
      phone: '+1-555-0188',
      age: 34,
      gender: 'Male',
      address: '104 Ocean Drive, Miami',
      registrationDate: '2026-02-10',
      status: 'Active'
    },
    {
      id: 'MEM-1003',
      fullName: 'Priya Sharma',
      email: 'priya.sharma@example.com',
      phone: '+1-555-0199',
      age: 24,
      gender: 'Female',
      address: '22 Bakers Street, London',
      registrationDate: '2026-03-01',
      status: 'Active'
    },
    {
      id: 'MEM-1004',
      fullName: 'David Chen',
      email: 'david.chen@example.com',
      phone: '+1-555-0123',
      age: 42,
      gender: 'Male',
      address: '55 Lincoln Ave, Chicago',
      registrationDate: '2025-11-20',
      status: 'Inactive'
    },
    {
      id: 'MEM-1005',
      fullName: 'Elena Rostova',
      email: 'elena.rostova@example.com',
      phone: '+1-555-0177',
      age: 30,
      gender: 'Female',
      address: '89 Sunset Blvd, Los Angeles',
      registrationDate: '2026-04-05',
      status: 'Active'
    },
    {
      id: 'MEM-1006',
      fullName: 'Jordan Taylor',
      email: 'jordan.taylor@example.com',
      phone: '+1-555-0155',
      age: 22,
      gender: 'Other',
      address: '12 Pine Road, Seattle',
      registrationDate: '2026-04-18',
      status: 'Pending'
    }
  ];

  const DEFAULT_PLANS = [
    {
      id: 'PLAN-101',
      name: 'Basic Fitness',
      description: 'Standard cardio and strength machine access for everyday fitness enthusiasts.',
      durationMonths: 1,
      price: 49,
      benefits: ['Cardio area access', 'Weight machine floor', 'Locker room access', 'Free high-speed WiFi'],
      status: 'Active'
    },
    {
      id: 'PLAN-102',
      name: 'Pro Strength & Cardio',
      description: 'Comprehensive fitness bundle with group classes and personal coaching consults.',
      durationMonths: 3,
      price: 129,
      benefits: ['Full gym floor access', 'Unlimited group fitness classes', '2 Personal Trainer sessions', 'Sauna & steam room', 'Locker with towel service'],
      status: 'Active'
    },
    {
      id: 'PLAN-103',
      name: 'Elite Annual Champion',
      description: 'All-inclusive VIP membership with unrestricted 24/7 access and personalized nutrition.',
      durationMonths: 12,
      price: 449,
      benefits: ['24/7 Priority gym access', 'Unlimited PT sessions', 'Complete nutrition & meal plan', 'Sauna, steam room & hydro-pool', 'Free guest passes (2/month)', 'VIP lounge access'],
      status: 'Active'
    },
    {
      id: 'PLAN-104',
      name: 'Weekend Warrior',
      description: 'Ideal for busy professionals who train primarily Friday through Sunday.',
      durationMonths: 6,
      price: 199,
      benefits: ['Friday - Sunday full access', 'Group classes on weekends', 'Standard locker access'],
      status: 'Inactive'
    }
  ];

  // Helper to get formatted date string (YYYY-MM-DD) offset by days
  function getOffsetDateString(daysOffset) {
    const d = new Date();
    d.setDate(d.getDate() + daysOffset);
    return d.toISOString().split('T')[0];
  }

  // Helper to generate default memberships relative to current date
  function getDefaultMemberships() {
    return [
      {
        id: 'MSHIP-5001',
        memberId: 'MEM-1001',
        memberName: 'Sarah Jenkins',
        planId: 'PLAN-102',
        planName: 'Pro Strength & Cardio',
        durationMonths: 3,
        startDate: getOffsetDateString(-30),
        expiryDate: getOffsetDateString(60),
        status: 'Active',
        paymentStatus: 'Paid'
      },
      {
        id: 'MSHIP-5002',
        memberId: 'MEM-1002',
        memberName: 'Marcus Vance',
        planId: 'PLAN-101',
        planName: 'Basic Fitness',
        durationMonths: 1,
        startDate: getOffsetDateString(-25),
        expiryDate: getOffsetDateString(5), // Expiring in 5 days!
        status: 'Active',
        paymentStatus: 'Paid'
      },
      {
        id: 'MSHIP-5003',
        memberId: 'MEM-1003',
        memberName: 'Priya Sharma',
        planId: 'PLAN-103',
        planName: 'Elite Annual Champion',
        durationMonths: 12,
        startDate: getOffsetDateString(-45),
        expiryDate: getOffsetDateString(320),
        status: 'Active',
        paymentStatus: 'Paid'
      },
      {
        id: 'MSHIP-5004',
        memberId: 'MEM-1004',
        memberName: 'David Chen',
        planId: 'PLAN-101',
        planName: 'Basic Fitness',
        durationMonths: 1,
        startDate: getOffsetDateString(-60),
        expiryDate: getOffsetDateString(-30), // Expired 30 days ago
        status: 'Expired',
        paymentStatus: 'Paid'
      },
      {
        id: 'MSHIP-5005',
        memberId: 'MEM-1005',
        memberName: 'Elena Rostova',
        planId: 'PLAN-102',
        planName: 'Pro Strength & Cardio',
        durationMonths: 3,
        startDate: getOffsetDateString(-10),
        expiryDate: getOffsetDateString(80),
        status: 'Active',
        paymentStatus: 'Pending'
      }
    ];
  }

  // Safe LocalStorage helpers
  function safeGet(key, fallback = []) {
    try {
      const item = localStorage.getItem(key);
      if (!item) return fallback;
      const parsed = JSON.parse(item);
      return Array.isArray(parsed) ? parsed : fallback;
    } catch (err) {
      console.warn(`[GMSStorage] Error parsing LocalStorage key "${key}":`, err);
      return fallback;
    }
  }

  function safeSet(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (err) {
      console.error(`[GMSStorage] Failed to save key "${key}" to LocalStorage:`, err);
      return false;
    }
  }

  // Initialize demo data once
  function initDemoData(force = false) {
    const isInitialized = localStorage.getItem(KEYS.INITIALIZED);
    if (!isInitialized || force) {
      safeSet(KEYS.MEMBERS, DEFAULT_MEMBERS);
      safeSet(KEYS.PLANS, DEFAULT_PLANS);
      safeSet(KEYS.MEMBERSHIPS, getDefaultMemberships());
      localStorage.setItem(KEYS.INITIALIZED, 'true');
      console.log('[GMSStorage] Demo data initialized.');
      return true;
    }
    return false;
  }

  function resetDemoData() {
    safeSet(KEYS.MEMBERS, DEFAULT_MEMBERS);
    safeSet(KEYS.PLANS, DEFAULT_PLANS);
    safeSet(KEYS.MEMBERSHIPS, getDefaultMemberships());
    localStorage.setItem(KEYS.INITIALIZED, 'true');
    console.log('[GMSStorage] Demo data has been reset to defaults.');
    return true;
  }

  // ID Generators
  function generateMemberId() {
    const members = safeGet(KEYS.MEMBERS);
    if (!members.length) return 'MEM-1001';
    const nums = members
      .map(m => {
        const parts = (m.id || '').split('-');
        return parts.length === 2 ? parseInt(parts[1], 10) : 0;
      })
      .filter(n => !isNaN(n));
    const nextNum = nums.length ? Math.max(...nums) + 1 : 1001;
    return `MEM-${nextNum}`;
  }

  function generatePlanId() {
    const plans = safeGet(KEYS.PLANS);
    if (!plans.length) return 'PLAN-101';
    const nums = plans
      .map(p => {
        const parts = (p.id || '').split('-');
        return parts.length === 2 ? parseInt(parts[1], 10) : 0;
      })
      .filter(n => !isNaN(n));
    const nextNum = nums.length ? Math.max(...nums) + 1 : 101;
    return `PLAN-${nextNum}`;
  }

  function generateMembershipId() {
    const list = safeGet(KEYS.MEMBERSHIPS);
    if (!list.length) return 'MSHIP-5001';
    const nums = list
      .map(m => {
        const parts = (m.id || '').split('-');
        return parts.length === 2 ? parseInt(parts[1], 10) : 0;
      })
      .filter(n => !isNaN(n));
    const nextNum = nums.length ? Math.max(...nums) + 1 : 5001;
    return `MSHIP-${nextNum}`;
  }

  // Date and status helpers
  function calculateExpiryDate(startDateStr, durationMonths) {
    const date = new Date(startDateStr);
    if (isNaN(date.getTime())) return '';
    const months = parseInt(durationMonths, 10) || 1;
    date.setMonth(date.getMonth() + months);
    return date.toISOString().split('T')[0];
  }

  function getDaysRemaining(expiryDateStr) {
    if (!expiryDateStr) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const exp = new Date(expiryDateStr);
    exp.setHours(0, 0, 0, 0);
    const diffTime = exp - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  function isExpiringSoon(expiryDateStr, daysThreshold = 7) {
    const days = getDaysRemaining(expiryDateStr);
    return days >= 0 && days <= daysThreshold;
  }

  // Metrics & KPI Calculator
  function getStats() {
    const members = safeGet(KEYS.MEMBERS);
    const plans = safeGet(KEYS.PLANS);
    const memberships = safeGet(KEYS.MEMBERSHIPS);

    const todayStr = new Date().toISOString().split('T')[0];

    const totalMembers = members.length;
    const activeMembers = members.filter(m => m.status === 'Active').length;
    const totalPlans = plans.length;

    let activeMemberships = 0;
    let expiredMemberships = 0;
    let expiringSoonMemberships = 0;

    memberships.forEach(m => {
      const isPast = m.expiryDate < todayStr;
      if (m.status === 'Expired' || isPast) {
        expiredMemberships++;
      } else if (m.status === 'Active') {
        activeMemberships++;
        if (isExpiringSoon(m.expiryDate)) {
          expiringSoonMemberships++;
        }
      }
    });

    return {
      totalMembers,
      activeMembers,
      totalPlans,
      activeMemberships,
      expiredMemberships,
      expiringSoonMemberships
    };
  }

  // Public API
  return {
    KEYS,
    initDemoData,
    resetDemoData,

    // Members API
    getMembers: () => safeGet(KEYS.MEMBERS),
    saveMembers: (data) => safeSet(KEYS.MEMBERS, data),
    generateMemberId,

    // Plans API
    getPlans: () => safeGet(KEYS.PLANS),
    savePlans: (data) => safeSet(KEYS.PLANS, data),
    generatePlanId,

    // Memberships API
    getMemberships: () => safeGet(KEYS.MEMBERSHIPS),
    saveMemberships: (data) => safeSet(KEYS.MEMBERSHIPS, data),
    generateMembershipId,

    // Utility & Calculations
    calculateExpiryDate,
    getDaysRemaining,
    isExpiringSoon,
    getStats
  };
})();

// Auto-run safe initialization check on load
if (typeof window !== 'undefined') {
  GMSStorage.initDemoData(false);
}
