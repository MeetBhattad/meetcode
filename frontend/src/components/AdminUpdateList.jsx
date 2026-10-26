/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { NavLink } from "react-router";
import { Edit3, ArrowLeft } from "lucide-react";
import axiosClient from "../utils/axiosClient";

const AdminUpdateList = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const { data } = await axiosClient.get("/problem/getAllProblem");
        setProblems(data);
      } catch (err) {
        setError("Failed to load problems");
      } finally {
        setLoading(false);
      }
    };
    fetchProblems();
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen bg-base-200">
      <span className="loading loading-spinner loading-lg text-primary"></span>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
      <div className="alert alert-error max-w-md shadow-sm"><span>{error}</span></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-base-200 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <NavLink to="/admin" className="btn btn-sm btn-circle btn-ghost">
            <ArrowLeft size={18} />
          </NavLink>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Update Problems</h1>
            <p className="text-sm text-base-content/60">Select a problem to edit its details and test cases.</p>
          </div>
        </div>

        {/* Problems List */}
        <div className="grid gap-3">
          {problems.map((problem) => (
            <div 
              key={problem._id} 
              className="card bg-base-100 border border-base-300 shadow-sm hover:border-primary/50 transition-colors duration-200"
            >
              <div className="card-body p-4 flex-row items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`badge badge-sm ${
                    problem.difficulty === 'easy' ? 'badge-success' : 
                    problem.difficulty === 'medium' ? 'badge-warning' : 'badge-error'
                  }`}>
                    {problem.difficulty}
                  </div>
                  <div>
                    <h2 className="font-semibold text-base-content">{problem.title}</h2>
                    <p className="text-xs text-base-content/50 uppercase tracking-wide">{problem.tags}</p>
                  </div>
                </div>
                <NavLink 
                  to={`/admin/edit/${problem._id}`} 
                  className="btn btn-sm btn-outline btn-primary gap-2"
                >
                  <Edit3 size={14} /> Edit
                </NavLink>
              </div>
            </div>
          ))}
          {problems.length === 0 && (
            <div className="text-center py-20 text-base-content/50">
              No problems found. Create one first!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUpdateList;