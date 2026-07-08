import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft } from "lucide-react"

import api from "@/lib/axios"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TenantForm, TenantFormValues } from "@/components/TenantForm"

export function TenantEdit() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: tenant, isLoading, error } = useQuery({
    queryKey: ["tenants", id],
    queryFn: async () => {
      const response = await api.get(`/tenants/${id}`)
      return response.data.body
    },
    enabled: !!id,
  })

  const updateMutation = useMutation({
    mutationFn: async (values: TenantFormValues) => {
      const payload = {
        id: values.id,
        name: values.name,
        adminEmail: values.adminEmail || undefined,
        dbProvider: values.dbProvider,
        validFrom: values.validFrom ? new Date(values.validFrom).toISOString() : undefined,
        validUntil: values.validUntil ? new Date(values.validUntil).toISOString() : undefined,
        hasSupplyFeature: values.hasSupplyFeature,
        hasSecondaryQty: values.hasSecondaryQty,
      }
      const response = await api.put(`/tenants/${id}`, payload)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] })
      navigate('/tenants')
    },
    onError: (error: any) => {
      alert(error.response?.data?.metadata?.message || "Failed to update tenant")
    }
  })

  if (isLoading) return <div className="p-8 text-center">Loading tenant details...</div>
  if (error || !tenant) return <div className="p-8 text-center text-destructive">Error loading tenant</div>

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader className="flex flex-row items-center gap-4 space-y-0">
        <Button variant="ghost" size="icon" onClick={() => navigate('/tenants')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <CardTitle className="text-2xl font-bold">Edit Tenant: {tenant.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <TenantForm
          initialValues={tenant}
          onSubmit={(data) => updateMutation.mutate(data)}
          isSubmitting={updateMutation.isPending}
          isEdit={true}
        />
      </CardContent>
    </Card>
  )
}
