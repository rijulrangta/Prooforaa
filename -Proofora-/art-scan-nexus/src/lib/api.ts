const API_BASE_URL = "/api/designs";

export const uploadDesign = async (formData: FormData) => {
  const response = await fetch(`${API_BASE_URL}/save`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Upload failed");
  }

  return response.json();
};

export const getAllDesigns = async () => {
  const response = await fetch(`${API_BASE_URL}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch designs");
  }

  return response.json();
};

export const getDesignById = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/${id}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch design");
  }

  return response.json();
};
