'use client';

import { useState, useEffect } from 'react';

interface UserLog {
  id: string;
  user_id: string | null;
  action: string;
  resource: string | null;
  ip_address: string | null;
  user_agent: string | null;
  details: any;
  created_at: string;
}

export default function UserLogsManagement({ initialLogs }: { initialLogs?: UserLog[] }) {
  const [logs, setLogs] = useState<UserLog[]>(initialLogs || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<UserLog | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Debug: Log what we receive
  console.log('🔍 UserLogsManagement - initialLogs:', initialLogs);
  console.log('🔍 UserLogsManagement - initialLogs type:', typeof initialLogs);
  console.log('🔍 UserLogsManagement - initialLogs isArray:', Array.isArray(initialLogs));
  console.log('🔍 UserLogsManagement - logs state:', logs);
  console.log('🔍 UserLogsManagement - logs isArray:', Array.isArray(logs));

  // Fetch data only if no initial data provided
  useEffect(() => {
    if (!initialLogs || initialLogs.length === 0) {
      fetchLogs();
    }
  }, [initialLogs]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/user-logs', {
        credentials: 'include'
      });
      const data = await response.json();
      
      console.log('🔍 UserLogsManagement - fetchLogs response:', data);
      console.log('🔍 UserLogsManagement - fetchLogs data.logs:', data.logs);
      console.log('🔍 UserLogsManagement - fetchLogs isArray:', Array.isArray(data.logs));
      
      if (response.ok) {
        // Handle both direct array and nested object formats
        const logsArray = Array.isArray(data) ? data : (data.logs || []);
        console.log('🔍 UserLogsManagement - Setting logs to:', logsArray);
        setLogs(logsArray);
      } else {
        setError(data.error || 'Failed to fetch user logs');
        setLogs([]); // Ensure logs is always an array
      }
    } catch (error) {
      console.error('Error fetching user logs:', error);
      setError('Failed to fetch user logs');
      setLogs([]); // Ensure logs is always an array
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'login':
        return 'bg-green-100 text-green-800';
      case 'logout':
        return 'bg-red-100 text-red-800';
      case 'create':
        return 'bg-blue-100 text-blue-800';
      case 'update':
        return 'bg-yellow-100 text-yellow-800';
      case 'delete':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewDetails = (log: UserLog) => {
    setSelectedLog(log);
    setShowDetailsModal(true);
  };

  const closeModal = () => {
    setSelectedLog(null);
    setShowDetailsModal(false);
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">User Logs</h3>
          <button
            onClick={fetchLogs}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
          >
            Refresh
          </button>
        </div>
      </div>
      
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}
      
      {error && (
        <div className="px-6 py-4 bg-red-50 border-b border-red-200">
          <p className="text-red-600">{error}</p>
        </div>
      )}
      
      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resource</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Array.isArray(logs) && logs.map((log) => (
                <tr key={log.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(log.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {log.user_id || 'System'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 text-xs rounded-full ${getActionColor(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {log.resource || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {log.ip_address || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {log.details ? (
                      <button
                        className="text-blue-600 hover:text-blue-800 underline font-medium"
                        onClick={() => handleViewDetails(log)}
                      >
                        View Details
                      </button>
                    ) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {logs.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">Nu sunt loguri</p>
            </div>
          )}
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedLog && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Log Details</h3>
              <button
                onClick={closeModal}
                className="bg-white rounded-md p-2 text-gray-400 hover:text-gray-500"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-semibold text-gray-700">Action:</span>
                  <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getActionColor(selectedLog.action)}`}>
                    {selectedLog.action}
                  </span>
                </div>
                
                <div>
                  <span className="font-semibold text-gray-700">User ID:</span>
                  <span className="ml-2 text-gray-900">{selectedLog.user_id || 'System'}</span>
                </div>
                
                <div>
                  <span className="font-semibold text-gray-700">Resource:</span>
                  <span className="ml-2 text-gray-900">{selectedLog.resource || '-'}</span>
                </div>
                
                <div>
                  <span className="font-semibold text-gray-700">IP Address:</span>
                  <span className="ml-2 text-gray-900">{selectedLog.ip_address || '-'}</span>
                </div>
              </div>
              
              <div>
                <span className="font-semibold text-gray-700">Timestamp:</span>
                <span className="ml-2 text-gray-900">{formatDate(selectedLog.created_at)}</span>
              </div>
              
              {selectedLog.details && (
                <div>
                  <span className="font-semibold text-gray-700 block mb-2">Details:</span>
                  <div className="p-4 bg-gray-100 rounded-md max-h-96 overflow-y-auto">
                    <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                      {JSON.stringify(selectedLog.details, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-end mt-4">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
