
const initialAppointments = [
  { id: 1, client: "Olivia Martin", email: "olivia@example.com", service: "General consultation", date: "2026-10-27T09:30", status: "Upcoming" },
  { id: 2, client: "Liam Anderson", email: "liam@example.com", service: "Follow-up session", date: "2026-10-27T10:30", status: "Completed" },
  { id: 3, client: "Sophia Williams", email: "sophia@example.com", service: "Dental checkup", date: "2026-10-27T11:00", status: "Upcoming" },
  { id: 4, client: "Noah Thompson", email: "noah@example.com", service: "Health consultation", date: "2026-10-28T14:00", status: "Cancelled" },
  { id: 5, client: "Emma Johnson", email: "emma@example.com", service: "Initial consultation", date: "2026-10-29T15:30", status: "Upcoming" },
  { id: 6, client: "James Wilson", email: "james@example.com", service: "Follow-up session", date: "2026-10-30T12:00", status: "Completed" }
];

let appointments = initialAppointments.map(item => ({ ...item }));
const $ = id => document.getElementById(id);
const rows = $("appointmentRows");
const dialog = $("appointmentDialog");

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Invalid date";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) +
    " · " + date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function renderStats() {
  $("total").textContent = appointments.length;
  $("upcoming").textContent = appointments.filter(a => a.status === "Upcoming").length;
  $("completed").textContent = appointments.filter(a => a.status === "Completed").length;
  $("cancelled").textContent = appointments.filter(a => a.status === "Cancelled").length;
  $("insightCount").textContent =
    `${appointments.filter(a => a.status === "Upcoming").length} appointments`;
}

function renderAppointments() {
  const query = $("search").value.toLowerCase().trim();
  const status = $("statusFilter").value;

  const filtered = appointments.filter(a =>
    (a.client.toLowerCase().includes(query) ||
     a.service.toLowerCase().includes(query) ||
     a.email.toLowerCase().includes(query)) &&
    (status === "All" || a.status === status)
  );

  rows.replaceChildren();

  filtered.forEach(a => {
    const tr = document.createElement("tr");

    const clientCell = document.createElement("td");
    const client = document.createElement("div");
    client.className = "client";

    const avatar = document.createElement("div");
    avatar.className = "client-avatar";
    avatar.textContent = a.client.split(/\s+/).map(s => s[0]).join("").slice(0, 2).toUpperCase();

    const info = document.createElement("div");
    const name = document.createElement("div");
    name.className = "client-name";
    name.textContent = a.client;

    const email = document.createElement("div");
    email.className = "client-email";
    email.textContent = a.email;

    info.append(name, email);
    client.append(avatar, info);
    clientCell.append(client);

    const service = document.createElement("td");
    service.textContent = a.service;

    const date = document.createElement("td");
    date.textContent = formatDate(a.date);

    const statusCell = document.createElement("td");
    const badge = document.createElement("span");
    badge.className = "status " + a.status.toLowerCase();
    badge.textContent = a.status;
    statusCell.append(badge);

    const actionCell = document.createElement("td");
    const action = document.createElement("button");
    action.className = "action-btn";
    action.textContent = "⋯";
    action.title = a.status === "Upcoming" ? "Mark completed" : "Change status";
    action.setAttribute("aria-label", `Change status for ${a.client}`);
    action.addEventListener("click", () => {
      if (a.status === "Upcoming") {
        a.status = "Completed";
      } else if (a.status === "Completed") {
        a.status = "Cancelled";
      } else {
        a.status = "Upcoming";
      }
      renderAll();
    });
    actionCell.append(action);

    tr.append(clientCell, service, date, statusCell, actionCell);
    rows.append(tr);
  });

  $("resultCount").textContent = `Showing ${filtered.length} of ${appointments.length} appointments`;
}

function renderChart() {
  const isMonth = $("period").value === "month";
  const labels = isMonth
    ? ["Week 1", "Week 2", "Week 3", "Week 4"]
    : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const first = isMonth ? [20, 28, 24, 35] : [15, 24, 18, 33, 27, 14, 21];
  const second = isMonth ? [13, 18, 20, 24] : [10, 16, 12, 21, 19, 8, 15];

  const bars = $("bars");
  bars.replaceChildren();

  labels.forEach((label, i) => {
    const column = document.createElement("div");
    column.className = "bar-column";

    const pair = document.createElement("div");
    pair.className = "bar-pair";

    const one = document.createElement("div");
    one.className = "bar primary";
    one.style.height = `${first[i] / 40 * 100}%`;
    one.title = `${first[i]} bookings`;

    const two = document.createElement("div");
    two.className = "bar secondary";
    two.style.height = `${second[i] / 40 * 100}%`;
    two.title = `${second[i]} completed`;

    const caption = document.createElement("span");
    caption.className = "bar-label";
    caption.textContent = label;

    pair.append(one, two);
    column.append(pair, caption);
    bars.append(column);
  });
}

function renderAll() {
  renderStats();
  renderAppointments();
}

$("search").addEventListener("input", renderAppointments);
$("statusFilter").addEventListener("change", renderAppointments);
$("period").addEventListener("change", renderChart);

$("newBtn").addEventListener("click", () => dialog.showModal());
$("closeDialog").addEventListener("click", () => dialog.close());

$("appointmentForm").addEventListener("submit", event => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);

  appointments.unshift({
    id: Date.now(),
    client: form.get("client").trim(),
    email: "New client",
    service: form.get("service").trim(),
    date: form.get("date"),
    status: form.get("status")
  });

  renderAll();
  event.currentTarget.reset();
  dialog.close();
});

$("themeBtn").addEventListener("click", () => {
  document.body.classList.toggle("light");
});

$("resetBtn").addEventListener("click", () => {
  appointments = initialAppointments.map(item => ({ ...item }));
  $("search").value = "";
  $("statusFilter").value = "All";
  renderAll();
});

renderAll();
renderChart();
