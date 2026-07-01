import { supabase } from '../lib/supabase'

// ===== CLIENTS =====
export const clientsApi = {
  getAll: async (userId) => {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },

  getById: async (id) => {
    const { data, error } = await supabase
      .from('clients')
      .select('*, tasks(*)')
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  },

  create: async (client) => {
    const { data, error } = await supabase
      .from('clients')
      .insert([client])
      .select()
      .single()
    if (error) throw error
    await logActivity(client.user_id, 'client', data.id, 'created', `Added client ${data.client_name}`)
    return data
  },

  update: async (id, updates, userId) => {
    const { data, error } = await supabase
      .from('clients')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    await logActivity(userId, 'client', id, 'updated', `Updated client ${data.client_name}`)
    return data
  },

  delete: async (id, userId, clientName) => {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id)
    if (error) throw error
    await logActivity(userId, 'client', id, 'deleted', `Deleted client ${clientName}`)
  },
}

// ===== TASKS =====
export const tasksApi = {
  getAll: async (userId) => {
    // Fetch tasks first
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw error

    // Fetch clients separately and attach
    const { data: clients } = await supabase
      .from('clients')
      .select('id, client_name, company_name')
      .eq('user_id', userId)

    return tasks.map((task) => ({
      ...task,
      clients: clients?.find((c) => c.id === task.client_id) || null,
    }))
  },

  getToday: async (userId) => {
    const today = new Date().toISOString().split('T')[0]
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('reminder_date', today)
      .neq('status', 'completed')
    if (error) throw error

    const { data: clients } = await supabase
      .from('clients')
      .select('id, client_name')
      .eq('user_id', userId)

    return tasks.map((task) => ({
      ...task,
      clients: clients?.find((c) => c.id === task.client_id) || null,
    }))
  },

  create: async (task) => {
    const { data, error } = await supabase
      .from('tasks')
      .insert([task])
      .select('*')
      .single()
    if (error) throw error

    // Fetch client name separately
    let clientData = null
    if (data.client_id) {
      const { data: client } = await supabase
        .from('clients')
        .select('id, client_name')
        .eq('id', data.client_id)
        .single()
      clientData = client
    }

    await logActivity(task.user_id, 'task', data.id, 'created', `Added task: ${data.title}`)
    return { ...data, clients: clientData }
  },

  update: async (id, updates, userId) => {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single()
    if (error) throw error

    // Fetch client name separately
    let clientData = null
    if (data.client_id) {
      const { data: client } = await supabase
        .from('clients')
        .select('id, client_name')
        .eq('id', data.client_id)
        .single()
      clientData = client
    }

    if (updates.status === 'completed') {
      await logActivity(userId, 'task', id, 'completed', `Completed task: ${data.title}`)
    } else {
      await logActivity(userId, 'task', id, 'updated', `Updated task: ${data.title}`)
    }
    return { ...data, clients: clientData }
  },

  delete: async (id, userId, title) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id)
    if (error) throw error
    await logActivity(userId, 'task', id, 'deleted', `Deleted task: ${title}`)
  },

  markNotified: async (id) => {
    await supabase.from('tasks').update({ is_notified: true }).eq('id', id)
  },
}

// ===== NOTIFICATIONS =====
export const notificationsApi = {
  getAll: async (userId) => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)
    if (error) throw error
    return data
  },

  create: async (notification) => {
    const { data, error } = await supabase
      .from('notifications')
      .insert([notification])
      .select()
      .single()
    if (error) throw error
    return data
  },

  markRead: async (id) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id)
  },

  markAllRead: async (userId) => {
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId)
  },
}

// ===== ACTIVITY LOG =====
export const logActivity = async (userId, entityType, entityId, action, description) => {
  try {
    await supabase.from('activity_logs').insert([{
      user_id: userId,
      entity_type: entityType,
      entity_id: entityId,
      action,
      description,
    }])
  } catch (e) {
    console.warn('Activity log failed:', e)
  }
}

export const getActivityLogs = async (userId) => {
  const { data, error } = await supabase
    .from('activity_logs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20)
  if (error) throw error
  return data
}

// ===== DASHBOARD STATS =====
export const getDashboardStats = async (userId) => {
  const [clients, tasks, logs] = await Promise.all([
    clientsApi.getAll(userId),
    tasksApi.getAll(userId),
    getActivityLogs(userId),
  ])

  const today = new Date().toISOString().split('T')[0]
  const stats = {
    totalClients: clients.length,
    totalProjects: clients.length,
    pendingProjects: clients.filter((c) => c.project_status === 'pending' || c.project_status === 'in_progress').length,
    completedProjects: clients.filter((c) => c.project_status === 'completed').length,
    todayTasks: tasks.filter((t) => t.reminder_date === today && t.status !== 'completed').length,
    upcomingDeadlines: clients.filter((c) => {
      if (!c.deadline_date) return false
      const dl = new Date(c.deadline_date)
      const now = new Date()
      const diff = (dl - now) / (1000 * 60 * 60 * 24)
      return diff >= 0 && diff <= 7 && c.project_status !== 'completed'
    }).length,
    clients,
    tasks,
    activityLogs: logs,
  }
  return stats
}