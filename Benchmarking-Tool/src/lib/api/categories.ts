import { CategoryFormData } from "@/lib/validators/category";
import { CategoryDestroyResponse, CategoryResponse, SingleCategoryResponse } from "@/lib/types/facilities";

export async function getAllCategories(): Promise<CategoryResponse> {
  const res = await fetch("api/proxy/categories/");
  return res.json();
}

export async function createCategory(data: CategoryFormData): Promise<Response> {
  const res = await fetch("/api/proxy/categories/", {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "content-type": "application/json"
    }
  });
  return res.json();
}

export async function retrieveCategory(id: string): Promise<SingleCategoryResponse> {
  const res = await fetch(`/api/proxy/categories/${id}/`);
  return res.json();
}

export async function updateCategory(id: string, data: CategoryFormData): Promise<Response> {
  const res = await fetch(`/api/proxy/categories/${id}/`, {
    method: "PUT",
    body: JSON.stringify(data),
    headers: {
      "content-type": "application/json"
    }
  });
  return res.json();
}

export async function destroyCategory(id: string): Promise<CategoryDestroyResponse> {
  const res = await fetch(`/api/proxy/categories/${id}/`, {
    method: "DELETE"
  });
  return res.json();
}
