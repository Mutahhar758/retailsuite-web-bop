import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { Plus, Pencil } from "lucide-react"
import { format } from "date-fns"

import api from "@/lib/axios"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface Tenant {
  id: string
  identifier: string
  name: string
  adminEmail: string | null
  isActive: boolean
  validFrom: string
  validUntil: string | null
}

export function TenantList() {
  const navigate = useNavigate()

  const { data, isLoading, error } = useQuery({
    queryKey: ["tenants"],
    queryFn: async () => {
      const response = await api.get('/tenants')
      return response.data.body as Tenant[]
    },
  })

  if (isLoading) return <div className="p-8 text-center">Loading tenants...</div>
  if (error) return <div className="p-8 text-center text-destructive">Error loading tenants</div>

  const tenants = data || []

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
        <CardTitle className="text-2xl font-bold">Tenants</CardTitle>
        <Button onClick={() => navigate('/tenants/create')}>
          <Plus className="w-4 h-4 mr-2" />
          Create Tenant
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Identifier</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Admin Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Valid From</TableHead>
              <TableHead>Valid Until</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tenants.map((tenant) => (
              <TableRow key={tenant.id}>
                <TableCell className="font-medium">{tenant.identifier}</TableCell>
                <TableCell>{tenant.name}</TableCell>
                <TableCell>{tenant.adminEmail || '-'}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    tenant.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {tenant.isActive ? 'Active' : 'Inactive'}
                  </span>
                </TableCell>
                <TableCell>{format(new Date(tenant.validFrom), 'MMM dd, yyyy')}</TableCell>
                <TableCell>
                  {tenant.validUntil ? format(new Date(tenant.validUntil), 'MMM dd, yyyy') : 'Indefinite'}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(`/tenants/${tenant.id}/edit`)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {tenants.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  No tenants found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
