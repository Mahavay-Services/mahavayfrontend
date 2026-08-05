import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useAuth } from '../../context/AuthContext'
import { authService } from '../../api/services'
import PageHeader from '../../components/ui/PageHeader'
import { User, Mail, Phone, Building, Calendar, MapPin, Shield, Lock } from 'lucide-react'
import { ROLE_LABELS } from '../../constants'
import toast from 'react-hot-toast'

const passwordSchema = yup.object({
  currentPassword: yup.string().required('Current password is required'),
  newPassword: yup.string().required('New password is required').min(8, 'Minimum 8 characters'),
  confirmPassword: yup.string().required('Confirm password').oneOf([yup.ref('newPassword')], 'Passwords must match')
})

const UserProfile = () => {
  const { user } = useAuth()
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(passwordSchema)
  })

  const onChangePassword = async (data) => {
    setSubmitting(true)
    try {
      await authService.changePassword(data)
      toast.success('Password changed successfully')
      setShowPasswordForm(false)
      reset()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password')
    } finally {
      setSubmitting(false)
    }
  }

  const InfoItem = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-3 p-4 bg-secondary-50 rounded-lg">
      <Icon className="w-5 h-5 text-secondary-400 mt-0.5" />
      <div>
        <p className="text-xs text-secondary-500">{label}</p>
        <p className="font-medium text-secondary-900">{value || '-'}</p>
      </div>
    </div>
  )

  return (
    <div>
      <PageHeader
        title="My Profile"
        subtitle="View and manage your account information"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Profile' }
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <div className="card-header">
              <h3 className="font-semibold">Personal Information</h3>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem icon={User} label="Full Name" value={user?.full_name} />
                <InfoItem icon={Mail} label="Email" value={user?.email} />
                <InfoItem icon={Phone} label="Phone" value={user?.phone} />
                <InfoItem icon={Phone} label="Emergency Contact" value={user?.emergency_contact} />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="font-semibold">Professional Information</h3>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem icon={Shield} label="Role" value={ROLE_LABELS[user?.role]} />
                <InfoItem icon={Building} label="Department" value={user?.department} />
                <InfoItem icon={User} label="Position" value={user?.position} />
                <InfoItem icon={Calendar} label="Join Date" value={user?.join_date ? new Date(user.join_date).toLocaleDateString() : '-'} />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="font-semibold">Address</h3>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <InfoItem icon={MapPin} label="Address" value={user?.address} />
                </div>
                <InfoItem icon={MapPin} label="City" value={user?.city} />
                <InfoItem icon={MapPin} label="State" value={user?.state} />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <div className="card-body text-center">
              <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary-700 font-bold text-3xl">
                  {user?.full_name?.charAt(0)?.toUpperCase()}
                </span>
              </div>
              <h3 className="font-semibold text-lg text-secondary-900">{user?.full_name}</h3>
              <p className="text-secondary-500">{ROLE_LABELS[user?.role]}</p>
              <p className="text-sm text-secondary-400 mt-1">{user?.employee_id}</p>
            </div>
          </div>

          <div className="card">
            <div className="card-header flex items-center justify-between">
              <h3 className="font-semibold">Security</h3>
              <button
                onClick={() => setShowPasswordForm(!showPasswordForm)}
                className="text-primary-600 text-sm hover:underline"
              >
                {showPasswordForm ? 'Cancel' : 'Change Password'}
              </button>
            </div>
            <div className="card-body">
              {showPasswordForm ? (
                <form onSubmit={handleSubmit(onChangePassword)} className="space-y-4">
                  <div>
                    <label className="label">Current Password</label>
                    <input type="password" {...register('currentPassword')} className={`input ${errors.currentPassword ? 'input-error' : ''}`} />
                    {errors.currentPassword && <p className="text-red-500 text-xs mt-1">{errors.currentPassword.message}</p>}
                  </div>
                  <div>
                    <label className="label">New Password</label>
                    <input type="password" {...register('newPassword')} className={`input ${errors.newPassword ? 'input-error' : ''}`} />
                    {errors.newPassword && <p className="text-red-500 text-xs mt-1">{errors.newPassword.message}</p>}
                  </div>
                  <div>
                    <label className="label">Confirm Password</label>
                    <input type="password" {...register('confirmPassword')} className={`input ${errors.confirmPassword ? 'input-error' : ''}`} />
                    {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
                  </div>
                  <button type="submit" disabled={submitting} className="btn-primary w-full">
                    {submitting ? 'Updating...' : 'Update Password'}
                  </button>
                </form>
              ) : (
                <div className="flex items-center gap-3 text-secondary-500">
                  <Lock className="w-5 h-5" />
                  <p className="text-sm">Password last changed: Never</p>
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="font-semibold">Account Info</h3>
            </div>
            <div className="card-body space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-secondary-500">Status</span>
                <span className={`font-medium ${user?.is_active ? 'text-primary-600' : 'text-red-600'}`}>
                  {user?.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-500">Last Login</span>
                <span className="text-secondary-900">
                  {user?.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-500">Created</span>
                <span className="text-secondary-900">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserProfile
