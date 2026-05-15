// GoHighLevel v2 API client. Server-only. Uses Private Integration Token.

const GHL_BASE_URL = "https://services.leadconnectorhq.com";

export interface GhlError {
  status: number;
  message: string;
  details?: unknown;
}

export function isGhlConfigured(): boolean {
  return !!process.env.GHL_PIT_TOKEN && !!process.env.GHL_LOCATION_ID;
}

interface GhlFetchOptions extends RequestInit {
  searchParams?: Record<string, string | number | undefined>;
}

export async function ghlFetch<T>(path: string, options: GhlFetchOptions = {}): Promise<T> {
  const token = process.env.GHL_PIT_TOKEN;
  const locationId = process.env.GHL_LOCATION_ID;
  const version = process.env.GHL_API_VERSION || "2021-07-28";

  if (!token || !locationId) {
    throw {
      status: 500,
      message: "GHL not configured. Set GHL_PIT_TOKEN and GHL_LOCATION_ID.",
    } as GhlError;
  }

  const url = new URL(path, GHL_BASE_URL);
  if (options.searchParams) {
    for (const [k, v] of Object.entries(options.searchParams)) {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    }
  }

  const headers: HeadersInit = {
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
    Version: version,
    "Location-Id": locationId,
    ...(options.headers || {}),
  };

  const res = await fetch(url.toString(), { ...options, headers });
  const text = await res.text();
  let json: unknown = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = text;
  }

  if (!res.ok) {
    throw {
      status: res.status,
      message:
        (json && typeof json === "object" && "message" in json
          ? String((json as { message: unknown }).message)
          : res.statusText) || "GHL request failed",
      details: json,
    } as GhlError;
  }

  return json as T;
}

// ---- Contacts ----
export interface GhlContact {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  tags?: string[];
  locationId?: string;
  customFields?: Array<{ id: string; value: unknown }>;
}

export async function searchContacts(filters: {
  tags?: string[];
  limit?: number;
  pageLimit?: number;
}) {
  const body = {
    locationId: process.env.GHL_LOCATION_ID,
    pageLimit: filters.pageLimit ?? 100,
    filters: filters.tags && filters.tags.length > 0
      ? [
          {
            field: "tags",
            operator: "contains",
            value: filters.tags[0],
          },
        ]
      : [],
  };

  return ghlFetch<{ contacts: GhlContact[]; total?: number }>(
    "/contacts/search",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );
}

export async function getContact(contactId: string) {
  return ghlFetch<{ contact: GhlContact }>(`/contacts/${contactId}`);
}

export async function updateContactCustomFields(
  contactId: string,
  customFields: Array<{ id: string; field_value: string | number | null }>
) {
  return ghlFetch(`/contacts/${contactId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ customFields }),
  });
}

export async function addContactTags(contactId: string, tags: string[]) {
  return ghlFetch(`/contacts/${contactId}/tags`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tags }),
  });
}

export async function removeContactTags(contactId: string, tags: string[]) {
  return ghlFetch(`/contacts/${contactId}/tags`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tags }),
  });
}

// ---- Custom Fields ----
export interface GhlCustomField {
  id: string;
  name: string;
  fieldKey: string;
  dataType?: string;
  model?: string;
}

export async function listCustomFields() {
  const locationId = process.env.GHL_LOCATION_ID!;
  return ghlFetch<{ customFields: GhlCustomField[] }>(
    `/locations/${locationId}/customFields?model=contact`,
    { method: "GET" }
  );
}
