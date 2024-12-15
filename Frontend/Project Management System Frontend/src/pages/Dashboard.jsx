import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Navigate, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./Page Styles/Dashoard.css";

import { openModal } from "../store/modal/modalSlice";
import ProjectFormModal from "./Modals/ProjectFormModal";
import { getProjectById, getAllProjects } from "../store/project/projectSlice";
import { getUserRoles } from "../store/projectRole/projectRoleSlice";
import { selectTaskCountByAssignee } from "../store/projectRole/projectRoleSlice";

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user, accessToken } = useSelector((state) => state.auth);
  const isAuthenticated = !!accessToken && !!user;
  const navigate = useNavigate();

  const [adminProjects, setAdminProjects] = useState([]);
  const [memberProjects, setMemberProjects] = useState([]);
  const [viewerProjects, setViewerProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProjects, setFilteredProjects] = useState([]);
  //const [taskCount, setTaskCount] = useState(0)

  const [projectsToShowAdmin, setProjectsToShowAdmin] = useState(5);
  const [projectsToShowMember, setProjectsToShowMember] = useState(5);
  const [projectsToShowViewer, setProjectsToShowViewer] = useState(5);
 const taskCount = useSelector((state) => selectTaskCountByAssignee(state, user?.id))
  //const completedTasks = useSelector((state) => state.tasks.completedTasks);
  const completedTasks = useSelector((state) =>
    state.projectRole.tasks.filter((task) => task.assignee === user.id && task.status === "completed")
  );
  
  useEffect(() => {
    const fetchProjectsData = async () => {
      if (!user || !user.id) {
        console.log("User doesn't exist or user ID is missing.");
        return;
      }

      setLoading(true);
      try {
        // Fetch user roles
        const rolesResult = await dispatch(getUserRoles(user.id)).unwrap();
        console.log("Roles:", rolesResult);

        const projectPromises = rolesResult.map(
          async ({ project_id, project, role }) => {
            try {
              const projectId = parseInt(project_id, 10);
              if (isNaN(projectId)) {
                console.error(`Invalid project ID: ${project_id}`);
                return null;
              }

              const projectData = await dispatch(
                getProjectById(projectId)
              ).unwrap();
              return { ...projectData, role };
            } catch (error) {
              console.error(
                `Failed to fetch project with ID ${project_id}:`,
                error
              );
              return null;
            }
          }
        );

        const projectsData = (await Promise.all(projectPromises)).filter(
          Boolean
        );

        const admin = projectsData.filter(
          (project) => project.role === "Admin"
        );
        const member = projectsData.filter(
          (project) => project.role === "Member"
        );
        const viewer = projectsData.filter(
          (project) => project.role === "Viewer"
        );

        setAdminProjects(admin);
        setMemberProjects(member);
        setViewerProjects(viewer);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectsData();
  }, [dispatch, user]);

  useEffect(() => {
    // Filter projects based on the search query
    const allProjects = [
      ...adminProjects,
      ...memberProjects,
      ...viewerProjects,
    ];

    if (searchQuery) {
      const filtered = allProjects.filter((project) =>
        project.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProjects(filtered);
    } else {
      setFilteredProjects(allProjects);
    }
  }, [searchQuery, adminProjects, memberProjects, viewerProjects]);

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const openProjectFormModal = () => {
    dispatch(openModal("project-form"));
    console.log("Project form modal opened");
  };

  // Handle the "See More" button click for each category
  const handleSeeMoreAdmin = () => {
    setProjectsToShowAdmin((prev) => prev + 5); // Load 5 more admin projects
  };

  const handleSeeMoreMember = () => {
    setProjectsToShowMember((prev) => prev + 5); // Load 5 more member projects
  };

  const handleSeeMoreViewer = () => {
    setProjectsToShowViewer((prev) => prev + 5); // Load 5 more viewer projects
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
            <p className="stat-number">
              {adminProjects.length + memberProjects.length}
            </p>
          </div>
          <div className="stat-card">
            <h3>Tasks Assigned to You</h3>
            <p className="stat-number">{taskCount||0}</p>
          </div>
          <div className="stat-card">
            <h3>Completed Tasks</h3>
            <p className="stat-number">{completedTasks.length}</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search for projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && filteredProjects.length > 0 && (
            <ul className="search-suggestions">
              {filteredProjects.slice(0, 5).map((project) => (
                <li key={project.id}>
                  <Link to={`/projects/${project.id}`}>
                    <h3>{project.title}</h3>
                  </Link>
                </li>
              ))}
            </ul>
          )}
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
                  <ul className="adminProject-list">
                    {adminProjects
                      .slice(0, projectsToShowAdmin)
                      .reverse()
                      .map((project) => (
                        <li key={project.id}>
                          <Link to={`/projects/${project.id}`}>
                            <h3>{project.title}</h3>
                          </Link>
                        </li>
                      ))}
                  </ul>
                ) : (
                  <p>No projects available for Admin.</p>
                )}
                {adminProjects.length > projectsToShowAdmin && (
                  <button onClick={handleSeeMoreAdmin} className="see-more-btn">
                    See More
                  </button>
                )}
              </section>

              {/* Member Projects */}
              <section className="project-section">
                <h2>Projects You Contribute To (Member)</h2>
                {memberProjects.length ? (
                  <ul className="memberProjects-list">
                    {memberProjects
                      .slice(0, projectsToShowMember)
                      .reverse()
                      .map((project) => (
                        <li key={project.id}>
                          <Link to={`/projects/${project.id}`}>
                            <h3>{project.title}</h3>
                          </Link>
                        </li>
                      ))}
                  </ul>
                ) : (
                  <p>No projects available for Members.</p>
                )}
                {memberProjects.length > projectsToShowMember && (
                  <button
                    onClick={handleSeeMoreMember}
                    className="see-more-btn"
                  >
                    See More
                  </button>
                )}
              </section>

              {/* Viewer Projects */}
              <section className="project-section">
                <h2>Projects You Can View (Viewer)</h2>
                {viewerProjects.length ? (
                  <ul className="viewerProject-list">
                    {viewerProjects
                      .slice(0, projectsToShowViewer)
                      .reverse()
                      .map((project) => (
                        <li key={project.id}>
                          <Link to={`/projects/${project.id}`}>
                            <h3>{project.title}</h3>
                          </Link>
                        </li>
                      ))}
                  </ul>
                ) : (
                  <p>No projects available for Viewers.</p>
                )}
                {viewerProjects.length > projectsToShowViewer && (
                  <button
                    onClick={handleSeeMoreViewer}
                    className="see-more-btn"
                  >
                    See More
                  </button>
                )}
              </section>

              {/* Recent Projects */}
              {/* Recent Projects */}
              <section className="recent-projects">
                <h2>Recent Projects</h2>
                <div className="project-list">
                  {adminProjects.length ||
                  memberProjects.length ||
                  viewerProjects.length ? (
                    <ul className="recentProjects-list">
                     
                      {[...adminProjects, ...memberProjects, ...viewerProjects]
                        .reverse()
                        .slice(0, 3)
                        .map((project) => (
                          <li key={project.id}>
                            <Link to={`/projects/${project.id}`}>
                              <h3>{project.title}</h3>
                            </Link>
                          </li>
                        ))}
                    </ul>
                  ) : (
                    <p>
                      No projects yet. Click "Create Project" to get started!
                    </p>
                  )}
                </div>
                <button
                  className="create-project-btn"
                  onClick={openProjectFormModal}
                >
                  Create New Project
                </button>
              </section>

              {/* Quick Actions */}
              {/* <section className="quick-actions">
                <h2>Quick Actions</h2>
                <div className="action-buttons">
                  <button>Schedule Meeting</button>
                  <button>View Calendar</button>
                </div>
              </section> */}
            </>
          )}
        </div>
      </div>
      <ProjectFormModal />
    </div>
  );
};

export default Dashboard;
