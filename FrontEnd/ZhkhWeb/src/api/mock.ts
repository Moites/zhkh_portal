// ДЕМО-РЕЖИМ: притворяется сервером, пока настоящего API нет под рукой.
// Включается командой `npm run dev:mock`. На работу с настоящим API не влияет.
//
// Правила входа (пароль любой, кроме слова "wrong"):
//   телефон заканчивается на 1  -> житель с готовыми заявками (+7 900 000-00-01)
//   телефон заканчивается на 2  -> сотрудник-сантехник
//   телефон заканчивается на 3  -> администратор
//   любой другой                -> житель без заявок (чтобы посмотреть пустой список)
import type { RequestPriority, ServiceRequest, Specialization, User } from './types'

interface MockResponse {
  status: number
  body?: unknown
}

const REQUESTS_KEY = 'zhkh_mock_requests'
const DELAY_MS = 500
const DEMO_CITIZEN_ID = 'user-79000000001'

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// ---------- Пользователи ----------

// "+7 (900) 000-00-01" и "8 900 000 00 01" -> "79000000001"
function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  return digits.length === 11 && digits[0] === '8' ? `7${digits.slice(1)}` : digits
}

const DEMO_PHONES = ['79000000001', '79000000002', '79000000003']

function userFromPhone(rawPhone: string): User {
  const phone = normalizePhone(rawPhone)
  const last = phone.slice(-1)
  const base = { id: `user-${phone}`, middleName: null, dateOfBirth: null, phone }

  if (last === '2') {
    return { ...base, firstName: 'Пётр', lastName: 'Сидоров', role: 'worker', specialization: 'Plumber' }
  }
  if (last === '3') {
    return { ...base, firstName: 'Анна', lastName: 'Петрова', role: 'admin' }
  }
  return { ...base, firstName: 'Иван', lastName: 'Иванов', role: 'citizen' }
}

// Токен хранит самого пользователя, поэтому демо переживает перезагрузку страницы
function makeToken(user: User): string {
  return `mock.${btoa(encodeURIComponent(JSON.stringify(user)))}`
}

function userFromToken(token: string | null): User | null {
  if (!token?.startsWith('mock.')) return null
  try {
    return JSON.parse(decodeURIComponent(atob(token.slice(5)))) as User
  } catch {
    return null
  }
}

// ---------- Заявки ----------

function daysAgo(days: number, hours = 0): string {
  return new Date(Date.now() - (days * 24 + hours) * 3600 * 1000).toISOString()
}

function seedRequests(): ServiceRequest[] {
  const base = { authorId: DEMO_CITIZEN_ID, assignedWorkerId: null, doneAt: null, needsReview: false }
  return [
    {
      ...base,
      id: 'seed-1',
      createdAt: daysAgo(0, 2),
      title: 'Искрит розетка в спальне, пахнет гарью',
      description:
        'Сегодня утром при включении обогревателя из розетки в спальне пошли искры, появился запах горелой проводки. Обогреватель отключил, розеткой не пользуемся.',
      address: 'ул. Ленина, д. 5, кв. 12',
      status: 'Assigned',
      priority: 'Emergency',
      complexity: 'Medium',
      specialization: 'Electrician',
      assignedWorkerId: 'user-79000000002',
    },
    {
      ...base,
      id: 'seed-2',
      createdAt: daysAgo(1, 5),
      title: 'Течёт труба под раковиной на кухне',
      description:
        'Под раковиной вторые сутки течёт труба, вода собирается на полу. Подставили таз, но он наполняется за несколько часов. Соседи снизу пока не жаловались.',
      address: 'ул. Ленина, д. 5, кв. 12',
      status: 'InProgress',
      priority: 'High',
      complexity: 'Medium',
      specialization: 'Plumber',
      assignedWorkerId: 'user-79000000002',
    },
    {
      ...base,
      id: 'seed-3',
      createdAt: daysAgo(2),
      title: 'Не вывозят мусор во дворе уже неделю',
      description:
        'Контейнеры во дворе переполнены, мусор лежит вокруг баков, появились бродячие собаки и неприятный запах. Просим организовать вывоз и уборку.',
      address: 'ул. Ленина, д. 5, двор',
      status: 'New',
      priority: 'Low',
      complexity: 'Simple',
      specialization: 'General',
    },
    {
      ...base,
      id: 'seed-4',
      createdAt: daysAgo(3, 4),
      title: 'Странный шум и вибрация в стояке',
      description:
        'Ночью в трубах слышен громкий гул, по стояку идёт вибрация. Причина непонятна, возможно, связано с работой насоса в подвале дома.',
      address: 'ул. Ленина, д. 5, кв. 12',
      status: 'New',
      priority: 'Medium',
      complexity: 'Simple',
      specialization: 'General',
      needsReview: true,
    },
    {
      ...base,
      id: 'seed-5',
      createdAt: daysAgo(9),
      title: 'Сломался замок входной двери в подъезд',
      description:
        'Дверь подъезда не закрывается, замок болтается, ключ не проворачивается. Посторонние свободно заходят в дом, особенно беспокоит ночное время.',
      address: 'ул. Ленина, д. 5, подъезд 2',
      status: 'Completed',
      priority: 'Medium',
      complexity: 'Simple',
      specialization: 'Locksmith',
      assignedWorkerId: 'user-79000000002',
      doneAt: daysAgo(8, 3),
    },
    {
      ...base,
      id: 'seed-6',
      createdAt: daysAgo(14),
      title: 'Не горит свет на лестничной площадке 4 этажа',
      description:
        'На четвёртом этаже перегорела лампа, на площадке темно. Пожилым жильцам трудно ходить по лестнице в темноте, просим заменить лампу.',
      address: 'ул. Ленина, д. 5, подъезд 2',
      status: 'Rejected',
      priority: 'Low',
      complexity: 'Simple',
      specialization: 'Electrician',
      doneAt: daysAgo(13),
    },
  ]
}

