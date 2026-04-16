import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function RegisterForm() {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [message, setMessage] = useState('');

    const handleRegister = (e) => {
        e.preventDefault();
        if (!email || !username || !password || !confirm) {
            setMessage('Semua field wajib diisi.');
            return;
        }
        if (password !== confirm) {
            setMessage('Password dan Konfirmasi Password tidak sama.');
            return;
        }
        setMessage('Registrasi berhasil!');
        // Implement registration logic here
    };

    return (
        <div className="w-full p-8">
            <h2 className="text-2xl font-semibold text-center text-green-800 mb-6">Register</h2>
            {message && (
                <div className="mb-4 text-center text-red-600 font-medium">{message}</div>
            )}
            <form onSubmit={handleRegister}>
                <div className="mb-4">
                    <input
                        type="email"
                        placeholder="Email"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-700"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Username"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-700"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div className="mb-4">
                    <input
                        type="password"
                        placeholder="Password"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-700"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                    />
                </div>
                <div className="mb-4">
                    <input
                        type="password"
                        placeholder="Confirm Password"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-700"
                        value={confirm}
                        onChange={e => setConfirm(e.target.value)}
                        required
                    />
                </div>
                <div className='mb-2'>
                    <p className='text-gray-700'>Already have an account? Login <Link to="/" className='text-green-800 underline'>here</Link></p>
                </div>
                <button
                    type="submit"
                    className="w-full bg-green-800 text-white py-2 rounded-md hover:bg-green-900"
                >
                    Register
                </button>
            </form>
        </div>
    );
}

export default RegisterForm;