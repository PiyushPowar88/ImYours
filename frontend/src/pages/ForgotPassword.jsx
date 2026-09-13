import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

export default function ForgotPassword() {
  const { register, handleSubmit } = useForm();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async ({ email }) => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.post('/auth/forgot-password', { email });
      setMessage(data.message);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Forgot password</h1>
        <p className="text-gray-500 mb-6">We'll email you a reset link</p>

        {message && (
          <div className="bg-primary-50 text-primary-700 text-sm px-4 py-3 rounded-lg mb-4">{message}</div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input
            type="email"
            {...register('email', { required: true })}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            placeholder="john@example.com"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg transition"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          <Link to="/login" className="text-primary-600 font-medium">Back to login</Link>
        </p>
      </div>
    </div>
  );
}