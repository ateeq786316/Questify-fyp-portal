import React, { useState, useEffect } from 'react';
import Navbar from "../../../components/Navbar";
import Sidebar from "../../../components/Sidebar.jsx";
import "../../../styles/Test.css";
import { FaUserGraduate, FaProjectDiagram, FaChalkboardTeacher, FaCalendarAlt, FaSearch } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";

const Test = () => {
    

    return (
        <div className="student-dashboard">
            <Navbar className="navbar" />
            <div className="dashboard-container d-flex">
                <Sidebar />
                {/* <div className="card text-center p-3">
                <h1 className='h1'>TESTING PAGE</h1>
                </div> */}
                
            </div>
        </div>
    );
};

export default Test;