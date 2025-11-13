import React from 'react'
import { useSelector } from 'react-redux'
import { useAuth } from '@/layouts/Root'
import Button from '@/components/atoms/Button'
import ApperIcon from '@/components/ApperIcon'
import { toast } from 'react-toastify'

const LogoutButton = () => {
  const { logout } = useAuth()
  const user = useSelector((state) => state.user.user)
  
  const handleLogout = async () => {
    try {
      await logout()
      toast.success('Logged out successfully')
    } catch (error) {
      toast.error('Logout failed')
      console.error('Logout error:', error)
    }
  }
  
  if (!user) return null
  
  return (
    <Button
      onClick={handleLogout}
      variant="ghost"
      size="sm"
      className="text-gray-600 hover:text-red-600"
      title="Logout"
    >
      <ApperIcon name="LogOut" className="h-4 w-4" />
      <span className="hidden sm:inline">Logout</span>
    </Button>
  )
}

export default LogoutButton