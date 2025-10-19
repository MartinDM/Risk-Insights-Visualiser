import { faker, fakerEN_GB } from '@faker-js/faker';
import { MapboxReverseGeocodeResponse } from '../types/location';
import {
  CreditCardTransaction,
  LocationHistory,
  LocationInsights,
  Person,
  TransactionInsights,
} from '../types/person';

const merchantCategories = [
  'grocery',
  'gas',
  'restaurant',
  'retail',
  'travel',
  'entertainment',
  'healthcare',
  'utilities',
  'other',
] as const;
const currencies = ['USD', 'EUR', 'GBP', 'CAD', 'JPY'] as const;
const transactionTypes = ['purchase', 'refund', 'withdrawal', 'fee'] as const;
const transactionStatuses = ['completed', 'pending', 'declined', 'disputed'] as const;
const confidenceLevels = ['high', 'medium', 'low'] as const;
const sources = ['gps', 'check-in', 'transaction', 'survey', 'inferred'] as const;
const locationTypes = ['residence', 'work', 'travel', 'visit', 'other'] as const;
const residenceTypes = ['primary', 'secondary', 'temporary'] as const;

export const getAddressFromPos = async ({
  lng,
  lat,
}: {
  lng: number;
  lat: number;
}): Promise<MapboxReverseGeocodeResponse> => {
  if (!lng || !lat) {
    throw new Error('Invalid coordinates');
  }
  const geoCodeData = await getGeoData({ lng, lat });
  return geoCodeData;
};

function formatDateToString(date: Date): string {
  const datePart = date.toISOString().split('T')[0];
  if (!datePart) {
    throw new Error('Failed to format date');
  }
  return datePart;
}

function generateCreditCardTransaction(): CreditCardTransaction {
  const isOnline = faker.datatype.boolean();
  const merchantCategory = faker.helpers.arrayElement(merchantCategories);

  return {
    id: faker.string.uuid(),
    timestamp: faker.date.recent({ days: 180 }), // Last 6 months
    amount: parseFloat(faker.commerce.price({ min: 5, max: 500, dec: 2 })),
    currency: faker.helpers.arrayElement(currencies),
    merchantName: faker.company.name(),
    merchantCategory,
    ...(isOnline
      ? {}
      : {
        location: {
          city: faker.location.city(),
          state: faker.location.state(),
          country: faker.location.country(),
          coords: {
            lat: faker.location.latitude(),
            lng: faker.location.longitude(),
          },
          address: faker.location.streetAddress(),
        },
      }),
    cardLastFour: faker.finance.creditCardNumber().slice(-4),
    transactionType: faker.helpers.arrayElement(transactionTypes),
    isOnline,
    status: faker.helpers.arrayElement(transactionStatuses),
    description: faker.lorem.sentence(),
  };
}

function generateLocationHistoryEntry(): LocationHistory {
  const { address, coords } = getAddressDetails();
  const [lat, lng] = coords;

  return {
    id: faker.string.uuid(),
    timestamp: faker.date.past({ years: 2 }),
    location: {
      city: fakerEN_GB.location.city(),
      state: fakerEN_GB.location.state(),
      country: fakerEN_GB.location.country(),
      coords: {
        lat,
        lng,
      },
      address,
      postalCode: fakerEN_GB.location.zipCode(),
    },
    locationType: faker.helpers.arrayElement(locationTypes),
    duration: faker.number.int({ min: 1, max: 365 }),
    confidence: faker.helpers.arrayElement(confidenceLevels),
    source: faker.helpers.arrayElement(sources),
    notes: faker.lorem.sentence(),
  };
}

