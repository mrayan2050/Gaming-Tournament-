import api from './api';

export const getDashboardStats = () => api.get('/admin/stats').then(r => r.data);

export const adminListTournaments = () => api.get('/admin/tournaments').then(r => r.data);
export const createTournament = (payload) => api.post('/admin/tournaments', payload).then(r => r.data);
export const updateTournament = (id, payload) => api.put(`/admin/tournaments/${id}`, payload).then(r => r.data);
export const deleteTournament = (id) => api.delete(`/admin/tournaments/${id}`).then(r => r.data);

export const getTournamentRegistrations = (id) => api.get(`/admin/tournaments/${id}/registrations`).then(r => r.data);
export const submitResults = (id, results) => api.post(`/admin/tournaments/${id}/results`, { results }).then(r => r.data);

export const listWithdrawals = (status) => api.get('/admin/withdrawals', { params: status ? { status } : {} }).then(r => r.data);
export const processWithdrawal = (id, action, remarks) => api.post(`/admin/withdrawals/${id}/process`, { action, remarks }).then(r => r.data);
