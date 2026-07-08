import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

const tenantFormSchema = z.object({
  id: z.string().max(64).min(1, "ID is required"),
  identifier: z.string().max(64).min(1, "Identifier is required").regex(/^[a-zA-Z0-9_\-]+$/, "Identifier must contain only alphanumeric characters, underscores or hyphens"),
  name: z.string().max(256).min(1, "Name is required"),
  adminEmail: z.string().email().optional().or(z.literal('')),
  dbProvider: z.string().min(1, "DB Provider is required"),
  validFrom: z.string().optional(),
  validUntil: z.string().optional(),
  hasSupplyFeature: z.boolean().optional(),
  hasSecondaryQty: z.boolean().optional(),
}).refine((data) => {
  if (data.validFrom && data.validUntil) {
    return new Date(data.validUntil) > new Date(data.validFrom);
  }
  return true;
}, {
  message: "Valid Until must be after Valid From",
  path: ["validUntil"]
});

export type TenantFormValues = z.infer<typeof tenantFormSchema>

interface TenantFormProps {
  initialValues?: Partial<TenantFormValues>
  onSubmit: (data: TenantFormValues) => void
  isSubmitting?: boolean
  isEdit?: boolean
}

export function TenantForm({ initialValues, onSubmit, isSubmitting, isEdit = false }: TenantFormProps) {
  const navigate = useNavigate()

  const form = useForm<TenantFormValues>({
    resolver: zodResolver(tenantFormSchema),
    defaultValues: {
      id: initialValues?.id || "",
      identifier: initialValues?.identifier || "",
      name: initialValues?.name || "",
      adminEmail: initialValues?.adminEmail || "",
      dbProvider: initialValues?.dbProvider || "postgresql",
      validFrom: initialValues?.validFrom ? new Date(initialValues.validFrom).toISOString().split('T')[0] : "",
      validUntil: initialValues?.validUntil ? new Date(initialValues.validUntil).toISOString().split('T')[0] : "",
      hasSupplyFeature: initialValues?.hasSupplyFeature ?? true,
      hasSecondaryQty: initialValues?.hasSecondaryQty ?? false,
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tenant ID</FormLabel>
                <FormControl>
                  <Input placeholder="tenant-id" disabled={isEdit} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="identifier"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Identifier</FormLabel>
                <FormControl>
                  <Input placeholder="waqar_mr" disabled={isEdit} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="My Tenant Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="adminEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Admin Email (Optional)</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="admin@tenant.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="validFrom"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valid From (Optional)</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="validUntil"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valid Until (Optional)</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dbProvider"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Database Provider</FormLabel>
                <FormControl>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    {...field}
                  >
                    <option value="postgresql">PostgreSQL</option>
                    <option value="mssql">SQL Server</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="hasSupplyFeature"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <input
                    type="checkbox"
                    checked={!!field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary mt-1"
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Enable Supply Feature</FormLabel>
                  <p className="text-xs text-muted-foreground">
                    Enables supply orders, sale supply, and route features.
                  </p>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="hasSecondaryQty"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <input
                    type="checkbox"
                    checked={!!field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary mt-1"
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Enable Secondary Qty</FormLabel>
                  <p className="text-xs text-muted-foreground">
                    Enables single/pack quantities and rates.
                  </p>
                </div>
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/tenants')}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Tenant"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
