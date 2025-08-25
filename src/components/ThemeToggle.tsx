import { Button } from '@/components/ui/button'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/components/theme-provider'

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()

  const next = resolvedTheme === 'dark' ? 'light' : 'dark'
  const label = resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label={label}
        onClick={() => setTheme(next)}
      >
        {resolvedTheme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
      </Button>
    </div>
  )
}


