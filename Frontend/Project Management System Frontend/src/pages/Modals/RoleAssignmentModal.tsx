import React, { useState } from 'react';
import axios from 'axios';

interface RoleAssignmentModalProps {
  projectId: string;
  closeModal: () => void;
}

const RoleAssignmentModal: React.FC<RoleAssignmentModalProps> = ({ projectId, closeModal }) => {
  const [userId, setUserId] = useState('');
  const [role, setRole] = useState('');

  const handleAssignRole = async () => {
    try {
      const response = await axios.post(
        `/api/projects/${projectId}/roles`,
        { userId, role }
      );
      console.log(response.data);
      closeModal();
    } catch (error) {
      console.error('Error assigning role', error);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Assign Role</h2>
        <label>User ID</label>
        <input
          type="text"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />
        <label>Role</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="Admin">Admin</option>
          <option value="Member">Member</option>
          <option value="Viewer">Viewer</option>
        </select>
        <button onClick={handleAssignRole}>Assign Role</button>
        <button onClick={closeModal}>Close</button>
      </div>
    </div>
  );
};

export default RoleAssignmentModal;
