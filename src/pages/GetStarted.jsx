import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';

const GetStarted = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const token = localStorage.getItem('campusconnect-token');
        // ToDo: check token validity after 24 hours
        if (!token) {
            localStorage.clear();
            navigate('/login');
        }
        setLoading(false);
    }, []);

    return (
        <div className="bg-green-300 py-32">
            <h1>Get Started</h1>
            <p>Join the community of over 10,000 active students.</p>
        </div>
    );
};

export default GetStarted;