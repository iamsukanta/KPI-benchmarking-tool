type FacilityChartData = {
  name: string;
  data: number[];
};

type BenchmarkSection = {
  labels: {
    label: string;
    help_text: string;
    unit: string;
  }[];
  data: FacilityChartData[];
};

export type InternalBenchmark = {
  occupancy_utilization: BenchmarkSection;
  revenue_kpis: BenchmarkSection;
  cost_efficiency_kpis: BenchmarkSection;
  category_specific_kpis: BenchmarkSection;
};

type InternalBenchmarkSuccessResponse = {
  status: 'success';
  results: InternalBenchmark;
}

type InternalBenchmarkValidationErrorResponse = {
  status: 'error';
  type: 'validation';
  errors: Partial<Record<'year' | 'federation', string[]>>;
}

type NotFoundErrorResponse = {
  status: 'error';
  type: 'not_found';
  message: string;
}

export type InternalBenchmarkResponse =
  | InternalBenchmarkSuccessResponse
  | InternalBenchmarkValidationErrorResponse
  | NotFoundErrorResponse;

export type CategoryWideBenchmarkEligibleFacility = {
  id: number;
  name: string;
  category: number;
  category_name: string;
  years: number[]
};

type CategoryWideBenchmarkChartData = {
  labels: {
    label: string;
    help_text: string;
    unit: string;
  }[];
  my_data: number[];
  category_data: number[];
}

type CategoryWideBenchmarkSection = {
  occupancy_utilization: CategoryWideBenchmarkChartData;
  revenue_kpis: CategoryWideBenchmarkChartData;
  cost_efficiency_kpis: CategoryWideBenchmarkChartData;
  category_specific_kpis: CategoryWideBenchmarkChartData;
}

export type CategoryWideBenchmark = {
  median: CategoryWideBenchmarkSection;
  average: CategoryWideBenchmarkSection;
  min: CategoryWideBenchmarkSection;
  max: CategoryWideBenchmarkSection;
}

type CategoryWideBenchmarkValidationResponse = {
  status: 'error';
  type: 'validation_error';
  errors: Partial<Record<'facility' | 'year', string[]>>;
}

type CategoryWideBenchmarkSuccessResponse = {
  status: 'success';
  results: {
    facility: {
      id: number;
      name: string;
      category: number;
      category_name: string;
    };
    benchmark: CategoryWideBenchmark
  };
}

export type CategoryWideBenchmarkResponse =
  | CategoryWideBenchmarkSuccessResponse
  | CategoryWideBenchmarkValidationResponse
  | NotFoundErrorResponse
