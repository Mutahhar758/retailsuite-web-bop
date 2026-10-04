import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useNavigate } from "react-router-dom"
import { Key, Copy, Check } from "lucide-react"

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
  shopType: z.enum(["normal", "wanda", "mobile"]),
  validFrom: z.string().optional(),
  validUntil: z.string().optional(),
  hasVariablePackFeature: z.boolean().optional(),
  hasMobileShopFeature: z.boolean().optional(),
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
  initialValues?: Partial<TenantFormValues> & {
    hasVariablePackFeature?: boolean
    hasMobileShopFeature?: boolean
    licenseKey?: string | null
  }
  onSubmit: (data: TenantFormValues) => void
  isSubmitting?: boolean
  isEdit?: boolean
}

export function TenantForm({ initialValues, onSubmit, isSubmitting, isEdit = false }: TenantFormProps) {
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)

  const defaultShopType: "normal" | "wanda" | "mobile" =
    initialValues?.shopType
      ? initialValues.shopType
      : initialValues?.hasMobileShopFeature
      ? "mobile"
      : initialValues?.hasVariablePackFeature
      ? "wanda"
      : "normal";

  const form = useForm<TenantFormValues>({
    resolver: zodResolver(tenantFormSchema),
    defaultValues: {
      id: initialValues?.id || "",
      identifier: initialValues?.identifier || "",
      name: initialValues?.name || "",
      adminEmail: initialValues?.adminEmail || "",
      dbProvider: initialValues?.dbProvider || "postgresql",
      shopType: defaultShopType,
      validFrom: initialValues?.validFrom ? new Date(initialValues.validFrom).toISOString().split('T')[0] : "",
      validUntil: initialValues?.validUntil ? new Date(initialValues.validUntil).toISOString().split('T')[0] : "",
      hasVariablePackFeature: initialValues?.hasVariablePackFeature ?? (defaultShopType === "wanda"),
      hasMobileShopFeature: initialValues?.hasMobileShopFeature ?? (defaultShopType === "mobile"),
    },
  })

  const handleFormSubmit = (data: TenantFormValues) => {
    const isWanda = data.shopType === "wanda";
    const isMobile = data.shopType === "mobile";
    onSubmit({
      ...data,
      hasVariablePackFeature: isWanda,
      hasMobileShopFeature: isMobile,
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {isEdit && initialValues?.licenseKey && (
            <div className="md:col-span-2 rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-primary">License Key</span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1 text-xs"
                  onClick={() => {
                    navigator.clipboard.writeText(initialValues.licenseKey || "");
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-green-600" />
                      <span className="text-green-600 font-medium">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Key</span>
                    </>
                  )}
                </Button>
              </div>
              <div className="p-2.5 rounded bg-background border font-mono text-xs break-all select-all text-foreground">
                {initialValues.licenseKey}
              </div>
              <p className="text-xs text-muted-foreground">
                This license key is required to register the RetailSuite desktop client for this tenant.
              </p>
            </div>
          )}

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
                {isEdit && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Identifier is permanent and cannot be modified.
                  </p>
                )}
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
            name="shopType"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Shop / Organization Type</FormLabel>
                <FormControl>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    {...field}
                    onChange={(e) => {
                      const val = e.target.value as "normal" | "wanda" | "mobile";
                      field.onChange(val);
                      form.setValue("hasVariablePackFeature", val === "wanda");
                      form.setValue("hasMobileShopFeature", val === "mobile");
                    }}
                  >
                    <option value="normal">Normal (General Retail)</option>
                    <option value="wanda">Wanda (Grain / Feed & Variable Pack)</option>
                    <option value="mobile">Devices & Repairs (Smartphones, Electronics, IMEI & Repairs)</option>
                  </select>
                </FormControl>
                <p className="text-xs text-muted-foreground mt-1">
                  {field.value === "normal" && "Standard retail business workflow with general inventory, sales, and accounts."}
                  {field.value === "wanda" && "Grain & feed merchant workflow with rate per Kg, auto bag-rate synchronization, and variable weight packs."}
                  {field.value === "mobile" && "Electronics & mobile device workflow with IMEI/Serial tracking, PTA status, brands catalog, warranty lookup, and repair job cards."}
                </p>
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
                    disabled={isEdit}
                    {...field}
                  >
                    <option value="postgresql">PostgreSQL</option>
                    <option value="mssql">SQL Server</option>
                  </select>
                </FormControl>
                {isEdit && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Database provider is fixed at creation time and cannot be modified.
                  </p>
                )}
                <FormMessage />
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
