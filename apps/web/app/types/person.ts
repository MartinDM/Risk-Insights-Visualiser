export type CreditCardTransaction = {
  id: string;
  timestamp: Date;
  amount: number;
  currency: 'USD' | 'EUR' | 'GBP' | 'CAD' | 'JPY' | string;
  merchantName: string;
  merchantCategory:
    | 'grocery'
    | 'gas'
    | 'restaurant'
    | 'retail'
    | 'travel'
    | 'entertainment'
    | 'healthcare'
    | 'utilities'
    | 'other';
  location?: {
    city: string;
    state?: string;
    country: string;
    coords?: {
      lat: number;
      lng: number;
    };
    address?: string;
  };
  cardLastFour: string; // Last 4 digits for identification
  transactionType: 'purchase' | 'refund' | 'withdrawal' | 'fee';
  isOnline: boolean;
  status: 'completed' | 'pending' | 'declined' | 'disputed';
  description?: string;
};

export type TransactionInsights = {
  recentTransactions: CreditCardTransaction[]; // Last 6 months
  spendingPatterns: {
    totalSpent: number;
    averageTransaction: number;
    transactionCount: number;
    categoryBreakdown: Record<
      string,
      {
        amount: number;
        percentage: number;
        transactionCount: number;
      }
    >;
    monthlyTrends: Array<{
      month: string; // YYYY-MM format
      totalSpent: number;
      transactionCount: number;
    }>;
  };
  locationSpending: Array<{
    city: string;
    country: string;
    totalSpent: number;
    transactionCount: number;
    lastTransaction: Date;
    coords?: {
      lat: number;
      lng: number;
    };
  }>;
  travelIndicators: {
    foreignTransactions: number;
    uniqueLocations: number;
    travelSpending: number; // Amount spent on travel category
    internationalSpending: number;
  };
  riskIndicators: {
    unusualLocations: Array<{
      location: string;
      date: Date;
      amount: number;
      riskScore: number; // 0-100
    }>;
    largeTransactions: CreditCardTransaction[]; // Transactions over threshold
    frequentMerchants: Array<{
      merchantName: string;
      transactionCount: number;
      totalSpent: number;
    }>;
  };
};

export type ResidenceHistory = {
  id: string;
  timestamp: Date;
  location: {
    city: string;
    state?: string;
    country: string;
    coords: {
      lat: number;
      lng: number;
    };
  };
  startDate: Date;
  endDate?: Date;
  residenceType: 'primary' | 'secondary' | 'temporary';
};

export type LocationHistory = {
  id: string;
  timestamp: Date;
  location: {
    city: string;
    state?: string;
    country: string;
    coords: {
      lat: number;
      lng: number;
    };
    address?: string;
    postalCode?: string;
  };
  locationType: 'residence' | 'work' | 'travel' | 'visit' | 'other';
  duration?: number; // Duration in days if applicable
  confidence: 'high' | 'medium' | 'low'; // Data confidence level
  source: 'gps' | 'check-in' | 'transaction' | 'survey' | 'inferred';
  notes?: string;
};

export type LocationInsights = {
  currentLocation: {
    city: string;
    state?: string;
    country: string;
    address?: string;
    coords: {
      lat: number;
      lng: number;
    };
    since: Date; // When they moved to current location
  };
  locationHistory: LocationHistory[];
  travelPatterns: {
    frequentDestinations: Array<{
      city: string;
      country: string;
      visitCount: number;
      lastVisit: Date;
    }>;
    mobilityScore: number; // 0-100 scale of how mobile they are
    averageStayDuration: number; // Average days per location
    timeZoneChanges: number; // Number of timezone changes in last year
  };
  residenceHistory: ResidenceHistory[];
  workLocations: Array<{
    location: {
      city: string;
      state?: string;
      country: string;
      coords: {
        lat: number;
        lng: number;
      };
    };
    company?: string;
    startDate: Date;
    endDate?: Date;
    isRemote: boolean;
  }>;
};

export type Person = {
  id: string;
  name: string;
  risk: number;
  // Tag can be a string or explicitly null to represent "cleared"
  tag?: string | null;
  accountNumber: string;
  salary: number;
  bio: string;
  dob: string;
  location: {
    city: string;
    coords: {
      lat: number;
      lng: number;
    };
  };
  // Enhanced location data for insights
  locationInsights?: LocationInsights;
  // Credit card transaction data for financial and location insights
  transactionInsights?: TransactionInsights;
};

export type PersonMapLocation = Omit<Person, 'transactionInsights'>;
