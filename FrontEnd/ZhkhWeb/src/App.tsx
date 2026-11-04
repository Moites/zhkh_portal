import { Route, Routes } from 'react-router-dom'
import { GuestOnly, RequireRole } from './auth/RouteGuards'
import { Layout } from './components/Layout'
import { AdminRequests } from './pages/AdminRequests'
import { AdminReview } from './pages/AdminReview'
import { AdminWorkers } from './pages/AdminWorkers'
import { Forbidden } from './pages/Forbidden'
import { FreeTasks } from './pages/FreeTasks'
import { Home } from './pages/Home'
import { Login } from './pages/Login'
import { MyRequests } from './pages/MyRequests'
import { NewRequest } from './pages/NewRequest'
import { NotFound } from './pages/NotFound'
import { Register } from './pages/Register'
import { WorkerTasks } from './pages/WorkerTasks'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />

        <Route element={<GuestOnly />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        <Route element={<RequireRole roles={['citizen']} />}>
          <Route path="/requests" element={<MyRequests />} />
          <Route path="/requests/new" element={<NewRequest />} />
        </Route>

        <Route element={<RequireRole roles={['worker']} />}>
          <Route path="/tasks" element={<WorkerTasks />} />
          <Route path="/tasks/free" element={<FreeTasks />} />
        </Route>

        <Route element={<RequireRole roles={['admin']} />}>
          <Route path="/admin/requests" element={<AdminRequests />} />
          <Route path="/admin/review" element={<AdminReview />} />
          <Route path="/admin/workers" element={<AdminWorkers />} />
        </Route>

        <Route path="/forbidden" element={<Forbidden />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}