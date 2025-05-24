import { useState, useEffect } from 'react';
import { userService } from '../../services/api';
import Loader from '../shared/Loader';
import { toast } from 'react-toastify';
import './AdminStyles.css';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [newRole, setNewRole] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getAllUsers();
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const openRoleModal = (user) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setShowRoleModal(true);
  };

  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleRoleChange = async () => {
    try {
      setLoading(true);
      await userService.updateUserRole(selectedUser._id, newRole);
      toast.success(`User role updated to ${newRole}`);
      setShowRoleModal(false);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    try {
      setLoading(true);
      await userService.deleteUser(selectedUser._id);
      toast.success('User deleted successfully');
      setShowDeleteModal(false);
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  if (loading && users.length === 0) return <Loader />;

  return (
    <div className="admin-container">
      <h1>User Management</h1>
      
      {users.length === 0 ? (
        <div className="no-data">No users found.</div>
      ) : (
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`role-badge ${user.role}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="actions">
                    <button 
                      onClick={() => openRoleModal(user)}
                      className="action-btn edit"
                    >
                      Change Role
                    </button>
                    <button 
                      onClick={() => openDeleteModal(user)}
                      className="action-btn delete"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Role Update Modal */}
      {showRoleModal && selectedUser && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Update User Role</h2>
            <p>
              Change role for <strong>{selectedUser.name}</strong>
            </p>
            
            <div className="form-group">
              <label htmlFor="role">Select Role</label>
              <select
                id="role"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
              >
                <option value="user">User</option>
                <option value="organizer">Organizer</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            
            <div className="modal-actions">
              <button 
                onClick={handleRoleChange}
                className="action-btn save"
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update Role'}
              </button>
              <button 
                onClick={() => setShowRoleModal(false)}
                className="action-btn cancel"
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedUser && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Confirm Deletion</h2>
            <p>
              Are you sure you want to delete the user <strong>{selectedUser.name}</strong>?
              This action cannot be undone.
            </p>
            
            <div className="modal-actions">
              <button 
                onClick={handleDeleteUser}
                className="action-btn delete"
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Delete User'}
              </button>
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="action-btn cancel"
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;
