export type LoanListFilters = {
  status: string;
  overdue: boolean;
  clientSearch: string;
  tierFilter: string;
  page: number;
};

const LIST_FILTER_KEYS = ["status", "overdue", "q", "tier", "page"] as const;

export function parseLoanListFilters(searchParams: URLSearchParams): LoanListFilters {
  return {
    status: searchParams.get("status") || "all",
    overdue: searchParams.get("overdue") === "true",
    clientSearch: searchParams.get("q") || "",
    tierFilter: searchParams.get("tier") || "all",
    page: Math.max(1, Number(searchParams.get("page") || "1")),
  };
}

export function buildLoanListSearchParams(filters: LoanListFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.page > 1) params.set("page", String(filters.page));
  if (filters.status !== "all") params.set("status", filters.status);
  if (filters.overdue) params.set("overdue", "true");
  if (filters.clientSearch) params.set("q", filters.clientSearch);
  if (filters.tierFilter !== "all") params.set("tier", filters.tierFilter);
  return params;
}

export function buildLoansListHref(filters: LoanListFilters): string {
  const qs = buildLoanListSearchParams(filters).toString();
  return qs ? `/loans?${qs}` : "/loans";
}

export function buildLoanListApiQuery(filters: LoanListFilters): string {
  const params = new URLSearchParams();
  params.set("page", String(filters.page));
  params.set("limit", "20");
  if (filters.status !== "all") params.set("status", filters.status);
  if (filters.overdue) params.set("overdue", "true");
  return params.toString();
}

export function extractLoanListQueryString(searchParams: URLSearchParams): string {
  const params = new URLSearchParams();
  for (const key of LIST_FILTER_KEYS) {
    const value = searchParams.get(key);
    if (value) params.set(key, value);
  }
  return params.toString();
}
