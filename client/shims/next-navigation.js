import { useNavigate } from 'react-router-dom'

export function useRouter() {
  const navigate = useNavigate()

  return {
    push: (to) => navigate(to),
    replace: (to) => navigate(to, { replace: true }),
    back: () => navigate(-1),
    forward: () => navigate(1),
    refresh: () => window.location.reload(),
  }
}
