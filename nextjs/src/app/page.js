"use client";

import { useContext, useState, useEffect } from 'react';
import AuthContext from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import axios from 'axios';

const Home = () => {
  const { user, logout } = useContext(AuthContext);
  const [items, setItems] = useState([]);
  const [lists, setLists] = useState([]);
  const [itemName, setItemName] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [listName, setListName] = useState('');
  const [listDescription, setListDescription] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);

  const getAuth = () => {
    const raw = localStorage.getItem('token');
    if (!raw) return {};
    let token = raw;
    try {
      const parsed = JSON.parse(raw);
      token = parsed.access_token ?? parsed.token ?? raw;
    } catch {}
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  useEffect(() => {
    const fetchItemsAndLists = async () => {
      try {
        const raw = localStorage.getItem('token');
        if (!raw) return;
        let token = raw;
        try {
          const parsed = JSON.parse(raw);
          token = parsed.access_token ?? parsed.token ?? raw;
        } catch {}
        const auth = { headers: { Authorization: `Bearer ${token}` } };

        const [itemsResponse, listsResponse] = await Promise.all([
          axios.get('http://localhost:8000/items/', auth),
          axios.get('http://localhost:8000/lists/', auth),
        ]);
        setItems(itemsResponse.data);
        setLists(listsResponse.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };

    fetchItemsAndLists();
  }, []);

  const handleCreateItem = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        'http://localhost:8000/items/',
        { name: itemName, description: itemDescription },
        getAuth()
      );
      setItems([...items, response.data]);
      setItemName('');
      setItemDescription('');
    } catch (error) {
      console.error('Failed to create item:', error);
    }
  };

  const handleCreateList = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        'http://localhost:8000/lists/',
        { name: listName, description: listDescription, workouts: selectedItems.map(Number) },
        getAuth()
      );
      setListName('');
      setListDescription('');
      setSelectedItems([]);
      const auth = getAuth();
      const res = await axios.get('http://localhost:8000/lists/', auth);
      setLists(res.data);
    } catch (error) {
      console.error('Failed to create list:', error);
    }
  };

  const deleteItem = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/items/${id}`, getAuth());
      setItems((prev) => prev.filter((w) => w.id !== id));
      setLists((prev) =>
        prev.map((r) => ({ ...r, workouts: (r.workouts || []).filter((w) => w.id !== id) }))
      );
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  };

  const deleteList = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/lists/${id}`, getAuth());
      setLists((prev) => prev.filter((r) => r.id !== id));
    } catch (error) {
      console.error('Failed to delete list:', error);
    }
  };

  return (
    <ProtectedRoute>
      <div className="container">
        <h1>Welcome!</h1>
        <button onClick={logout} className="btn btn-danger">Logout</button>

        <div className="accordion mt-5 mb-5" id="accordionExample">
          <div className="accordion-item">
            <h2 className="accordion-header" id="headingOne">
              <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                Create Item
              </button>
            </h2>
            <div id="collapseOne" className="accordion-collapse collapse show" aria-labelledby="headingOne" data-bs-parent="#accordionExample">
              <div className="accordion-body">
                <form onSubmit={handleCreateItem}>
                  <div className="mb-3">
                    <label htmlFor="itemName" className="form-label">Item Name</label>
                    <input
                      type="text"
                      className="form-control"
                      id="itemName"
                      value={itemName}
                      onChange={(e) => setItemName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="itemDescription" className="form-label">Item Description</label>
                    <input
                      type="text"
                      className="form-control"
                      id="itemDescription"
                      value={itemDescription}
                      onChange={(e) => setItemDescription(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary">Create Item</button>
                </form>
              </div>
            </div>
          </div>
          <div className="accordion-item">
            <h2 className="accordion-header" id="headingTwo">
              <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
                Create List
              </button>
            </h2>
            <div id="collapseTwo" className="accordion-collapse collapse" aria-labelledby="headingTwo" data-bs-parent="#accordionExample">
              <div className="accordion-body">
                <form onSubmit={handleCreateList}>
                  <div className="mb-3">
                    <label htmlFor="listName" className="form-label">List Name</label>
                    <input
                      type="text"
                      className="form-control"
                      id="listName"
                      value={listName}
                      onChange={(e) => setListName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="listDescription" className="form-label">List Description</label>
                    <input
                      type="text"
                      className="form-control"
                      id="listDescription"
                      value={listDescription}
                      onChange={(e) => setListDescription(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="itemSelect" className="form-label">Select Items</label>
                    <select
                      multiple
                      className="form-control"
                      id="itemSelect"
                      value={selectedItems}
                      onChange={(e) => setSelectedItems([...e.target.selectedOptions].map(o => Number(o.value)))}
                    >
                      {items.map(item => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button type="submit" className="btn btn-primary">Create List</button>
                </form>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3>Your lists:</h3>
          <ul>
            {lists.map(list => (
              <div className="card" key={list.id}>
                <div className="card-body">
                  <button type="button" className="btn btn-sm btn-outline-danger float-end" onClick={() => deleteList(list.id)}>Delete</button>
                  <h5 className="card-title">{list.name}</h5>
                  <p className="card-text">{list.description}</p>
                  <ul className="card-text">
                    {list.workouts && list.workouts.map(item => (
                      <li key={item.id}>
                        {item.name}: {item.description}
                        <button type="button" className="btn btn-sm btn-outline-danger ms-2" onClick={() => deleteItem(item.id)}>Delete</button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </ul>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Home;
