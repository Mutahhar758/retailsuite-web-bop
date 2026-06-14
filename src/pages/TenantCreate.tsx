import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { ArrowLeft } from "lucide-react"

import api from "@/lib/axios"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TenantForm, TenantFormValues } from "@/components/TenantForm"

export function TenantCreate() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: async (values: TenantFormValues) => {
      // Clean up empty strings to undefined/null for optional fields
      const payload = {
        ...values,
        adminEmail: values.adminEmail || undefined,
        dbProvider: values.dbProvider,
        validFrom: values.validFrom ? new Date(values.validFrom).toISOString() : undefined,
        validUntil: values.validUntil ? new Date(values.validUntil).toISOString() : undefined,
      }
      const response = await api.post('/tenants', payload)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] })
      navigate('/tenants')
    },
    onError: (error: any) => {
      alert(error.response?.data?.metadata?.message || "Failed to create tenant")
    }
  })

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader className="flex flex-row items-center gap-4 space-y-0">
        <Button variant="ghost" size="icon" onClick={() => navigate('/tenants')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <CardTitle className="text-2xl font-bold">Create New Tenant</CardTitle>
      </CardHeader>
      <CardContent>
        <TenantForm
          onSubmit={(data) => createMutation.mutate(data)}
          isSubmitting={createMutation.isPending}
        />
      </CardContent>
    </Card>
  )
}
