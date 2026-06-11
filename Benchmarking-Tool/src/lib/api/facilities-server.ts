import { FacilityFormData, FacilityDetailFormData, BenchmarkFormData } from "@/lib/validators/facility";
import {
  CategoryResponse,
  FacilityResponse,
  SingleFacilityResponse,
  FacilityUserJoiningResponse,
  FacilityUserApproveDetachResponse,
  FacilityDetailSuccessResponse,
  FacilityDetailErrorResponse,
  BenchmarkSuccessResponse,
  BenchmarkErrorResponse,
  FederationResponse,
  FacilityDetailResponse,
  FacilityDetailUpdateResponse
} from "@/lib/types/facilities";
import { ApiMessageResponse } from "@/lib/types/response";
import { serverFetch } from ".";

export async function getAllCategories(): Promise<CategoryResponse> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/proxy/categories/`);
  return res.json();
}

export async function getUnapprovedUserFacilities(): Promise<FacilityResponse> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/proxy/unapproved-facilities/`);
  return res.json();
}

export async function getUnapprovedUserFederations(): Promise<FacilityResponse> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/proxy/unapproved-federations/`);
  return res.json();
}

export async function getAllFederations(): Promise<FederationResponse> {
  const res = await serverFetch("/federations/");
  return res.json();
}

export async function getAllFacilities(): Promise<FacilityResponse> {
  const res = await serverFetch("/facilities/");
  return res.json();
}

export async function createFacility(data: FacilityFormData): Promise<ApiMessageResponse> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/proxy/facilities/`, {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "content-type": "application/json"
    }
  });
  return res.json();
}

export async function retrieveFacility(id: string): Promise<SingleFacilityResponse> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/proxy/facilities/${id}/`);
  return res.json();
}

export async function createFacilityDetail(id: string, data: FacilityDetailFormData): Promise<FacilityDetailSuccessResponse | FacilityDetailErrorResponse> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/proxy/facilities/${id}/detail/`, {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "content-type": "application/json"
    }
  });
  return res.json();
}

export async function retrieveFacilityDetail(facilityId: string, detailId: string): Promise<SingleFacilityResponse> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/proxy/facilities/${facilityId}/detail/${detailId}/`);
  return res.json();
}

export async function updateFacility(id: string, data: FacilityFormData): Promise<ApiMessageResponse> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/proxy/facilities/${id}/`, {
    method: "PUT",
    body: JSON.stringify(data),
    headers: {
      "content-type": "application/json"
    }
  });
  return res.json();
}

export async function updateFacilityDetail(id: string, detailId: string, data: FacilityDetailFormData): Promise<ApiMessageResponse> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/proxy/facilities/${id}/detail/${detailId}/`, {
    method: "PUT",
    body: JSON.stringify(data),
    headers: {
      "content-type": "application/json"
    }
  });
  return res.json();
}

export async function destroyFacility(id: string): Promise<FacilityResponse> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/proxy/facilities/${id}/`, {
    method: "DELETE"
  });
  return res.json();
}

export async function benchmarkApi(data: BenchmarkFormData): Promise<BenchmarkSuccessResponse | BenchmarkErrorResponse> {
  const year = data.year;
  const categoryId = data.category;
  const facilityId = data.facility;
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/proxy/facilities/benchmark/?year=${year}&category=${categoryId}&facility=${facilityId}`);
  return res.json();
}

export async function joiningRequests(): Promise<FacilityUserJoiningResponse> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/proxy/facilities/user-joining-requests/`);
  return res.json();
}

export async function approveUser(facilityId: number): Promise<FacilityUserApproveDetachResponse> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/proxy/facilities/${facilityId}/approve-users/`, {
    method: "PUT"
  });
  return res.json();
}

export async function detachUser(facilityId: number): Promise<FacilityUserApproveDetachResponse> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/proxy/facilities/${facilityId}/detach-users/`, {
    method: "DELETE"
  });
  return res.json();
}

export async function getFacilityYearlyData(facilityId: number, yearlyDataId: number): Promise<FacilityDetailResponse> {
  const res = await serverFetch(`/facilities/${facilityId}/detail/${yearlyDataId}`);
  return res.json();
}
