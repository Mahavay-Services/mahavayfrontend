import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { userService } from '../../api/services'
import PageHeader from '../../components/ui/PageHeader'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { Save, ArrowLeft } from 'lucide-react'
import { ROLE_LABELS, INDIAN_STATES } from '../../constants'
import toast from 'react-hot-toast'

const schema = yup.object({
  full_name: yup.string().required('Full name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  phone: yup.string().required('Phone is required').matches(/^[0-9]{10}$/, 'Invalid phone number'),
  password: yup.string().when('$isEdit', {
    is: false,
    then: (schema) => schema.required('Password is required').min(8, 'Minimum 8 characters'),
    otherwise: (schema) => schema
  }),
  role: yup.string().required('Role is required'),
  department: yup.string(),
  position: yup.string(),
  join_date: yup.date().nullable(),
  address: yup.string(),
  city: yup.string(),
  state: yup.string(),
  emergency_contact: yup.string().nullable()
})

const UserForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id
  const [loading, setLoading] = useState(isEdit)
  const [submitting, setSubmitting] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    context: { isEdit }
  })

  useEffect(() => {
    if (isEdit) {
      fetchUser()
    }
  }, [id])

  const fetchUser = async () => {
    try {
      const response = await userService.getById(id)
      const user = response.data.data
      reset({
        ...user,
        join_date: user.join_date ? new Date(user.join_date).toISOString().split('T')[0] : ''
      })
    } catch (error) {
      toast.error('Failed to fetch user')
      navigate('/users')
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data) => {
    setSubmitting(true)
    try {
      if (isEdit) {
        await userService.update(id, data)
        toast.success('User updated successfully')
      } else {
        await userService.create(data)
        toast.success('User created successfully')
      }
      navigate('/users')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save user')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title={isEdit ? 'Edit User' : 'Add New User'}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Users', href: '/users' },
          { label: isEdit ? 'Edit' : 'New' }
        ]}
        actions={
          <button onClick={() => navigate('/users')} className="btn-outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>
        }
      />

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl">
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold">Personal Information</h3>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label">Full Name *</label>
                <input {...register('full_name')} className={`input ${errors.full_name ? 'input-error' : ''}`} />
                {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name.message}</p>}
              </div>
              
              <div>
                <label className="label">Email *</label>
                <input type="email" {...register('email')} className={`input ${errors.email ? 'input-error' : ''}`} />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>
              
              <div>
                <label className="label">Phone *</label>
                <input {...register('phone')} className={`input ${errors.phone ? 'input-error' : ''}`} />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
              </div>
              
              {!isEdit && (
                <div>
                  <label className="label">Password *</label>
                  <input type="password" {...register('password')} className={`input ${errors.password ? 'input-error' : ''}`} />
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                </div>
              )}
              
              <div>
                <label className="label">Emergency Contact</label>
                <input {...register('emergency_contact')} className="input" />
              </div>
            </div>
          </div>
        </div>

        <div className="card mt-6">
          <div className="card-header">
            <h3 className="font-semibold">Professional Information</h3>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label">Role *</label>
                <select {...register('role')} className={`input ${errors.role ? 'input-error' : ''}`}>
                  <option value="">Select Role</option>
                  {Object.entries(ROLE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role.message}</p>}
              </div>
              
              <div>
                <label className="label">Department</label>
                <input {...register('department')} className="input" />
              </div>
              
              <div>
                <label className="label">Position</label>
                <input {...register('position')} className="input" />
              </div>
              
              <div>
                <label className="label">Join Date</label>
                <input type="date" {...register('join_date')} className="input" />
              </div>
            </div>
          </div>
        </div>

        <div className="card mt-6">
          <div className="card-header">
            <h3 className="font-semibold">Address</h3>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="label">Address</label>
                <textarea {...register('address')} className="input" rows={3} />
              </div>
              
              <div>
                <label className="label">City</label>
                <input {...register('city')} className="input" />
              </div>
              
              <div>
                <label className="label">State</label>
                <select {...register('state')} className="input">
                  <option value="">Select State</option>
                  {INDIAN_STATES.map((state) => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <button type="button" onClick={() => navigate('/users')} className="btn-outline">
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {isEdit ? 'Update User' : 'Create User'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default UserForm