function generateTransactionInsights(
  transactions: CreditCardTransaction[],
): TransactionInsights {
  const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);
  const transactionCount = transactions.length;

  // Generate category breakdown
  const categoryBreakdown: Record<
    string,
    { amount: number; percentage: number; transactionCount: number }
  > = {};
  merchantCategories.forEach((category) => {
    const categoryTransactions = transactions.filter(
      (t) => t.merchantCategory === category,
    );
    const categoryAmount = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
    categoryBreakdown[category] = {
      amount: categoryAmount,
      percentage: totalSpent > 0 ? (categoryAmount / totalSpent) * 100 : 0,
      transactionCount: categoryTransactions.length,
    };
  });

  // Generate monthly trends (last 6 months)
  const monthlyTrends = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthTransactions = transactions.filter(
      (t) =>
        t.timestamp.getMonth() === date.getMonth() &&
        t.timestamp.getFullYear() === date.getFullYear(),
    );
    return {
      month: date.toISOString().slice(0, 7), // YYYY-MM format
      totalSpent: monthTransactions.reduce((sum, t) => sum + t.amount, 0),
      transactionCount: monthTransactions.length,
    };
  });

  // Generate location spending
  const locationMap = new Map<
    string,
    {
      city: string;
      country: string;
      totalSpent: number;
      transactionCount: number;
      lastTransaction: Date;
      coords?: { lat: number; lng: number };
    }
  >();
  transactions.forEach((t) => {
    if (t.location) {
      const key = `${t.location.city}, ${t.location.country}`;
      const existing = locationMap.get(key);
      if (existing) {
        existing.totalSpent += t.amount;
        existing.transactionCount++;
        if (t.timestamp > existing.lastTransaction) {
          existing.lastTransaction = t.timestamp;
        }
      } else {
        locationMap.set(key, {
          city: t.location.city,
          country: t.location.country,
          totalSpent: t.amount,
          transactionCount: 1,
          lastTransaction: t.timestamp,
          ...(t.location.coords ? { coords: t.location.coords } : {}),
        });
      }
    }
  });

  const foreignTransactions = transactions.filter(
    (t) => t.location?.country !== 'United States',
  ).length;
  const travelTransactions = transactions.filter((t) => t.merchantCategory === 'travel');
  const largeTransactions = transactions.filter((t) => t.amount > 200);

  return {
    recentTransactions: transactions,
    spendingPatterns: {
      totalSpent,
      averageTransaction: transactionCount > 0 ? totalSpent / transactionCount : 0,
      transactionCount,
      categoryBreakdown,
      monthlyTrends,
    },
    locationSpending: Array.from(locationMap.values()),
    travelIndicators: {
      foreignTransactions,
      uniqueLocations: locationMap.size,
      travelSpending: travelTransactions.reduce((sum, t) => sum + t.amount, 0),
      internationalSpending: transactions
        .filter((t) => t.location?.country !== 'United States')
        .reduce((sum, t) => sum + t.amount, 0),
    },
    riskIndicators: {
      unusualLocations: Array.from(locationMap.values())
        .slice(0, 3)
        .map((loc) => ({
          location: `${loc.city}, ${loc.country}`,
          date: loc.lastTransaction,
          amount: loc.totalSpent,
          riskScore: faker.number.int({ min: 0, max: 100 }),
        })),
      largeTransactions,
      frequentMerchants: Array.from({ length: 3 }, () => ({
        merchantName: faker.company.name(),
        transactionCount: faker.number.int({ min: 5, max: 20 }),
        totalSpent: faker.number.int({ min: 100, max: 1000 }),
      })),
    },
  };
}

export const formatCurrency = (amount: number, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

export const getGeoData = async ({
  lng,
  lat,
}: {
  lng: number;
  lat: number;
}): Promise<MapboxReverseGeocodeResponse> => {
  const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  if (!token) {
    throw new Error('NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN is not defined');
  }

  const url = `https://api.mapbox.com/search/geocode/v6/reverse?longitude=${lng}&latitude=${lat}&access_token=${token}`;

  const response = await fetch(url);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Mapbox API error:', response.status, errorText);
    throw new Error(`Failed to fetch geocode data: ${response.status} - ${errorText}`);
  }

  return await response.json();
};

export const getAddressDetails = (): { address: string; coords: [number, number] } => {
  const address = fakerEN_GB.location.streetAddress(true);

  // Generate coordinates that correspond to realistic UK locations
  const coords = faker.location.nearbyGPSCoordinate({
    origin: [51.5074, -0.1278], // London
    radius: 200,
    isMetric: true,
  });

  return { address, coords };
};

