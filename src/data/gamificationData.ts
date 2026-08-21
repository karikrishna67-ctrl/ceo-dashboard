export interface MilestoneTier {
  id: string;
  name: string;
  targetARR: number; // in base currency units (INR default)
  targetMRR: number;
  level: number;
  stageName: string;
  description: string;
  rewardPoints: number;
  financialImpactTrajectory: string;
  perks: string[];
}

export interface ProgressBadge {
  id: string;
  title: string;
  category: 'REVENUE' | 'EFFICIENCY' | 'RETENTION' | 'SCALE' | 'MASTERY';
  description: string;
  iconName: 'Trophy' | 'Crown' | 'Flame' | 'Rocket' | 'Shield' | 'Zap' | 'Gem' | 'Target' | 'Compass' | 'Award' | 'Star' | 'TrendingUp';
  tierLevel: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND';
  thresholdText: string;
  metricKey: 'arr' | 'mrr' | 'grossMargin' | 'nrr' | 'runway' | 'winRate' | 'ltvCac';
  targetValue: number;
  xpReward: number;
  financialImpact: string;
}

export const COMPANY_MILESTONES: MilestoneTier[] = [
  {
    id: 'milestone-1',
    name: 'Seed Stage Velocity',
    targetARR: 10000000, // ₹1.00 Cr / $120k
    targetMRR: 833333,
    level: 1,
    stageName: 'Product-Market Fit & Initial Traction',
    description: 'Establish consistent core recurring revenue, initial customer advocacy, and unit economics baseline.',
    rewardPoints: 250,
    financialImpactTrajectory: 'Unlocks ₹1.00 Cr predictable annual baseline, reducing monthly burn reliance and providing sustainable reinvestment into customer acquisition.',
    perks: ['Unlocked Automated Invoice Chaser', 'Daily CEO Morning Pulse Briefings', 'Access to Seed Stage Benchmarks'],
  },
  {
    id: 'milestone-2',
    name: 'Series A Scale Engine',
    targetARR: 25000000, // ₹2.50 Cr / $300k
    targetMRR: 2083333,
    level: 2,
    stageName: 'Sales CRM Engine & Pipeline Repeatability',
    description: 'Scale outbound SDRs, standardize product onboarding, and achieve sub-60 day deal velocity.',
    rewardPoints: 500,
    financialImpactTrajectory: 'Expands yearly revenue run rate by +150%, lifting enterprise valuation multiples to 6x-8x ARR and generating strong free operating cash flow.',
    perks: ['AI Sales Deal Autopilot', 'Automated Churn Insulation Triggers', 'Multi-Scenario Financial Simulator'],
  },
  {
    id: 'milestone-3',
    name: 'Growth Stage Hyper-Scale',
    targetARR: 50000000, // ₹5.00 Cr / $600k (Current baseline milestone)
    targetMRR: 4166667,
    level: 3,
    stageName: 'Cross-Sector Expansion & Expansion Revenue',
    description: 'Drive Net Revenue Retention (NRR) > 110% through multi-product add-ons and enterprise SLAs.',
    rewardPoints: 1000,
    financialImpactTrajectory: 'Doubles top-line annual ARR to ₹5.00 Cr, unlocking economies of scale that expand EBITDA margin by +4.5% and de-risks key account dependencies.',
    perks: ['Autonomous CFO Agent Audits', 'Full 23-Sector Taxonomy Gap Engine', 'Enterprise SOC2 Compliance Pack'],
  },
  {
    id: 'milestone-4',
    name: 'Series B Market Dominance',
    targetARR: 100000000, // ₹10.00 Cr / $1.2M
    targetMRR: 8333333,
    level: 4,
    stageName: 'Industry Leadership & High Operating Margins',
    description: 'Attain gross margins > 78%, rule of 40 efficiency, and dominant enterprise market share.',
    rewardPoints: 2000,
    financialImpactTrajectory: 'Surpasses ₹10.00 Cr annual milestone, elevating annual enterprise valuation above ₹80 Cr and providing capital for strategic tuck-in M&A.',
    perks: ['Strategic M&A Valuation Matrix', 'Multi-Entity Consolidated P&L', 'Institutional Board Deck Generator'],
  },
  {
    id: 'milestone-5',
    name: 'Centaur / IPO Readiness',
    targetARR: 250000000, // ₹25.00 Cr / $3.0M
    targetMRR: 20833333,
    level: 5,
    stageName: 'Sustained Profitability & Free Cash Flow Machine',
    description: 'Demonstrate predictable multi-regional cash flows, 24+ months runway, and world-class LTV:CAC.',
    rewardPoints: 5000,
    financialImpactTrajectory: 'Establishes a ₹25.00 Cr high-margin recurring machine with 24+ months runway, positioning the company for institutional public listing or sovereign PE buyout.',
    perks: ['Pre-IPO Audit Readiness Engine', 'Sovereign Multi-Currency Treasury', 'Executive Advisory Council Seat'],
  },
];

