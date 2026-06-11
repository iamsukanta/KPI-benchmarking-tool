import { GenericErrorWithMessageResponse, GenericSuccessResponse, GenericSuccessWithMessageResponse, GenericValidationErrorResponse } from ".";

export type Category = {
  id: number;
  name: string;
  is_active: boolean;
};

export type CategoryResponse = {
  status: string;
  results: Category[];
}

export type CategoryDestroyResponse = {
  status: string;
  message: string;
}

export type SingleCategoryResponse = {
  status: string;
  results: Category;
}

export type FacilityDetail = {
  id: string;
  facility_id?: string;
  facility_name?: string;
  federation_id?: string;
  federation_name?: string;
  beds?: string;
  rooms?: string;
  year: string;
  guests: string;
  rooms_sold: string;
  overnight_stays: string;
  total_costs: string;
  total_revenue: string;
  income_from_donations: string;
  income_from_conferences: string;
  income_from_catering: string;
  income_from_accomodation: string;
  personnel_costs: string;
  catering_costs: string;
  energy_costs: string;
  cleaning_costs: string;
  maintenance_costs: string;
  is_published: boolean;
  last_published_at: string;
}

export type Federation = {
  id: number;
  name: string;
  category: string;
  category_name: string;
  facility_count: number;
  user: number | null;
  user_name: string | null;
}

export type Facility = {
  id: number;
  name: string;
  category?: string;
  category_name?: string;
  is_federation?: boolean;
  federation?: string;
  federation_name?: string;
  beds?: string;
  rooms?: string;
  user?: string;
  user_name?: string;
  user_facility_role?: string;
  is_user_approved?: boolean;
  is_active?: boolean;
  details?: FacilityDetail[];
  federal_state: boolean;
  opening_days_per_year: string;
  operational_building_area: string;
  total_property_area: string;
};

export type FederationResponse = {
  status: string;
  results: Federation[];
}

export type FacilityResponse = {
  status: string;
  message?: string;
  results?: Facility[];
}

export type SingleFacilityResponse = {
  status: string;
  results?: Facility;
  message?: string;
}

export type FacilityDetailSuccessResponse = {
  status: 'success';
  message: string;
}

export type FacilityDetailErrorResponse = {
  status: 'error';
  errors: {
    year?: string[];
    overnight_stays?: string[];
    total_costs?: string[];
    total_revenue?: string[];
    non_field_errors?: string[];
  };
}

export type Benchmark = {
  labels: {
    accomodation: string[];
    revenue: string[];
  };
  facility: {
    accomodation: number[];
    revenue: number[];
  };
  median: {
    accomodation: number[];
    revenue: number[];
  };
}

export type BenchmarkSuccessResponse = {
  status: 'success';
  results: Benchmark;
}

export type BenchmarkErrorResponse = {
  status: 'error';
  message: string;
}

export type BenchmarkResponse = {
  status: string;
  message?: string;
  results?: Benchmark;
}

export type FacilityUserJoiningResponse = {
  status: string;
  results: Facility[];
}

export type FacilityUserApproveDetachResponse = {
  status: string;
  message: string;
}

export interface FacilityDetailResponse extends GenericSuccessResponse {
  results: FacilityDetail;
}

export type FacilityDetailUpdateResponse =
  | GenericSuccessWithMessageResponse
  | GenericErrorWithMessageResponse
  | GenericValidationErrorResponse;