export const getLngLatFromRadius = (): [number, number] => {
  return faker.location.nearbyGPSCoordinate({
    origin: [51.5074, -0.1278], // London
    radius: 200,
    isMetric: true,
  });
};

export function generateLocationInsights(city: string): LocationInsights {
  const { address, coords } = getAddressDetails();
  const [lat, lng] = coords;
  const locationHistory = Array.from(
    { length: faker.number.int({ min: 5, max: 15 }) },
    () => generateLocationHistoryEntry(),
  );

  const frequentDestinations = Array.from(
    { length: faker.number.int({ min: 3, max: 8 }) },
    () => ({
      city: faker.location.city(),
      country: faker.location.country(),
      visitCount: faker.number.int({ min: 1, max: 10 }),
      lastVisit: faker.date.recent({ days: 365 }),
    }),
  );

  const residenceHistory = Array.from(
    { length: faker.number.int({ min: 2, max: 5 }) },
    (_, i) => {
      const startDate = faker.date.past({ years: 10 });
      const endDate =
        i === 0 ? undefined : faker.date.between({ from: startDate, to: new Date() });
      const { coords } = getAddressDetails();
      const [lat, lng] = coords;

      return {
        id: faker.string.uuid(),
        timestamp: faker.date.past({ years: 2 }),
        location: {
          city: fakerEN_GB.location.city(),
          state: fakerEN_GB.location.state(),
          country: fakerEN_GB.location.country(),
          coords: {
            lat,
            lng,
          },
        },
        startDate,
        ...(endDate ? { endDate } : {}),
        residenceType: faker.helpers.arrayElement(residenceTypes),
      };
    },
  );

  const workLocations = Array.from(
    { length: faker.number.int({ min: 1, max: 4 }) },
    (_, i) => {
      const startDate = faker.date.past({ years: 5 });
      const endDate =
        i === 0 ? undefined : faker.date.between({ from: startDate, to: new Date() });
      const { address, coords } = getAddressDetails();
      const [lat, lng] = coords;

      return {
        location: {
          city: fakerEN_GB.location.city(),
          state: fakerEN_GB.location.state(),
          country: fakerEN_GB.location.country(),
          address,
          coords: {
            lat,
            lng,
          },
        },
        company: faker.company.name(),
        startDate,
        ...(endDate ? { endDate } : {}),
        isRemote: faker.datatype.boolean(),
      };
    },
  );

  return {
    currentLocation: {
      city,
      state: fakerEN_GB.location.state(),
      country: fakerEN_GB.location.country(),
      address,
      coords: { lat, lng },
      since: faker.date.past({ years: 2 }),
    },
    locationHistory,
    travelPatterns: {
      frequentDestinations,
      mobilityScore: faker.number.int({ min: 0, max: 100 }),
      averageStayDuration: faker.number.int({ min: 30, max: 365 }),
      timeZoneChanges: faker.number.int({ min: 0, max: 20 }),
    },
    residenceHistory,
    workLocations,
  };
}

export function createPeople(count: number): Person[] {
  return Array.from({ length: count }, (_, index) => {
    // Generate transactions first to calculate insights
    const transactions = Array.from(
      { length: faker.number.int({ min: 20, max: 100 }) },
      () => generateCreditCardTransaction(),
    );

    // Generate location first to use in insights and location
    const city = faker.location.city();
    const [lat, lng] = getLngLatFromRadius();
    const coords = { lat, lng };

    return {
      id: `U${(1000 + index).toString().padStart(4, '0')}`,
      name: faker.person.fullName(),
      risk: faker.number.int({ min: 0, max: 100 }),
      accountNumber: faker.finance.accountNumber(),
      salary: faker.number.int({ min: 30000, max: 120000 }),
      bio: faker.person.bio(),
      dob: formatDateToString(faker.date.past({ years: 30 })),
      location: {
        city,
        coords,
      },
      locationInsights: generateLocationInsights(city),
      transactionInsights: generateTransactionInsights(transactions),
    };
  });
}

export function fetchPersonById(people: Person[], id: string): Person | undefined {
  return people.find((p) => p.id === id);
}
