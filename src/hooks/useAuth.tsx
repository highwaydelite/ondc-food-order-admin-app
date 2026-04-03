import { useState, useEffect } from 'react'
import { userManager } from '../config'
import { jwtDecode } from 'jwt-decode'

interface ResourceAccess {
  [key: string]: {
    roles: string[]
  }
}

interface DecodedToken {
  resource_access: ResourceAccess
  name: string
  email: string
  preferred_username: string
  sub: string
}

interface UserDetailsProps {
  name: string
  email: string
  preferred_username: string
  token: string
  role: string[]
  sub: string
}

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [userDetails, setUserDetails] = useState<UserDetailsProps>({
    email: '',
    name: '',
    preferred_username: '',
    token: '',
    role: [],
    sub: '',
  })
  const [roles, setRoles] = useState<string[]>([])
  const clientId = import.meta.env.VITE_CLIENT_ID

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await userManager.getUser()
        if (user && !user.expired) {
          setIsAuthenticated(true)

          // Decode the access token to get roles
          const decodedToken = jwtDecode<DecodedToken>(user.access_token)
          setUserDetails({
            name: decodedToken.name,
            email: decodedToken.email,
            preferred_username: decodedToken.preferred_username,
            token: user.access_token,
            role: decodedToken.resource_access[clientId]?.roles.map((role: string) => role.toUpperCase()) || [],
            sub: decodedToken.sub.split(':')[2],
          })
          const userRoles = decodedToken.resource_access[clientId]?.roles || []
          setRoles(userRoles)
        } else {
          setIsAuthenticated(false)
          setRoles([])
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        setIsAuthenticated(false)
        setRoles([])
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()

    // Subscribe to user changes
    const handleUserLoaded = () => checkAuth()
    const handleUserUnloaded = () => {
      setIsAuthenticated(false)
      setRoles([])
    }

    userManager.events.addUserLoaded(handleUserLoaded)
    userManager.events.addUserUnloaded(handleUserUnloaded)

    return () => {
      userManager.events.removeUserLoaded(handleUserLoaded)
      userManager.events.removeUserUnloaded(handleUserUnloaded)
    }
  }, [clientId])

  const hasRole = (role: string) => roles.includes(role)

  return { isAuthenticated, isLoading, roles, hasRole, userDetails }
}
