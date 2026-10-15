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
  industryType: z.enum(["general", "wanda", "mobile", "normal"]),
  businessSubType: z.string().optional(),
  shopType: z.enum(["normal", "wanda", "mobile"]).optional(),
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
    industryType?: string
    businessSubType?: string
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

  const rawIndustry = initialValues?.industryType || (
    initialValues?.shopType === "wanda" || initialValues?.hasVariablePackFeature
      ? "wanda"
      : initialValues?.shopType === "mobile" || initialValues?.hasMobileShopFeature
      ? "mobile"
      : "general"
  );
  const defaultIndustry: "general" | "wanda" | "mobile" =
    rawIndustry === "wanda" ? "wanda" : rawIndustry === "mobile" ? "mobile" : "general";

  const defaultSubCategory = initialValues?.businessSubType || "general_store";

  const form = useForm<TenantFormValues>({
    resolver: zodResolver(tenantFormSchema),
    defaultValues: {
      id: initialValues?.id || "",
      identifier: initialValues?.identifier || "",
      name: initialValues?.name || "",
      adminEmail: initialValues?.adminEmail || "",
      dbProvider: initialValues?.dbProvider || "postgresql",
      industryType: defaultIndustry,
      businessSubType: defaultSubCategory,
      shopType: defaultIndustry === "wanda" ? "wanda" : defaultIndustry === "mobile" ? "mobile" : "normal",
      validFrom: initialValues?.validFrom ? new Date(initialValues.validFrom).toISOString().split('T')[0] : "",
      validUntil: initialValues?.validUntil ? new Date(initialValues.validUntil).toISOString().split('T')[0] : "",
      hasVariablePackFeature: initialValues?.hasVariablePackFeature ?? (defaultIndustry === "wanda"),
      hasMobileShopFeature: initialValues?.hasMobileShopFeature ?? (defaultIndustry === "mobile"),
    },
  })

  const selectedIndustry = form.watch("industryType")

  const handleFormSubmit = (data: TenantFormValues) => {
    const isWanda = data.industryType === "wanda";
    const isMobile = data.industryType === "mobile";
    const subCategory = (data.industryType === "general" || data.industryType === "normal")
      ? (data.businessSubType || "general_store")
      : undefined;

    onSubmit({
      ...data,
      industryType: data.industryType === "normal" ? "general" : data.industryType,
      businessSubType: subCategory,
      shopType: isWanda ? "wanda" : isMobile ? "mobile" : "normal",
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
            name="industryType"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <div className="flex items-center justify-between">
                  <FormLabel>Industry / Business Type</FormLabel>
                  {isEdit && (
                    <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded">
                      Locked after creation
                    </span>
                  )}
                </div>
                <FormControl>
                  <select
                    disabled={isEdit}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    {...field}
                    onChange={(e) => {
                      const val = e.target.value as "general" | "wanda" | "mobile";
                      field.onChange(val);
                      form.setValue("shopType", val === "wanda" ? "wanda" : val === "mobile" ? "mobile" : "normal");
                      form.setValue("hasVariablePackFeature", val === "wanda");
                      form.setValue("hasMobileShopFeature", val === "mobile");
                    }}
                  >
                    <option value="general">General Retail</option>
                    <option value="wanda">Wanda (Grain / Feed Merchant & Feed Milling)</option>
                    <option value="mobile">Mobile & Electronics (Smartphones, IMEI & Repair Jobs)</option>
                  </select>
                </FormControl>
                <p className="text-xs text-muted-foreground mt-1">
                  {isEdit ? "Industry type cannot be changed for an existing tenant to maintain catalog and ledger integrity." : (
                    <>
                      {(field.value === "general" || field.value === "normal") && "Standard retail business workflow with dynamic catalog seeding for brands, categories, and products."}
                      {field.value === "wanda" && "Grain & feed merchant workflow with auto bag-rate synchronization, weight per Kg, and seeded cattle/poultry feed brands."}
                      {field.value === "mobile" && "Electronics & mobile device workflow with IMEI tracking, seeded smartphone brands (Apple, Samsung, etc.), accessories, and repair services."}
                    </>
                  )}
                </p>
                <FormMessage />
              </FormItem>
            )}
          />

          {(selectedIndustry === "general" || selectedIndustry === "normal") && (
            <FormField
              control={form.control}
              name="businessSubType"
              render={({ field }) => (
                <FormItem className="md:col-span-2 border rounded-md p-4 bg-muted/20">
                  <div className="flex items-center justify-between">
                    <FormLabel className="font-semibold">General Industry Sub-Category</FormLabel>
                    {isEdit && (
                      <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded">
                        Locked after creation
                      </span>
                    )}
                  </div>
                  <FormControl>
                    <select
                      disabled={isEdit}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      {...field}
                    >
                      <option value="general_store">General Store / Mart (FMCG, Groceries, Staples & Provisions)</option>
                      <option value="bakery">Bakery (Breads, Cakes, Pastries, Sweets & Savouries)</option>
                      <option value="milkshop">Milk Shop (Fresh Dairy, Milk, Yogurt, Ghee, Butter & Eggs)</option>
                    </select>
                  </FormControl>
                  <div className="text-xs text-muted-foreground mt-2 space-y-1">
                    {isEdit ? (
                      <p>Sub-category and seeded catalog profile cannot be changed after tenant creation.</p>
                    ) : (
                      <>
                        <p className="font-medium text-foreground">
                          Dynamic Seeding on Creation:
                        </p>
                        {field.value === "bakery" && (
                          <p>✨ Seeds Brands (Dawn, Gourmet, In-House), Categories (Breads, Cakes, Pastries, Biscuits, Mithai), and ready-to-sell bakery products.</p>
                        )}
                        {field.value === "milkshop" && (
                          <p>✨ Seeds Brands (Pure Dairy, Nestle, Olper's), Categories (Fresh Milk, Desi Ghee, Khoya, Eggs), and dairy products with Litre & Kg units.</p>
                        )}
                        {(!field.value || field.value === "general_store" || field.value === "mart") && (
                          <p>✨ Seeds Brands (National, Shan, Unilever, Dalda, Tapal), Categories (Grocery, Spices, Oil, Beverages), and retail products with Barcodes.</p>
                        )}
                      </>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

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
