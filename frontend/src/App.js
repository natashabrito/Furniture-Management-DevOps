import React, { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [loginData, setLoginData] = useState({ username: "", password: "" });

  const [activeTab, setActiveTab] = useState("inventory"); // 'inventory' or 'orders'

  const [furniture, setFurniture] = useState([]);
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState({ id: null, name: "", category: "", price: "", quantity: "" });

  const [trackingOrder, setTrackingOrder] = useState(null); // For the modal

  const fetchData = async () => {
    try {
      const [furnRes, ordRes] = await Promise.all([
        axios.get("/furniture"),
        axios.get("/orders")
      ]);
      setFurniture(furnRes.data);
      setOrders(ordRes.data);
    } catch (err) {
      console.error("Failed to fetch data", err);
    }
  };

  useEffect(() => {
    if (loggedIn) fetchData();
  }, [loggedIn]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/login", loginData);
      if (res.data.success) setLoggedIn(true);
      else alert("Oops! Wrong username or password 🙈");
    } catch (err) {
      alert("Login failed. Is the backend running?");
    }
  };

  // --- Inventory Functions ---
  const saveFurniture = async (e) => {
    e.preventDefault();
    try {
      if (form.id) await axios.put(`/furniture/${form.id}`, form);
      else await axios.post("/furniture", form);
      setForm({ id: null, name: "", category: "", price: "", quantity: "" });
      fetchData();
    } catch (err) {
      console.error("Failed to save", err);
    }
  };

  const deleteItem = async (id) => {
    if (window.confirm("Are you sure you want to delete this item? 🗑️")) {
      await axios.delete(`/furniture/${id}`);
      fetchData();
    }
  };

  // --- Order Functions ---
  const placeOrder = async (item) => {
    if (item.quantity <= 0) {
      alert("Out of stock! 😢");
      return;
    }
    const userName = window.prompt(`Who is requesting the ${item.name}? (e.g. Alice - Dorm 101)`);
    if (userName) {
      try {
        await axios.post("/orders", { furniture_id: item.id, user_name: userName });
        alert("Order placed successfully! 🎉");
        fetchData();
      } catch (err) {
        console.error("Failed to place order", err);
      }
    }
  };

  const updateOrderStatus = async (id, newStatus) => {
    try {
      await axios.put(`/orders/${id}/status`, { status: newStatus });
      fetchData();
      if (trackingOrder && trackingOrder.id === id) {
        setTrackingOrder({ ...trackingOrder, status: newStatus });
      }
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  // --- Computed Stats ---
  const filteredFurniture = furniture.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalItems = furniture.reduce((acc, curr) => acc + parseInt(curr.quantity), 0);
  const activeOrders = orders.filter(o => o.status !== 'Delivered').length;

  if (!loggedIn) {
    return (
      <div className="login-wrapper">
        <div className="login-box">
          <h2>📦 Campus Logistics Hub</h2>
          <p>Login to manage inventory & deliveries</p>
          <form onSubmit={handleLogin}>
            <input type="text" placeholder="Username (e.g. admin)" onChange={e => setLoginData({ ...loginData, username: e.target.value })} required />
            <input type="password" placeholder="Password (e.g. admin123)" onChange={e => setLoginData({ ...loginData, password: e.target.value })} required />
            <button type="submit">Let's Go 🚀</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="app-layout">
      {/* Header & Dashboard Stats */}
      <header className="app-header">
        <div>
          <h1>📦 Campus Logistics Hub</h1>
          <div className="stats-row">
            <span className="stat-badge">🏢 {totalItems} Items in Stock</span>
            <span className="stat-badge warning">🚚 {activeOrders} Active Deliveries</span>
            <span className="stat-badge success">✅ {orders.length - activeOrders} Delivered</span>
          </div>
        </div>
        <button className="btn-logout" onClick={() => setLoggedIn(false)}>Logout 👋</button>
      </header>

      {/* Navigation Tabs */}
      <div className="tabs">
        <button className={`tab ${activeTab === 'inventory' ? 'active' : ''}`} onClick={() => setActiveTab('inventory')}>
          🛋️ Inventory
        </button>
        <button className={`tab ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
          🚚 Orders & Tracking
        </button>
      </div>

      <main className="main-content">
        {activeTab === 'inventory' && (
          <>
            <section className="form-section">
              <div className="card sticky-card">
                <h3>{form.id ? "✏️ Edit Item" : "✨ Add New Item"}</h3>
                <form onSubmit={saveFurniture} className="add-form">
                  <input required placeholder="Item Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                  <input required placeholder="Category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
                  <div className="row-inputs">
                    <input required type="number" placeholder="Price (₹)" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
                    <input required type="number" placeholder="Qty" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} />
                  </div>
                  <button type="submit" className="btn-primary">{form.id ? "Update Item" : "Add to Inventory"}</button>
                  {form.id && <button type="button" className="btn-secondary mt-2" onClick={() => setForm({ id: null, name: "", category: "", price: "", quantity: "" })}>Cancel Edit</button>}
                </form>
              </div>
            </section>

            <section className="inventory-section">
              <div className="search-bar">
                <input type="text" placeholder="🔍 Search by name or category..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <div className="items-grid">
                {filteredFurniture.map(item => (
                  <div key={item.id} className="item-card">
                    <div className="item-header">
                      <span className="category-badge">{item.category}</span>
                      <span className={`qty-badge ${item.quantity <= 0 ? 'out-of-stock' : ''}`}>
                        {item.quantity > 0 ? `${item.quantity} in stock` : 'Out of Stock'}
                      </span>
                    </div>
                    <h4>{item.name}</h4>
                    <p className="price">₹{item.price}</p>
                    <div className="item-actions">
                      <button onClick={() => placeOrder(item)} className="btn-primary" disabled={item.quantity <= 0}>Request 🛒</button>
                      <button onClick={() => setForm(item)} className="btn-edit">Edit</button>
                      <button onClick={() => deleteItem(item.id)} className="btn-delete">Del</button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {activeTab === 'orders' && (
          <section className="orders-section w-100">
            <div className="card">
              <h3>Recent Orders</h3>
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Item</th>
                    <th>Requested By</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id}>
                      <td>#{order.id}</td>
                      <td>{order.furniture_name}</td>
                      <td>{order.user_name}</td>
                      <td>
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          className={`status-select ${order.status.replace(/\s+/g, '-').toLowerCase()}`}
                        >
                          <option value="Processing">Processing ⏳</option>
                          <option value="Shipped">Shipped 📦</option>
                          <option value="Out for Delivery">Out for Delivery 🚚</option>
                          <option value="Delivered">Delivered ✅</option>
                        </select>
                      </td>
                      <td>
                        <button onClick={() => setTrackingOrder(order)} className="btn-secondary btn-sm">Track 📍</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>

      {/* Tracking Modal */}
      {trackingOrder && (
        <div className="modal-overlay" onClick={() => setTrackingOrder(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setTrackingOrder(null)}>×</button>
            <h2>Live Tracking 📍</h2>
            <p><strong>Order #{trackingOrder.id}:</strong> {trackingOrder.furniture_name}</p>
            <p><strong>To:</strong> {trackingOrder.user_name}</p>

            <div className="tracking-timeline">
              {['Processing', 'Shipped', 'Out for Delivery', 'Delivered'].map((step, index) => {
                const statuses = ['Processing', 'Shipped', 'Out for Delivery', 'Delivered'];
                const currentIndex = statuses.indexOf(trackingOrder.status);
                const isCompleted = index <= currentIndex;
                const isActive = index === currentIndex;

                return (
                  <div key={step} className={`timeline-step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}>
                    <div className="step-icon">{isCompleted ? '✓' : (index + 1)}</div>
                    <div className="step-text">{step}</div>
                  </div>
                );
              })}
            </div>
            {trackingOrder.status === 'Out for Delivery' && (
              <div className="delivery-animation">
                🚚💨 <span>Arriving soon!</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;