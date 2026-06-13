import { Facility } from '@/lib/types/facilities';

export type AuthUser = {
  id: number;
  name: string | null;
  email: string;
  role: string;
  change_password_at_first_login?: boolean;
};

export type AuthResponse = {
  access: string;
  refresh: string;
  id: number;
  name: string | null;
  email: string;
  role: string;
  change_password_at_first_login?: boolean;
};

export type SignupResponse = {
  status: string;
  message?: string;
  errors?: Record<string, string[]>;
}

export type Profile = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  change_password_at_first_login: boolean;
  password_changed_at: string;
}

export type ProfileResponse = {
  status: 'success';
  results: Profile;
}

export type ProfileSuccessResponse = {
  status: 'success';
  message: Profile;
}

export type ProfileErrorResponse = {
  status: 'error';
  errors: {
    old_password?: string[];
    new_password?: string[];
  };
}

export type ActivityDashboardData = {
  activity: string;
  created_at: string;
}

export type FacilityDashboardData = {
  total_facilities_and_federations: number;
  total_facilities: number;
  total_federations: number;
}

export type DashboardResponse = {
  status: 'success';
  results: {
    user_activities: ActivityDashboardData[];
    facilities?: FacilityDashboardData;
    user_join_requests?: Facility[];
    user_approvals?: ActivityDashboardData[];
    facility_stats?: {
      id: number;
      name: string;
      category: string;
      beds: number;
      rooms: number;
      opening_days_per_year: number;
      current_year: {
        year: number;
        total_revenue: number;
        total_costs: number;
        overnight_stays: number
      };
      previous_year: {
        year: number;
        total_revenue: number;
        total_costs: number;
        overnight_stays: number
      };
    }[];
    federation_stats?: {
      id: number;
      name: string;
      opening_days_per_year: number;
      facilities: {
        id: number;
        name: string;
        category: string;
        beds: number;
        rooms: number;
        opening_days_per_year: number;
        current_year: {
          year: number;
          total_revenue: number;
          total_costs: number;
          overnight_stays: number
        };
        previous_year: {
          year: number;
          total_revenue: number;
          total_costs: number;
          overnight_stays: number
        };
      }[]
    }[];
    benchmark_attempts?: ActivityDashboardData[];
  };
}

export type DashboardResult = DashboardResponse['results'];
