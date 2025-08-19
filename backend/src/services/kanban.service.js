import { getLeads } from "./lead.service.js";

// Returns grouped data by status. Reuses getLeads filters/pagination per column.
export async function getKanbanBoard(query) {
  // You can paginate each column independently via query like:
  // ?limit=10&newPage=1&interviewPage=1&testPage=1&completedPage=1
  const common = { ...query, status: "all" }; // start from all

  const buckets = ["new", "interview_scheduled", "test_assigned", "completed"];

  const results = {};
  // Fetch columns one by one so each can have independent pagination
  for (const col of buckets) {
    const q = {
      ...common,
      status: col,
      page: parseInt(query[`${col}Page`] || 1, 10),
      limit: parseInt(query[`${col}Limit`] || query.limit || 10, 10),
    };
    results[col] = await getLeads(q); // already returns {data, pagination}
  }
  return results;
}
