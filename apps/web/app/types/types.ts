export enum ActionType {
  LocationHistory = 'location-history',
  TransactionHistory = 'transaction-history',
  Work = 'work',
  ViewFullProfile = 'view-full-profile',
}

export type DateRange = {
  from?: Date;
  to?: Date;
};
