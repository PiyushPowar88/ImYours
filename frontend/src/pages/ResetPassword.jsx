import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async ({ password }) => {
    setServerError('');
    setLoading(true);
    try {
      await axiosInstance.post('/auth/reset-password', { token, password });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setServerError(err.response?.data?.message || 'Reset failed. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <p className="text-gray-600">Invalid reset link. <Link to="/forgot-password" className="text-primary-600">Request a new one</Link></p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Reset password</h1>
        <p className="text-gray-500 mb-6">Choose a new password</p>

        {serverError && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">{serverError}</div>}
        {success && <div className="bg-green-50 text-green-700 text-sm px-4 py-3 rounded-lg mb-4">Password reset! Redirecting to login...</div>}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input
            type="password"
            {...register('password', { required: true, minLength: 6 })}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            placeholder="New password"
          />
          {errors.password && <p className="text-red-500 text-xs">Minimum 6 characters</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg transition"
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
}