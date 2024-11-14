import React, { useEffect, useState } from "react";
import Sidebar from "./layout/Sidebar";
import { AllSubsPaymentDetails } from "../services/Apis";
import toast from "react-hot-toast";

const RegionOneSubsList = () => {
  const [data, setData] = useState([]);
  const [inputs, setInputs] = useState({
    name: "",
    count: "10",
  });

  const handleChange = (e) => {
    e.preventDefault();
    setInputs((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };
  console.log(inputs);
  const handleEdit = (e) => {};

  const subscriptionData = async () => {
    try {
      let response = await AllSubsPaymentDetails({
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      });
      if (response.success) {
        setData(response.data.data.filter((elem) => elem.status==="Approved" && elem.region_name === 1));
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("Error in getting accepted subscription lis");
    }
  };

  useEffect(() => {
    subscriptionData();
  }, []);

  return (
    <Sidebar>
      <div className="clear">
        <div className="section_heading">
          <h2 className="title_heading">CORS Subscription List</h2>
        </div>
        <div className="mb-4"></div>
        <div>
          <div className="box_header">
            <div style={{ padding: "5px 0px" }}>
              <i className="fa-regular fa-rectangle-list mx-3"></i>&nbsp; Total
              Region-1 Subscriptions: {data.length}
            </div>
          </div>
          <div>
            <div className="box_body">
              <form
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  width: "100%",
                  marginBottom: "10px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <label className="col-md-10">Records per page:</label>
                  <div className="col-md-8">
                    <select
                      className="form-select"
                      name="count"
                      onChange={handleChange}
                    >
                      <option value="10">10</option>
                      <option value="20">20</option>
                      <option value="50">50</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "row" }}>
                  <input
                    type="text"
                    name="name"
                    value={inputs.name}
                    onChange={handleChange}
                    placeholder="Search here ..."
                    style={{
                      borderRight: "none",
                      padding: "0px 10px",
                      outline: "none",
                    }}
                  />
                  <button style={{ borderLeft: "none" }}>
                    <i className="fa-solid fa-magnifying-glass"></i>
                  </button>
                </div>
              </form>
              <div className="table-div-admin">
                <table className="table table-bordered data_table">
                  <thead>
                    <tr>
                      <th>SNo</th>
                      <th>Ack. No</th>
                      <th>Reg. Date/Time</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Mobile No</th>
                      <th>Update By</th>
                      <th>Update</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.length > 0 ? (
                      data.map((elem, idx) => {
                        return (
                          <tr key={idx}>
                            <td>{idx + 1}</td>
                            <td>{elem.ack_no}</td>
                            <td>{elem.regDateTime}</td>
                            <td>{elem.name}</td>
                            <td>{elem.email}</td>
                            <td>{elem.mobile}</td>
                            <td>{elem.updated_by}</td>
                            <td>
                              <button
                                className="btn btn-warning"
                                onClick={() => handleEdit(idx)}
                              >
                                <i className="fa-solid fa-pen-to-square"></i>
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="8" className="text-center">
                          No data available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Sidebar>
  );
};

export default RegionOneSubsList;
