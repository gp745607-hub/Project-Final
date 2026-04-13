import { useState, useRef, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Camera, Upload, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { type Beneficiaire, CATEGORIES, generateCodeBarre, getCategorieFromAge, calculateAge } from '@/lib/index'

const beneficiaireSchema = z.object({
  nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').max(50, 'Le nom ne peut pas dépasser 50 caractères'),
  prenom: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères').max(50, 'Le prénom ne peut pas dépasser 50 caractères'),
  dateNaissance: z.string().min(1, 'La date de naissance est requise').refine((date) => {
    const birthDate = new Date(date)
    const today = new Date()
    return birthDate < today
  }, 'La date de naissance doit être dans le passé'),
  categorie: z.enum(['ENFANT', 'ADOLESCENT', 'ADULTE', 'SENIOR']),
  photo: z.string().optional(),
  notes: z.string().max(500, 'Les notes ne peuvent pas dépasser 500 caractères').optional(),
})

type BeneficiaireFormData = z.infer<typeof beneficiaireSchema>

interface BeneficiaireFormProps {
  beneficiaire?: Beneficiaire
  onSubmit: (data: Partial<Beneficiaire>) => Promise<void>
  onCancel: () => void
}

export function BeneficiaireForm({ beneficiaire, onSubmit, onCancel }: BeneficiaireFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [photoMode, setPhotoMode] = useState<'none' | 'upload' | 'webcam'>('none')
  const [photoPreview, setPhotoPreview] = useState<string | undefined>(beneficiaire?.photo)
  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<BeneficiaireFormData>({
    resolver: zodResolver(beneficiaireSchema),
    defaultValues: {
      nom: beneficiaire?.nom || '',
      prenom: beneficiaire?.prenom || '',
      dateNaissance: beneficiaire?.dateNaissance || '',
      categorie: beneficiaire?.categorie || 'ENFANT',
      photo: beneficiaire?.photo || '',
      notes: beneficiaire?.notes || '',
    },
  })

  const dateNaissance = watch('dateNaissance')

  useEffect(() => {
    if (dateNaissance) {
      const age = calculateAge(dateNaissance)
      const suggestedCategorie = getCategorieFromAge(age)
      setValue('categorie', suggestedCategorie)
    }
  }, [dateNaissance, setValue])

  useEffect(() => {
    return () => {
      if (webcamStream) {
        webcamStream.getTracks().forEach(track => track.stop())
      }
    }
  }, [webcamStream])

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
      setWebcamStream(stream)
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setPhotoMode('webcam')
    } catch (error) {
      console.error('Erreur webcam:', error)
      setSubmitError('Impossible d\'accéder à la webcam')
    }
  }

  const stopWebcam = () => {
    if (webcamStream) {
      webcamStream.getTracks().forEach(track => track.stop())
      setWebcamStream(null)
    }
    setPhotoMode('none')
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(video, 0, 0)
        const photoData = canvas.toDataURL('image/jpeg', 0.8)
        setPhotoPreview(photoData)
        setValue('photo', photoData)
        stopWebcam()
      }
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setSubmitError('La photo ne doit pas dépasser 5 MB')
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setPhotoPreview(result)
        setValue('photo', result)
        setPhotoMode('none')
      }
      reader.readAsDataURL(file)
    }
  }

  const removePhoto = () => {
    setPhotoPreview(undefined)
    setValue('photo', '')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const onFormSubmit = async (data: BeneficiaireFormData) => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const submitData: Partial<Beneficiaire> = {
        ...data,
        codeBarre: beneficiaire?.codeBarre || generateCodeBarre(),
        dateInscription: beneficiaire?.dateInscription || new Date().toISOString(),
        actif: beneficiaire?.actif ?? true,
        archive: beneficiaire?.archive ?? false,
      }

      if (beneficiaire?.id) {
        submitData.id = beneficiaire.id
      }

      await onSubmit(submitData)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Erreur lors de l\'enregistrement')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{beneficiaire ? 'Modifier le bénéficiaire' : 'Nouveau bénéficiaire'}</CardTitle>
        <CardDescription>
          {beneficiaire ? 'Modifiez les informations du bénéficiaire' : 'Ajoutez un nouveau bénéficiaire au système'}
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onFormSubmit)}>
        <CardContent className="space-y-6">
          {submitError && (
            <Alert variant="destructive">
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div>
              <Label>Photo du bénéficiaire</Label>
              <div className="mt-2 space-y-4">
                {photoPreview ? (
                  <div className="relative inline-block">
                    <img
                      src={photoPreview}
                      alt="Aperçu"
                      className="w-32 h-32 object-cover rounded-lg border-2 border-border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                      onClick={removePhoto}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : photoMode === 'webcam' ? (
                  <div className="space-y-2">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full max-w-md rounded-lg border-2 border-border"
                    />
                    <canvas ref={canvasRef} className="hidden" />
                    <div className="flex gap-2">
                      <Button type="button" onClick={capturePhoto}>
                        Capturer
                      </Button>
                      <Button type="button" variant="outline" onClick={stopWebcam}>
                        Annuler
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Télécharger
                    </Button>
                    <Button type="button" variant="outline" onClick={startWebcam}>
                      <Camera className="mr-2 h-4 w-4" />
                      Webcam
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nom">Nom *</Label>
                <Input
                  id="nom"
                  {...register('nom')}
                  placeholder="Nom de famille"
                  className={errors.nom ? 'border-destructive' : ''}
                />
                {errors.nom && (
                  <p className="text-sm text-destructive">{errors.nom.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="prenom">Prénom *</Label>
                <Input
                  id="prenom"
                  {...register('prenom')}
                  placeholder="Prénom"
                  className={errors.prenom ? 'border-destructive' : ''}
                />
                {errors.prenom && (
                  <p className="text-sm text-destructive">{errors.prenom.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateNaissance">Date de naissance *</Label>
                <Input
                  id="dateNaissance"
                  type="date"
                  {...register('dateNaissance')}
                  max={new Date().toISOString().split('T')[0]}
                  className={errors.dateNaissance ? 'border-destructive' : ''}
                />
                {errors.dateNaissance && (
                  <p className="text-sm text-destructive">{errors.dateNaissance.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="categorie">Catégorie *</Label>
                <Select
                  value={watch('categorie')}
                  onValueChange={(value) => setValue('categorie', value as BeneficiaireFormData['categorie'])}
                >
                  <SelectTrigger id="categorie" className={errors.categorie ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.categorie && (
                  <p className="text-sm text-destructive">{errors.categorie.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                {...register('notes')}
                placeholder="Informations complémentaires (optionnel)"
                rows={4}
                className={errors.notes ? 'border-destructive' : ''}
              />
              {errors.notes && (
                <p className="text-sm text-destructive">{errors.notes.message}</p>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Annuler
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enregistrement...
              </>
            ) : (
              beneficiaire ? 'Mettre à jour' : 'Créer'
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