function loadRequests(): ServiceRequest[] {
  try {
    const raw = localStorage.getItem(REQUESTS_KEY)
    if (raw) return JSON.parse(raw) as ServiceRequest[]
  } catch {
    /* повреждённые данные просто заменим на стартовые */
  }
  const seeded = seedRequests()
  saveRequests(seeded)
  return seeded
}

function saveRequests(list: ServiceRequest[]) {
  try {
    localStorage.setItem(REQUESTS_KEY, JSON.stringify(list))
  } catch {
    /* хранилище недоступно: демо продолжит работать до перезагрузки */
  }
}

// ---------- "Модель": очень простой подбор по ключевым словам ----------

const SPEC_WORDS: Record<Exclude<Specialization, 'General'>, string[]> = {
  Plumber: ['труб', 'кран', 'вод', 'течёт', 'течет', 'засор', 'канализ', 'батаре', 'протеч', 'залив', 'затоп', 'унитаз'],
  Electrician: ['свет', 'розет', 'электр', 'лампоч', 'искр', 'щиток', 'проводк', 'лифт'],
  Locksmith: ['замок', 'замк', 'ключ', 'двер'],
  Carpenter: [],
  Painter: [],
  Cleaner: [],
  Janitor: [],
  Roofer: ['крыш', 'кровл'],
}
const GENERAL_WORDS = ['мусор', 'двор', 'подъезд', 'уборк', 'шум']
const EMERGENCY_WORDS = ['искр', 'дым', 'газ', 'затоп', 'прорвал', 'хлещ', 'пожар']
const HIGH_WORDS = ['срочно', 'залив', 'протеч', 'течёт', 'течет']

function classify(text: string): Pick<ServiceRequest, 'specialization' | 'priority' | 'complexity' | 'needsReview'> {
  const t = text.toLowerCase()
  let specialization: Specialization | null = null
  for (const [spec, words] of Object.entries(SPEC_WORDS) as [Specialization, string[]][]) {
    if (words.some((w) => t.includes(w))) {
      specialization = spec
      break
    }
  }
  if (!specialization && GENERAL_WORDS.some((w) => t.includes(w))) specialization = 'General'

  // Ничего знакомого: как и настоящая система, отдаём диспетчеру
  if (!specialization) {
    return { specialization: 'General', priority: 'Medium', complexity: 'Simple', needsReview: true }
  }

  let priority: RequestPriority = 'Medium'
  if (EMERGENCY_WORDS.some((w) => t.includes(w))) priority = 'Emergency'
  else if (HIGH_WORDS.some((w) => t.includes(w))) priority = 'High'

  const complexity = t.length > 300 ? 'Complex' : t.length > 150 ? 'Medium' : 'Simple'
  return { specialization, priority, complexity, needsReview: false }
}

// ---------- Обработчик запросов ----------

const bad = (error: string): MockResponse => ({ status: 400, body: { error } })

export async function mockHandler(
  method: string,
  path: string,
  body: unknown,
  token: string | null,
): Promise<MockResponse> {
  await sleep(DELAY_MS)
  const data = (body ?? {}) as Record<string, unknown>
  const user = userFromToken(token)

  // --- вход ---
  if (method === 'POST' && path === '/api/auth/login') {
    if (data.password === 'wrong') return { status: 401, body: { error: 'Неверный номер или пароль' } }
    const u = userFromPhone(String(data.phone ?? ''))
    return { status: 200, body: { token: makeToken(u), user: u } }
  }

  // --- регистрация ---
  if (method === 'POST' && path === '/api/auth/register') {
    const phone = normalizePhone(String(data.phone ?? ''))
    if (DEMO_PHONES.includes(phone)) {
      return { status: 400, body: { errors: [`Username '${phone}' is already taken.`] } }
    }
    const u: User = {
      id: `user-${phone}`,
      firstName: String(data.firstName ?? ''),
      lastName: String(data.lastName ?? ''),
      middleName: (data.middleName as string | null) ?? null,
      dateOfBirth: (data.dateOfBirth as string | null) ?? null,
      phone,
      role: 'citizen',
    }
    return { status: 200, body: { token: makeToken(u), user: u } }
  }

  // --- всё остальное только для вошедших ---
  if (!user) return { status: 401 }

  if (method === 'GET' && path === '/api/auth/me') return { status: 200, body: user }

  if (method === 'GET' && path === '/api/request/get_requests') {
    // Демо-житель видит готовые заявки, остальные только свои новые
    const mine = loadRequests().filter((r) => r.authorId === user.id)
    return { status: 200, body: mine }
  }

  if (method === 'POST' && path === '/api/request/create_request') {
    const title = String(data.title ?? '').trim()
    const description = String(data.description ?? '').trim()
    const address = String(data.address ?? '').trim()
    // Те же проверки и тексты, что в настоящем RequestController
    if (title.length < 10 || title.length > 150) return bad('Заголовок должен содержать от 10 до 150 символов')
    if (description.length < 50 || description.length > 800)
      return bad('Описание должно содержать от 50 до 800 символов')
    if (address.length < 10 || address.length > 200) return bad('Адрес должен содержать от 10 до 200 символов')

    const created: ServiceRequest = {
      id: `req-${Date.now()}`,
      createdAt: new Date().toISOString(),
      doneAt: null,
      title,
      description,
      address,
      status: 'New',
      authorId: user.id,
      assignedWorkerId: null,
      ...classify(`${title}. ${description}`),
    }
    saveRequests([created, ...loadRequests()])
    return { status: 200, body: created }
  }

  return { status: 404 }
}
