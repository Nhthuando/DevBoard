import React from 'react'
import { Link as RouterLink } from 'react-router-dom'

const NextLink = React.forwardRef(function NextLink({ href = '#', children, ...props }, ref) {
  const value = typeof href === 'string' ? href : href?.pathname || '#'
  const isRouterPath = typeof value === 'string' && (value.startsWith('/') || value.startsWith('./') || value.startsWith('../'))

  if (isRouterPath) {
    return (
      <RouterLink ref={ref} to={value} {...props}>
        {children}
      </RouterLink>
    )
  }

  return (
    <a ref={ref} href={value} {...props}>
      {children}
    </a>
  )
})

export default NextLink
