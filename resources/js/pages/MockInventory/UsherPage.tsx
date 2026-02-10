import React, { useState, useEffect } from "react";

type Box = {
  id: number;
  box_name: string;
  category_quantity: number;
};

type Subcategory = {
  subcategory_id: number;
  subcategory_name: string;
  stockin: number;
  stockout: number;
  damage: number;
  inuse: number;
  current_items: number;
};

type Serial = {
  serial: string;
  supplier: string;
  status: string;
};

const MasterlistPage: React.FC = () => {
  const [mainCategoryId, setMainCategoryId] = useState<number | null>(null);

  const [boxes, setBoxes] = useState<Box[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [serials, setSerials] = useState<Serial[]>([]);

  const [selectedBox, setSelectedBox] = useState<number | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<number | null>(null);

  // Load boxes when category changes
  useEffect(() => {
    if (!mainCategoryId) return;

    fetch(`http://localhost:8000/api/masterlist/boxes/${mainCategoryId}`)
      .then(res => res.json())
      .then(data => {
        setBoxes(data);
        setSubcategories([]);
        setSerials([]);
      });
  }, [mainCategoryId]);

  const loadSubcategories = (boxId: number) => {
    setSelectedBox(boxId);
    setSerials([]);

    fetch(`http://localhost:8000/api/masterlist/box/${boxId}/subcategories`)
      .then(res => res.json())
      .then(data => setSubcategories(data));
  };

  const loadSerials = (subcategoryId: number) => {
    setSelectedSubcategory(subcategoryId);

    fetch(`http://localhost:8000/api/masterlist/subcategory/${subcategoryId}/serials`)
      .then(res => {
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        return res.json();
      })
      .then(data => {
        console.log("SERIAL DATA:", data);
        console.log("Data is array?", Array.isArray(data));
        console.log("Data length:", data?.length);
        setSerials(Array.isArray(data) ? data : []);
      })
      .catch(err => console.error("Fetch error:", err));
  };

  return (
    <div style={{ padding: "40px", fontFamily: "Arial, sans-serif", backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      <div style={{ marginBottom: "40px", backgroundColor: "#fff", padding: "25px", borderRadius: "8px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
        <h1 style={{ color: "#1a1a1a", marginBottom: "20px", fontSize: "32px", fontWeight: "bold" }}>
          Masterlist Inventory
        </h1>
        <p style={{ color: "#666", fontSize: "14px", marginBottom: "0" }}>View and manage your inventory items organized by categories, boxes, and subcategories</p>
      </div>

      {/* MAIN CATEGORY SELECT */}
      <div style={{ backgroundColor: "#fff", padding: "25px", borderRadius: "8px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)", marginBottom: "40px" }}>
        <label style={{ display: "block", fontSize: "16px", fontWeight: "bold", color: "#333", marginBottom: "12px" }}>
          Select Main Category
        </label>
        <select
          onChange={(e) => setMainCategoryId(Number(e.target.value))}
          style={{
            padding: "12px 16px",
            fontSize: "16px",
            borderRadius: "6px",
            border: "2px solid #007bff",
            marginBottom: "0",
            cursor: "pointer",
            width: "100%",
            maxWidth: "400px",
            backgroundColor: "#fff",
            fontWeight: "500",
            transition: "border-color 0.3s, box-shadow 0.3s"
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "#0056b3";
            e.currentTarget.style.boxShadow = "0 0 8px rgba(0, 123, 255, 0.3)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "#007bff";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <option value="">-- Choose a Category --</option>
          <option value="1">USHER</option>
          <option value="2">WEHLO</option>
          <option value="3">USHERETTE</option>
          <option value="4">HOCLOCMAC</option>
        </select>
      </div>

      {/* BOX TABLE */}
      {boxes.length > 0 && (
        <>
          <h3 style={{ marginTop: "0", marginBottom: "15px", color: "#007bff", fontSize: "20px", fontWeight: "bold" }}>Boxes</h3>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              backgroundColor: "#fff",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              borderRadius: "4px",
              overflow: "hidden",
              marginBottom: "30px"
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#007bff", color: "white" }}>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: "bold", borderBottom: "2px solid #0056b3" }}>Box Name</th>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: "bold", borderBottom: "2px solid #0056b3" }}>Category Quantity</th>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: "bold", borderBottom: "2px solid #0056b3" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {boxes.map((box, idx) => (
                <tr
                  key={box.id}
                  style={{
                    backgroundColor: idx % 2 === 0 ? "#f9f9f9" : "#fff",
                    borderBottom: "1px solid #ddd",
                    transition: "background-color 0.2s"
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e8f4f8")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = idx % 2 === 0 ? "#f9f9f9" : "#fff")}
                >
                  <td style={{ padding: "12px" }}>{box.box_name}</td>
                  <td style={{ padding: "12px" }}>{box.category_quantity}</td>
                  <td style={{ padding: "12px" }}>
                    <button
                      onClick={() => loadSubcategories(box.id)}
                      style={{
                        padding: "6px 12px",
                        backgroundColor: "#007bff",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "14px",
                        transition: "background-color 0.2s"
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#0056b3")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#007bff")}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* SUBCATEGORY TABLE */}
      {selectedBox && subcategories.length > 0 && (
        <>
          <h3 style={{ marginTop: "30px", marginBottom: "15px", color: "#28a745", fontSize: "20px", fontWeight: "bold" }}>Subcategories</h3>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              backgroundColor: "#fff",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              borderRadius: "4px",
              overflow: "hidden",
              marginBottom: "30px"
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#28a745", color: "white" }}>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: "bold", borderBottom: "2px solid #1e7e34" }}>Subitem Category</th>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: "bold", borderBottom: "2px solid #1e7e34" }}>Stock In</th>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: "bold", borderBottom: "2px solid #1e7e34" }}>Stock Out</th>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: "bold", borderBottom: "2px solid #1e7e34" }}>Damage</th>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: "bold", borderBottom: "2px solid #1e7e34" }}>In Use</th>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: "bold", borderBottom: "2px solid #1e7e34" }}>Current Items</th>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: "bold", borderBottom: "2px solid #1e7e34" }}>Serial</th>
              </tr>
            </thead>
            <tbody>
              {subcategories.map((sub, idx) => (
                <tr
                  key={sub.subcategory_id}
                  style={{
                    backgroundColor: idx % 2 === 0 ? "#f9f9f9" : "#fff",
                    borderBottom: "1px solid #ddd",
                    transition: "background-color 0.2s"
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e8f8f0")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = idx % 2 === 0 ? "#f9f9f9" : "#fff")}
                >
                  <td style={{ padding: "12px" }}>{sub.subcategory_name}</td>
                  <td style={{ padding: "12px" }}>{sub.stockin}</td>
                  <td style={{ padding: "12px" }}>{sub.stockout}</td>
                  <td style={{ padding: "12px" }}>{sub.damage}</td>
                  <td style={{ padding: "12px" }}>{sub.inuse}</td>
                  <td style={{ padding: "12px" }}>{sub.current_items}</td>
                  <td style={{ padding: "12px" }}>
                    <button
                      onClick={() => loadSerials(sub.subcategory_id)}
                      style={{
                        padding: "6px 12px",
                        backgroundColor: "#28a745",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "14px",
                        transition: "background-color 0.2s"
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1e7e34")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#28a745")}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* SERIAL TABLE */}
      {selectedSubcategory && serials.length > 0 && (
        <>
          <h3 style={{ marginTop: "30px", marginBottom: "15px", color: "#fd7e14", fontSize: "20px", fontWeight: "bold" }}>Serial Numbers</h3>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              backgroundColor: "#fff",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              borderRadius: "4px",
              overflow: "hidden"
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#fd7e14", color: "white" }}>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: "bold", borderBottom: "2px solid #cc6400" }}>Serial</th>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: "bold", borderBottom: "2px solid #cc6400" }}>Supplier</th>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: "bold", borderBottom: "2px solid #cc6400" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {serials.map((serial, idx) => (
                <tr
                  key={serial.serial}
                  style={{
                    backgroundColor: idx % 2 === 0 ? "#f9f9f9" : "#fff",
                    borderBottom: "1px solid #ddd"
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fff8e8")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = idx % 2 === 0 ? "#f9f9f9" : "#fff")}
                >
                  <td style={{ padding: "12px" }}>{serial.serial}</td>
                  <td style={{ padding: "12px" }}>{serial.supplier}</td>
                  <td style={{ padding: "12px" }}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        fontWeight: "bold",
                        backgroundColor: serial.status === "IN_STOCK" ? "#d4edda" : serial.status === "IN_USE" ? "#cfe2ff" : "#f8d7da",
                        color: serial.status === "IN_STOCK" ? "#155724" : serial.status === "IN_USE" ? "#084298" : "#721c24"
                      }}
                    >
                      {serial.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default MasterlistPage;
