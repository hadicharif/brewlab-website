import logoSvg from '../assets/logo.svg?raw'

// The official BREW LAB / COFFEE BEACON logo, taken from the brand guide.
// The lettering and line swirl use `currentColor`, so set `color` to recolour
// it (charcoal on white, white on charcoal). The circles stay peach.
export default function Logo({ className = '' }) {
  return (
    <span
      className={`logo-art ${className}`}
      role="img"
      aria-label="Brew Lab, Coffee Beacon"
      dangerouslySetInnerHTML={{ __html: logoSvg }}
    />
  )
}
