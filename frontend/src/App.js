import React, { useEffect, useState } from "react";
import axios from "axios";

function App() {

  const [loggedIn, setLoggedIn] = useState(false);

  const [loginData, setLoginData] = useState({
    username: "",
    password: ""
  });

  const [furniture, setFurniture] = useState([]);

  const [form, setForm] = useState({
    id: null,
    name: "",
    category: "",
    price: "",
    quantity: ""
  });

  const fetchFurniture = async () => {
    const res = await axios.get("http://localhost:5000/furniture");
    setFurniture(res.data);
  };

  useEffect(() => {
    if (loggedIn) {
      fetchFurniture();
    }
  }, [loggedIn]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleLoginChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value
    });
  };

  const login = async () => {
    try {
      const res = await axios.post("http://localhost:5000/login", loginData);

      if (res.data.success) {
        setLoggedIn(true);
      } else {
        alert("Invalid credentials");
      }

    } catch (err) {
      alert("Login failed");
    }
  };

  const addOrUpdateFurniture = async () => {

    if (form.id) {

      await axios.put(
        `http://localhost:5000/furniture/${form.id}`,
        form
      );

    } else {

      await axios.post(
        "http://localhost:5000/furniture",
        form
      );
    }

    setForm({
      id: null,
      name: "",
      category: "",
      price: "",
      quantity: ""
    });

    fetchFurniture();
  };

  const editFurniture = (item) => {
    setForm(item);
  };

  const deleteFurniture = async (id) => {
    await axios.delete(`http://localhost:5000/furniture/${id}`);
    fetchFurniture();
  };

  if (!loggedIn) {
    return (

      <div className="container mt-5">

        <div className="card p-4 shadow mx-auto" style={{ maxWidth: "400px" }}>

          <h2 className="text-center mb-4">
            Furniture Login
          </h2>

          <input
            className="form-control mb-3"
            type="text"
            name="username"
            placeholder="Username"
            onChange={handleLoginChange}
          />

          <input
            className="form-control mb-3"
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleLoginChange}
          />

          <button
            className="btn btn-dark w-100"
            onClick={login}
          >
            Login
          </button>

        </div>

      </div>
    );
  }

  return (

    <div className="container mt-4">

      <div className="d-flex justify-content-between align-items-center mb-4">

        <h1>Furniture Management System</h1>

        <button
          className="btn btn-danger"
          onClick={() => setLoggedIn(false)}
        >
          Logout
        </button>

      </div>

      <div className="card p-4 shadow mb-4">

        <h4 className="mb-3">

          {form.id ? "Update Furniture" : "Add Furniture"}

        </h4>

        <div className="row">

          <div className="col-md-3">
            <input
              className="form-control"
              name="name"
              placeholder="Name"
              value={form.name}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-3">
            <input
              className="form-control"
              name="category"
              placeholder="Category"
              value={form.category}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-2">
            <input
              className="form-control"
              name="price"
              placeholder="Price"
              value={form.price}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-2">
            <input
              className="form-control"
              name="quantity"
              placeholder="Quantity"
              value={form.quantity}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-2">
            <button
              className="btn btn-primary w-100"
              onClick={addOrUpdateFurniture}
            >
              {form.id ? "Update" : "Add"}
            </button>
          </div>

        </div>

      </div>

      <div className="card shadow p-3">

        <table className="table table-hover">

          <thead className="table-dark">

            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Actions</th>
            </tr>

          </thead>

          <tbody>

            {furniture.map((item) => (

              <tr key={item.id}>

                <td>{item.id}</td>
                <td>{item.name}</td>
                <td>{item.category}</td>
                <td>₹{item.price}</td>
                <td>{item.quantity}</td>

                <td>

                  <button
                    className="btn btn-warning btn-sm me-2"
                    onClick={() => editFurniture(item)}
                  >
                    Edit
                  </button>

                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => deleteFurniture(item.id)}
                  >
                    Delete
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}

export default App;