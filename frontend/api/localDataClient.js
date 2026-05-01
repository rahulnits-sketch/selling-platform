const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:4000").replace(/\/$/, "");
const AUTH_STORAGE_KEY = "seller-auth";

function getStoredAuth() {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function buildQuery(params) {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  });

  const query = search.toString();
  return query ? `?${query}` : "";
}

async function request(path, options = {}) {
  const auth = getStoredAuth();
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (auth?.token) {
    headers.Authorization = `Bearer ${auth.token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    throw new Error(payload?.message || "Request failed");
  }

  return payload;
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Unable to read file"));
    reader.readAsDataURL(file);
  });
}

export const appClient = {
  entities: {
    Car: {
      list: async (sort, limit) => request(`/api/cars${buildQuery({ sort, limit })}`),
      get: async (id) => request(`/api/cars/${id}`),
      create: async (payload) =>
        request("/api/cars", {
          method: "POST",
          body: JSON.stringify(payload),
        }),
      update: async (id, payload) =>
        request(`/api/cars/${id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        }),
      delete: async (id) =>
        request(`/api/cars/${id}`, {
          method: "DELETE",
        }),
    },
  },
  integrations: {
    Core: {
      UploadFile: async ({ file }) => {
        const data = await fileToBase64(file);
        return request("/api/uploads", {
          method: "POST",
          body: JSON.stringify({
            filename: file.name,
            contentType: file.type,
            data,
          }),
        });
      },
    },
  },
  admin: {
    getContact: async () => request("/api/admin/contact"),
    setContact: async (contact) =>
      request("/api/admin/contact", {
        method: "PUT",
        body: JSON.stringify(contact),
      }),
    clearContact: async () =>
      request("/api/admin/contact", {
        method: "DELETE",
      }),
  },
  auth: {
    login: async (credentials) =>
      request("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      }),
    me: async () => request("/api/auth/me"),
    logout: () => {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    },
  },
};

export { API_BASE_URL, AUTH_STORAGE_KEY };
