import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { Navigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './Page Styles/Dashoard.css';
import { useDispatch } from 'react-redux';
import { openModal } from '../store/modal/modalSlice';
import ProjectFormModal from './Modals/ProjectFormModal';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user, accessToken } = useSelector((state) => state.auth);
  const isAuthenticated = !!accessToken && !!user;

  const [adminProjects, setAdminProjects] = useState([]);
  const [memberProjects, setMemberProjects] = useState([]);
  const [viewerProjects, setViewerProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/projects', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        const data = await response.json();
        setAdminProjects(data.adminProjects || []);
        setMemberProjects(data.memberProjects || []);
        setViewerProjects(data.viewerProjects || []);
      } catch (error) {
        console.error('Failed to fetch projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [accessToken]);

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const openProjectFormModal = () => {
    dispatch(openModal('project-form'));
    console.log('Project form modal opened');
  };

  return (
    <div>
      <Navbar />
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>{user?.username}'s Dashboard</h1>
        </div>

        {/* Dashboard Stats */}
        <div className="dashboard-stats">
          <div className="stat-card">
            <h3>Active Projects</h3>
            <p className="stat-number">{adminProjects.length + memberProjects.length}</p>
          </div>
          <div className="stat-card">
            <h3>Tasks Due Today</h3>
            <p className="stat-number">0</p> {/* Replace with real data if available */}
          </div>
          <div className="stat-card">
            <h3>Team Members</h3>
            <p className="stat-number">1</p> {/* Replace with real data if available */}
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="dashboard-content">
          {loading ? (
            <p>Loading projects...</p>
          ) : (
            <>
              {/* Admin Projects */}
              <section className="project-section">
                <h2>Projects You Manage (Admin)</h2>
                {adminProjects.length ? (
                  <ul>
                    {adminProjects.map((project) => (
                      <li key={project.id}>
                        <h3>{project.title}</h3>
                        <p>{project.description}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No projects available for Admin.</p>
                )}
              </section>

              {/* Member Projects */}
              <section className="project-section">
                <h2>Projects You Contribute To (Member)</h2>
                {memberProjects.length ? (
                  <ul>
                    {memberProjects.map((project) => (
                      <li key={project.id}>
                        <h3>{project.title}</h3>
                        <p>{project.description}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No projects available for Members.</p>
                )}
              </section>

              {/* Viewer Projects */}
              <section className="project-section">
                <h2>Projects You Can View (Viewer)</h2>
                {viewerProjects.length ? (
                  <ul>
                    {viewerProjects.map((project) => (
                      <li key={project.id}>
                        <h3>{project.title}</h3>
                        <p>{project.description}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No projects available for Viewers.</p>
                )}
              </section>

              {/* Recent Projects */}
              <section className="recent-projects">
                <h2>Recent Projects</h2>
                <div className="project-list">
                  {adminProjects.length || memberProjects.length || viewerProjects.length ? (
                    <ul>
                      {[...adminProjects.slice(0, 3), ...memberProjects.slice(0, 3), ...viewerProjects.slice(0, 3)].map(
                        (project) => (
                          <li key={project.id}>
                            <h3>{project.title}</h3>
                          </li>
                        )
                      )}
                    </ul>
                  ) : (
                    <p>No projects yet. Click "Create Project" to get started!</p>
                  )}
                </div>
                <button className="create-project-btn" onClick={openProjectFormModal}>Create New Project</button>
              </section>

              {/* Quick Actions */}
              <section className="quick-actions">
                <h2>Quick Actions</h2>
                <div className="action-buttons">
                  <button>Create Task</button>
                  <button>Schedule Meeting</button>
                  <button>View Calendar</button>
                </div>
              </section>
            </>
          )}
        </div>
      </div>
      <ProjectFormModal />
    </div>
  );
};

export default Dashboard;