export const PROGRESS_BADGES: ProgressBadge[] = [
  // Revenue Category
  {
    id: 'badge-rev-1',
    title: 'First Crore ARR Club',
    category: 'REVENUE',
    description: 'Surpass ₹1.00 Cr in Annualized Recurring Revenue run rate.',
    iconName: 'Rocket',
    tierLevel: 'BRONZE',
    thresholdText: 'ARR ≥ ₹1.00 Cr',
    metricKey: 'arr',
    targetValue: 10000000,
    xpReward: 300,
    financialImpact: 'Adds ₹100L in annualized top line, guaranteeing seed-stage self-sufficiency.',
  },
  {
    id: 'badge-rev-2',
    title: 'Hyper-Growth Vanguard',
    category: 'REVENUE',
    description: 'Cross ₹3.50 Cr in Annualized Recurring Revenue with expanding sales pipeline.',
    iconName: 'Flame',
    tierLevel: 'SILVER',
    thresholdText: 'ARR ≥ ₹3.50 Cr',
    metricKey: 'arr',
    targetValue: 35000000,
    xpReward: 600,
    financialImpact: 'Accelerates YoY compounding growth to >45%, attracting Tier-1 venture funding.',
  },
  {
    id: 'badge-rev-3',
    title: 'Five Crore Titan',
    category: 'REVENUE',
    description: 'Reach ₹5.00 Cr ARR Milestone with resilient cohort retention.',
    iconName: 'Crown',
    tierLevel: 'GOLD',
    thresholdText: 'ARR ≥ ₹5.00 Cr',
    metricKey: 'arr',
    targetValue: 50000000,
    xpReward: 1200,
    financialImpact: 'Solidifies ₹500L ARR base, yielding over ₹110L in annual EBITDA operating profit.',
  },
  {
    id: 'badge-rev-4',
    title: 'Ten Crore Enterprise Sovereign',
    category: 'REVENUE',
    description: 'Achieve massive scale of ₹10.00 Cr ARR across multi-tiered corporate contracts.',
    iconName: 'Gem',
    tierLevel: 'DIAMOND',
    thresholdText: 'ARR ≥ ₹10.00 Cr',
    metricKey: 'arr',
    targetValue: 100000000,
    xpReward: 2500,
    financialImpact: 'Positions company at top 1% sector valuation benchmark with sustainable +30% margins.',
  },

  // Margin & Efficiency Category
  {
    id: 'badge-eff-1',
    title: 'Margin Maximizer',
    category: 'EFFICIENCY',
    description: 'Elevate Gross Profit Margins above the 70% sector benchmark.',
    iconName: 'TrendingUp',
    tierLevel: 'BRONZE',
    thresholdText: 'Gross Margin ≥ 70%',
    metricKey: 'grossMargin',
    targetValue: 70,
    xpReward: 400,
    financialImpact: 'Retains an extra ₹8-12 Lakhs per crore of revenue directly into operating cash flow.',
  },
  {
    id: 'badge-eff-2',
    title: 'SaaS Unit Economics Master',
    category: 'EFFICIENCY',
    description: 'Achieve an elite LTV : CAC multiplier of 3.5x or higher.',
    iconName: 'Trophy',
    tierLevel: 'SILVER',
    thresholdText: 'LTV : CAC ≥ 3.5x',
    metricKey: 'ltvCac',
    targetValue: 3.5,
    xpReward: 750,
    financialImpact: 'Reduces customer acquisition payback period to <8 months, tripling capital efficiency.',
  },
  {
    id: 'badge-eff-3',
    title: 'Cash Runway Fortress',
    category: 'EFFICIENCY',
    description: 'Build a fortress balance sheet with over 15 months of liquid operational runway.',
    iconName: 'Shield',
    tierLevel: 'GOLD',
    thresholdText: 'Runway ≥ 15 Months',
    metricKey: 'runway',
    targetValue: 15,
    xpReward: 900,
    financialImpact: 'Insulates company from macroeconomic shocks and eliminates dilutive bridge financing.',
  },

  // Retention & Scale Category
  {
    id: 'badge-ret-1',
    title: 'Net Retention Champion',
    category: 'RETENTION',
    description: 'Unlock compound negative net churn with Net Revenue Retention (NRR) > 105%.',
    iconName: 'Zap',
    tierLevel: 'GOLD',
    thresholdText: 'NRR ≥ 105%',
    metricKey: 'nrr',
    targetValue: 105,
    xpReward: 850,
    financialImpact: 'Drives +15% automatic yearly revenue growth purely from existing account expansions.',
  },
  {
    id: 'badge-ret-2',
    title: 'Pipeline Conversion Maestro',
    category: 'SCALE',
    description: 'Maintain sales team deal win rates above 30% across all qualified opportunities.',
    iconName: 'Target',
    tierLevel: 'SILVER',
    thresholdText: 'Win Rate ≥ 30%',
    metricKey: 'winRate',
    targetValue: 30,
    xpReward: 650,
    financialImpact: 'Converts ₹35L+ of pending pipeline into closed revenue without increasing ad spend.',
  },
  {
    id: 'badge-ret-3',
    title: 'MRR Half-Crore Club',
    category: 'MASTERY',
    description: 'Attain ₹40.00 Lakhs in monthly recurring subscription revenue.',
    iconName: 'Award',
    tierLevel: 'PLATINUM',
    thresholdText: 'MRR ≥ ₹40.00 L',
    metricKey: 'mrr',
    targetValue: 4000000,
    xpReward: 1500,
    financialImpact: 'Locks in ₹4.80 Cr annualized baseline with consistent monthly predictable collections.',
  },
];
