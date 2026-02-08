import React, { useState, useRef, useCallback } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { FiUpload, FiX, FiCamera, FiImage } from 'react-icons/fi'
import { toast } from 'react-hot-toast'

import { apiService } from '@/api/api'
import { useAuth } from '@/contexts/AuthContext'

const ImageUploadForm = ({ onImageUploaded, currentImage, maxSize = 5 * 1024 * 1024 }) => {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [preview, setPreview] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef(null)
  const { user } = useAuth()
  const queryClient = useQueryClient()

  // Mutation para subir imagen
  const uploadMutation = useMutation({
    mutationFn: async (file) => {
      const formData = new FormData()
      formData.append('imagen', file)
      formData.append('user_id', user.id)
      
      return apiService.perfil.uploadImage(formData)
    },
    onMutate: () => {
      setUploading(true)
      setProgress(0)
    },
    onSuccess: (data) => {
      if (data.success) {
        setPreview(data.url)
        onImageUploaded?.(data.url)
        toast.success('✅ Imagen actualizada correctamente')
        queryClient.invalidateQueries(['perfil'])
      } else {
        toast.error(`❌ ${data.message}`)
      }
    },
    onError: (error) => {
      console.error('Error uploading image:', error)
      toast.error('❌ Error al subir la imagen')
    },
    onSettled: () => {
      setUploading(false)
      setProgress(0)
    }
  })

  // Validar archivo
  const validateFile = (file) => {
    if (!file) return false

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error('❌ Tipo de archivo no permitido. Usa JPG, PNG, GIF o WebP')
      return false
    }

    // Validar tamaño
    if (file.size > maxSize) {
      toast.error(`❌ Archivo demasiado grande. Máximo: ${maxSize / (1024 * 1024)}MB`)
      return false
    }

    return true
  }

  // Manejar selección de archivo
  const handleFileSelect = useCallback((event) => {
    const file = event.target.files[0]
    if (file && validateFile(file)) {
      uploadMutation.mutate(file)
    }
  }, [validateFile, uploadMutation])

  // Manejar drag & drop
  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      const file = files[0]
      if (validateFile(file)) {
        uploadMutation.mutate(file)
      }
    }
  }, [validateFile, uploadMutation])

  // Abrir selector de archivo
  const openFileDialog = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  // Eliminar imagen actual
  const handleRemoveImage = useCallback(() => {
    setPreview(null)
    onImageUploaded?.(null)
    toast.info('ℹ️ Imagen eliminada del perfil')
  }, [onImageUploaded])

  // Simular progreso (para demo)
  React.useEffect(() => {
    if (uploading) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval)
            return 90
          }
          return prev + 10
        })
      }, 200)
      
      return () => clearInterval(interval)
    }
  }, [uploading])

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <FiCamera className="mr-2 text-blue-600" />
              Foto de Peril
            </h3>
            {currentImage && (
              <button
                onClick={handleRemoveImage}
                className="text-red-500 hover:text-red-700 transition-colors"
                title="Eliminar imagen"
              >
                <FiX size={18} />
              </button>
            )}
          </div>

          <div className="space-y-4">
            {/* Área de Upload */}
            <div
              className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer ${
                dragActive
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400 bg-gray-50'
              } ${uploading ? 'pointer-events-none opacity-75' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={openFileDialog}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                disabled={uploading}
              />

              {uploading ? (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                  <p className="text-sm text-gray-600">Subiendo imagen...</p>
                  
                  {/* Barra de progreso */}
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500">{progress}%</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
                  <div>
                    <p className="text-lg font-medium text-gray-900">
                      Arrastra una imagen aquí
                    </p>
                    <p className="text-sm text-gray-500">
                      o click para seleccionar
                    </p>
                  </div>
                  <div className="flex items-center justify-center space-x-4 text-xs text-gray-400">
                    <span className="flex items-center">
                      <FiImage className="mr-1" size={14} />
                      JPG, PNG, GIF, WebP
                    </span>
                    <span>Máx: {maxSize / (1024 * 1024)}MB</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Vista Previa */}
          {(preview || currentImage) && (
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Vista Previa</h4>
              <div className="relative rounded-lg overflow-hidden border border-gray-200">
                <img
                  src={preview || currentImage}
                  alt="Vista previa de perfil"
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none'
                  }}
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-2">
                  <p className="text-white text-xs text-center">
                    URL: {(preview || currentImage)?.split('/').pop()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Información adicional */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start space-x-3">
              <div className="text-blue-600">
                <FiCamera size={20} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900">
                  Foto de perfil profesional
                </p>
                <p className="text-xs text-blue-700">
                  Una buena foto de perfil aumenta la confianza de los clientes
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ImageUploadForm