import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const GroupRequest = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSendRequest = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await axios.post(
        'http://localhost:5000/api/student/group-request',
        { toEmail: email },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('studentToken')}` }
        }
      );

      if (response.data.success) {
        toast.success(response.data.msg);
        setEmail('');
      }
    } catch (err) {
      console.error('Error sending group request:', err);
      const errorMsg = err.response?.data?.msg || 'Failed to send group request';
      toast.error(errorMsg);
      setError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {/* Render your form here */}
    </div>
  );
};

export default GroupRequest; 