import { Route, Routes } from 'react-router-dom'
import { GuestOnly, RequireRole } from './auth/RouteGuards'
import { Layout } from './components/Layout'
import { ComingSoon } from './pages/ComingSoon'
import { Forbidden } from './pages/Forbidden'
import { Home } from './pages/Home'
import { Login } from './pages/Login'
import { MyRequests } from './pages/MyRequests'
import { NewRequest } from './pages/NewRequest'
import { NotFound } from './pages/NotFound'
import { Register } from './pages/Register'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />

        {/* Только для тех, кто НЕ вошёл */}
        <Route element={<GuestOnly />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Житель */}
        <Route element={<RequireRole roles={['citizen']} />}>
          <Route path="/requests" element={<MyRequests />} />
          <Route path="/requests/new" element={<NewRequest />} />
        </Route>

        {/* Сотрудник */}
        <Route element={<RequireRole roles={['worker']} />}>
          <Route path="/tasks" element={<ComingSoon title="Мои задачи" />} />
          <Route path="/tasks/free" element={<ComingSoon title="Свободные заявки" />} />
        </Route>

        {/* Администратор */}
        <Route element={<RequireRole roles={['admin']} />}>
          <Route path="/admin/requests" element={<ComingSoon title="Все заявки" />} />
          <Route path="/admin/review" element={<ComingSoon title="Очередь проверки" />} />
          <Route path="/admin/workers" element={<ComingSoon title="Сотрудники" />} />
        </Route>

        <Route path="/forbidden" element={<Forbidden />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}