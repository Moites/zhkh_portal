// Только цифры из строки: "+7 (999) 123-45-67" -> "79991234567"
export function phoneDigits(value: string): string {
  return value.replace(/\D/g, '')
}

// Если стёрли только скобку, пробел или дефис (цифры не изменились), стираем ещё и последнюю цифру,
// иначе маска сама вернёт символ обратно и удаление "застрянет".
export function applyPhoneInput(prev: string, next: string): string {
  const deleting = next.length < prev.length
  if (deleting && phoneDigits(next) === phoneDigits(prev)) {
    return formatPhone(phoneDigits(next).slice(0, -1))
  }
  return formatPhone(next)
}

// Превращает ввод в красивый вид: +7 (999) 123-45-67
// Работает при каждом нажатии клавиши, поэтому понимает и "8999...", и "999...", и "+7999..."
export function formatPhone(raw: string): string {
  let d = phoneDigits(raw)
  if (!d) return ''

  if (d[0] === '8') d = '7' + d.slice(1)
  else if (d[0] !== '7') d = '7' + d
  d = d.slice(0, 11)

  const p = d.slice(1) // 10 цифр без кода страны
  let out = '+7'
  if (p.length > 0) out += ' (' + p.slice(0, 3)
  if (p.length >= 3) out += ')'
  if (p.length > 3) out += ' ' + p.slice(3, 6)
  if (p.length > 6) out += '-' + p.slice(6, 8)
  if (p.length > 8) out += '-' + p.slice(8, 10)
  return out
}

export function isPhoneComplete(value: string): boolean {
  return phoneDigits(value).length === 11
}