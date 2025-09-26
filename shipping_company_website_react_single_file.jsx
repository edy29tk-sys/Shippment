import React, { useEffect, useState } from "react";

// Single-file React + Tailwind shipping website
// - Export default React component
// - Uses localStorage as a mock backend
// - Pages: Home, Create Shipment, Track Shipment, Shipments (admin list)
// - Tracking number generation and status updates

export default function ShippingApp() {
  const [route, setRoute] = useState("/"); // simple internal router
  const [shipments, setShipments] = useState([]);
  const [flash, setFlash] = useState(null);

  // load shipments from localStorage
  useEffect(() => {
    const raw = localStorage.getItem("shipments:v1");
    if (raw) setShipments(JSON.parse(raw));
  }, []);

  useEffect(() => {
    localStorage.setItem("shipments:v1", JSON.stringify(shipments));
  }, [shipments]);

  function showFlash(message, type = "info") {
    setFlash({ message, type });
    setTimeout(() => setFlash(null), 3500);
  }

  // Generates a reasonably unique human-friendly tracking code
  function generateTracking() {
    const time = Date.now().toString(36).toUpperCase();
    const rand = Math.floor(Math.random() * 9000 + 1000).toString(36).toUpperCase();
    return `SHP-${time}-${rand}`;
  }

  function createShipment({ sender, recipient, origin, destination, weight }) {
    const tracking = generateTracking();
    const newShipment = {
      id: tracking,
      tracking,
      sender,
      recipient,
      origin,
      destination,
      weight: Number(weight) || 0,
      createdAt: new Date().toISOString(),
      status: "Created",
      history: [
        { status: "Created", at: new Date().toISOString(), note: "Shipment created" },
      ],
    };
    setShipments((s) => [newShipment, ...s]);
    showFlash(`Shipment created: ${tracking}`, "success");
    setRoute(`/track/${tracking}`);
  }

  function updateShipmentStatus(trackingId, nextStatus, note = "") {
    setShipments((all) =>
      all.map((sh) => {
        if (sh.tracking !== trackingId) return sh;
        const updated = {
          ...sh,
          status: nextStatus,
          history: [
            { status: nextStatus, at: new Date().toISOString(), note },
            ...sh.history,
          ],
        };
        return updated;
      })
    );
    showFlash(`Status updated to ${nextStatus} for ${trackingId}`, "info");
  }

  function deleteShipment(trackingId) {
    if (!confirm(`Delete shipment ${trackingId}?`)) return;
    setShipments((s) => s.filter((x) => x.tracking !== trackingId));
    showFlash(`Deleted ${trackingId}`, "warn");
    setRoute("/");
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <header className="bg-white shadow sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 flex items-center justify-center text-white font-bold">S</div>
            <div>
              <h1 className="font-semibold">SwiftShip Logistics</h1>
              <div className="text-sm text-gray-500">Fast. Transparent. Trackable.</div>
            </div>
          </div>

          <nav className="flex items-center gap-3">
            <NavButton label="Home" active={route === "/"} onClick={() => setRoute("/")} />
            <NavButton label="Create Shipment" active={route === "/create"} onClick={() => setRoute("/create")} />
            <NavButton label="Track" active={route.startsWith("/track")} onClick={() => setRoute("/track")} />
            <NavButton label="Shipments" active={route === "/shipments"} onClick={() => setRoute("/shipments")} />
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {flash && (
          <div className={`mb-4 rounded p-3 text-sm ${flash.type === "success" ? "bg-green-50 border border-green-200" : flash.type === "warn" ? "bg-yellow-50 border border-yellow-200" : "bg-blue-50 border border-blue-200"}`}>
            {flash.message}
          </div>
        )}

        {route === "/" && <Home onQuickTrack={(q) => setRoute(`/track/${q}`)} />}
        {route === "/create" && <CreateShipment onCreate={createShipment} />}
        {route.startsWith("/track/") && (
          <TrackShipment
            trackingId={route.replace("/track/", "")}
            lookup={(id) => shipments.find((s) => s.tracking === id)}
            onUpdate={updateShipmentStatus}
            onDelete={deleteShipment}
          />
        )}
        {route === "/shipments" && (
          <ShipmentsAdmin shipments={shipments} onUpdate={updateShipmentStatus} onDelete={deleteShipment} />
        )}
      </main>

      <footer className="bg-white border-t mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6 text-sm text-gray-500">
          © {new Date().getFullYear()} SwiftShip Logistics — built with ❤️. Local mock backend (localStorage).
        </div>
      </footer>
    </div>
  );
}

function NavButton({ label, onClick, active }) {
  return (
    <button onClick={onClick} className={`px-3 py-2 rounded-md text-sm font-medium ${active ? "bg-indigo-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}>
      {label}
    </button>
  );
}

function Home({ onQuickTrack }) {
  const [q, setQ] = useState("");
  return (
    <section className="grid md:grid-cols-2 gap-8 items-center">
      <div>
        <h2 className="text-3xl font-bold mb-3">Ship with confidence. Track in real-time.</h2>
        <p className="text-gray-600 mb-4">Create shipments, get instant tracking numbers, and watch your package move through our simple tracking UI. This demo uses local storage as a backend; integrate real APIs for production.</p>

        <div className="flex gap-2">
          <button onClick={() => onQuickTrack("")} className="px-4 py-2 bg-indigo-600 text-white rounded shadow">Create Shipment</button>
          <button onClick={() => onQuickTrack(prompt("Enter tracking number to go to track page:"))} className="px-4 py-2 border rounded">Quick Track</button>
        </div>

        <div className="mt-6 bg-white border rounded p-4">
          <h3 className="text-lg font-medium">How tracking works</h3>
          <ol className="list-decimal list-inside text-gray-600 mt-2">
            <li>Fill shipment details and create a shipment.</li>
            <li>We generate a tracking code you can share.</li>
            <li>Use the tracking page to view status and history.</li>
            <li>Admin can update status to simulate progress.</li>
          </ol>
        </div>
      </div>

      <div>
        <div className="bg-white shadow rounded p-6">
          <h3 className="font-semibold mb-2">Track a package</h3>
          <div className="flex gap-2">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Enter tracking number (e.g. SHP-...)" className="flex-1 border rounded px-3 py-2" />
            <button onClick={() => onQuickTrack(q)} className="px-4 py-2 bg-sky-600 text-white rounded">Track</button>
          </div>
          <div className="text-xs text-gray-500 mt-3">Tip: Try the admin "Shipments" page to create simulated status updates.</div>
        </div>
      </div>
    </section>
  );
}

function CreateShipment({ onCreate }) {
  const [form, setForm] = useState({ sender: "", recipient: "", origin: "", destination: "", weight: "0" });

  function update(field, val) {
    setForm((f) => ({ ...f, [field]: val }));
  }

  function submit(e) {
    e.preventDefault();
    if (!form.sender || !form.recipient || !form.origin || !form.destination) {
      alert("Please fill sender, recipient, origin and destination.");
      return;
    }
    onCreate(form);
  }

  return (
    <div className="max-w-2xl mx-auto bg-white border rounded p-6 shadow">
      <h2 className="text-2xl font-semibold mb-4">Create Shipment</h2>
      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="block text-sm text-gray-600">Sender</label>
          <input value={form.sender} onChange={(e) => update("sender", e.target.value)} className="w-full border rounded px-3 py-2" placeholder="Name, company, phone" />
        </div>
        <div>
          <label className="block text-sm text-gray-600">Recipient</label>
          <input value={form.recipient} onChange={(e) => update("recipient", e.target.value)} className="w-full border rounded px-3 py-2" placeholder="Name, address, phone" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-600">Origin</label>
            <input value={form.origin} onChange={(e) => update("origin", e.target.value)} className="w-full border rounded px-3 py-2" placeholder="City, State" />
          </div>
          <div>
            <label className="block text-sm text-gray-600">Destination</label>
            <input value={form.destination} onChange={(e) => update("destination", e.target.value)} className="w-full border rounded px-3 py-2" placeholder="City, State" />
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-600">Weight (kg)</label>
          <input type="number" value={form.weight} onChange={(e) => update("weight", e.target.value)} className="w-36 border rounded px-3 py-2" />
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded">Create Shipment</button>
          <button type="button" onClick={() => setForm({ sender: "", recipient: "", origin: "", destination: "", weight: "0" })} className="px-3 py-2 border rounded">Reset</button>
        </div>
      </form>
    </div>
  );
}

function TrackShipment({ trackingId, lookup, onUpdate, onDelete }) {
  const [id, setId] = useState(trackingId || "");
  const [shipment, setShipment] = useState(null);

  useEffect(() => {
    setShipment(lookup(id));
  }, [id]);

  useEffect(() => {
    setId(trackingId);
  }, [trackingId]);

  function refresh() {
    setShipment(lookup(id));
  }

  const statusOrder = ["Created", "Picked up", "In Transit", "Out for Delivery", "Delivered"];

  function advance() {
    if (!shipment) return;
    const curIndex = statusOrder.indexOf(shipment.status);
    const next = statusOrder[Math.min(curIndex + 1, statusOrder.length - 1)];
    onUpdate(shipment.tracking, next, `Advanced from ${shipment.status} to ${next}`);
    setTimeout(refresh, 100); // quick refresh
  }

  return (
    <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
      <div className="bg-white border rounded p-6">
        <h2 className="text-xl font-semibold mb-3">Track Shipment</h2>
        <div className="flex gap-2 mb-3">
          <input value={id} onChange={(e) => setId(e.target.value)} placeholder="Tracking number" className="flex-1 border rounded px-3 py-2" />
          <button onClick={refresh} className="px-3 py-2 border rounded">Lookup</button>
        </div>

        {!shipment && <div className="text-sm text-gray-500">No shipment found. Create one on the Create page to test.</div>}

        {shipment && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-500">Tracking</div>
                <div className="font-mono font-semibold">{shipment.tracking}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500">Current status</div>
                <div className="font-semibold">{shipment.status}</div>
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-600">From</div>
              <div className="font-medium">{shipment.origin}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">To</div>
              <div className="font-medium">{shipment.destination}</div>
            </div>

            <ProgressBar status={shipment.status} order={statusOrder} />

            <div className="flex gap-2">
              <button onClick={advance} className="px-3 py-2 bg-sky-600 text-white rounded">Advance status</button>
              <button onClick={() => onUpdate(shipment.tracking, "Delivered", "Marked delivered by user") } className="px-3 py-2 border rounded">Mark Delivered</button>
              <button onClick={() => onDelete(shipment.tracking)} className="px-3 py-2 border rounded text-red-600">Delete</button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white border rounded p-6">
        <h3 className="font-semibold mb-2">Shipment History</h3>
        {!shipment && <div className="text-sm text-gray-500">No history to show.</div>}
        {shipment && (
          <div className="space-y-2">
            {shipment.history.map((h, i) => (
              <div key={i} className="border rounded p-3 bg-gray-50">
                <div className="text-sm font-medium">{h.status}</div>
                <div className="text-xs text-gray-500">{new Date(h.at).toLocaleString()}</div>
                {h.note && <div className="text-sm mt-1">{h.note}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProgressBar({ status, order }) {
  const idx = Math.max(0, order.indexOf(status));
  const pct = ((idx + 1) / order.length) * 100;
  return (
    <div>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div style={{ width: `${pct}%` }} className="h-3 rounded-full bg-gradient-to-r from-sky-400 to-indigo-600"></div>
      </div>
      <div className="flex justify-between text-xs text-gray-500 mt-2">
        {order.map((o) => (
          <div key={o} className={`w-1/5 text-center ${o === status ? "font-semibold text-gray-700" : ""}`}>{o}</div>
        ))}
      </div>
    </div>
  );
}

function ShipmentsAdmin({ shipments = [], onUpdate, onDelete }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("");

  const list = shipments.filter((s) => {
    if (!query && !filter) return true;
    if (query && !(s.tracking.includes(query) || s.recipient.includes(query) || s.sender.includes(query))) return false;
    if (filter && s.status !== filter) return false;
    return true;
  });

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by tracking, sender, recipient" className="flex-1 border rounded px-3 py-2" />
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="border rounded px-3 py-2">
          <option value="">All statuses</option>
          <option>Created</option>
          <option>Picked up</option>
          <option>In Transit</option>
          <option>Out for Delivery</option>
          <option>Delivered</option>
        </select>
      </div>

      <div className="grid gap-3">
        {list.length === 0 && <div className="text-gray-500">No shipments found.</div>}
        {list.map((s) => (
          <div key={s.tracking} className="bg-white border rounded p-4 flex items-center justify-between">
            <div>
              <div className="font-mono text-sm">{s.tracking}</div>
              <div className="text-sm font-medium">{s.recipient} — <span className="text-xs text-gray-500">{s.destination}</span></div>
              <div className="text-xs text-gray-500">{s.sender} • {new Date(s.createdAt).toLocaleString()}</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-sm">{s.status}</div>
              <button onClick={() => onUpdate(s.tracking, "In Transit", "Simulated update from admin") } className="px-3 py-2 border rounded">Set In Transit</button>
              <button onClick={() => onUpdate(s.tracking, "Out for Delivery", "Simulated update from admin") } className="px-3 py-2 border rounded">Out for Delivery</button>
              <button onClick={() => onUpdate(s.tracking, "Delivered", "Simulated update from admin") } className="px-3 py-2 border rounded">Deliver</button>
              <button onClick={() => onDelete(s.tracking)} className="px-3 py-2 border rounded text-red-600">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
