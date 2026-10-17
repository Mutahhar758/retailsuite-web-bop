import React, { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Copy,
  Check,
  Mail,
  Share2,
  MonitorDown,
  Smartphone,
  Key,
  ExternalLink,
  MessageSquare,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle
} from "lucide-react"
import api from "@/lib/axios"

export interface TenantInviteData {
  id: string
  identifier: string
  name: string
  adminEmail: string | null
  licenseKey?: string | null
}

interface TenantInviteModalProps {
  tenant: TenantInviteData | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const DEFAULT_DESKTOP_SETUP_URL = "http://retailsuite-desktop.bizgripsolutions.com/setup.exe"
const DEFAULT_ANDROID_APP_URL = "https://drive.google.com/file/d/1R9YrB8ijLX3Cz_aOuQS7XDTDOK-7kW5-/view?usp=sharing"
const DEFAULT_WEB_URL = "https://retail.bizgripsolutions.com/"
const DEFAULT_PASSWORD = "Hallo123$"

export const TenantInviteModal: React.FC<TenantInviteModalProps> = ({
  tenant,
  open,
  onOpenChange,
}) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null)
  const [recipientEmail, setRecipientEmail] = useState("")
  const [customMessage, setCustomMessage] = useState("")
  const [desktopUrl, setDesktopUrl] = useState(DEFAULT_DESKTOP_SETUP_URL)
  const [androidUrl, setAndroidUrl] = useState(DEFAULT_ANDROID_APP_URL)
  const [webUrl, setWebUrl] = useState(DEFAULT_WEB_URL)
  const [tempPassword, setTempPassword] = useState(DEFAULT_PASSWORD)

  const [isSending, setIsSending] = useState(false)
  const [sendSuccess, setSendSuccess] = useState<string | null>(null)
  const [sendError, setSendError] = useState<string | null>(null)

  useEffect(() => {
    if (tenant) {
      setRecipientEmail(tenant.adminEmail || "")
      setCustomMessage("")
      setDesktopUrl(DEFAULT_DESKTOP_SETUP_URL)
      setAndroidUrl(DEFAULT_ANDROID_APP_URL)
      setWebUrl(DEFAULT_WEB_URL)
      setTempPassword(DEFAULT_PASSWORD)
      setSendSuccess(null)
      setSendError(null)
    }
  }, [tenant, open])

  if (!tenant) return null

  const handleCopy = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text)
    setCopiedSection(sectionId)
    setTimeout(() => setCopiedSection(null), 2500)
  }

  const generateFullMessage = () => {
    return [
      `🎉 Welcome to RetailSuite!`,
      ``,
      `Your organization account for *${tenant.name}* is ready.`,
      customMessage.trim() ? `\n📝 Note: ${customMessage.trim()}\n` : null,
      ``,
      `🏢 *Organization Details:*`,
      `• Organization: ${tenant.name}`,
      tenant.licenseKey ? `• License Key: ${tenant.licenseKey}` : null,
      ``,
      `💻 *Windows Desktop Setup (Recommended for POS & Billing):*`,
      `Download & Install: ${desktopUrl}`,
      ``,
      `📱 *Android Mobile App:*`,
      `Download & Install: ${androidUrl}`,
      ``,
      `🌐 *Web Portal:*`,
      `${webUrl}`,
      ``,
      `👤 *Initial Admin Credentials:*`,
      `• Username: Admin (or ${recipientEmail || tenant.adminEmail || "your email"})`,
      `• Password: ${tempPassword}`,
      recipientEmail || tenant.adminEmail ? `• Registered Email: ${recipientEmail || tenant.adminEmail}` : null,
      ``,
      `📌 *Getting Started:*`,
      `1. Download and run the Windows Desktop setup installer, Android Mobile App, or visit the Web Portal.`,
      tenant.licenseKey ? `2. When prompted, enter your License Key: ${tenant.licenseKey}` : `2. Log in with your admin credentials.`,
      `3. Sign in and change your password in Settings.`,
      ``,
      `If you have any questions or require assistance, our support team is happy to help!`,
    ]
      .filter((line) => line !== null)
      .join("\n")
  }

  const fullMessage = generateFullMessage()

  const handleSendBackendEmail = async () => {
    if (!recipientEmail || !recipientEmail.trim()) {
      setSendError("Please specify a valid recipient email address.")
      return
    }

    setIsSending(true)
    setSendSuccess(null)
    setSendError(null)

    try {
      const payload = {
        recipientEmail: recipientEmail.trim(),
        desktopSetupUrl: desktopUrl.trim(),
        androidAppUrl: androidUrl.trim(),
        webAppUrl: webUrl.trim(),
        customMessage: customMessage.trim() || undefined,
      }

      await api.post(`/tenants/${tenant.id}/invite`, payload)

      setSendSuccess(`Invitation email successfully sent to ${recipientEmail} from onboarding@bizgripsolutions.com!`)
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.messages?.[0] ||
        err.response?.data?.message ||
        err.message ||
        "Failed to send invitation email via backend server."
      setSendError(errorMsg)
    } finally {
      setIsSending(false)
    }
  }

  const handleEmailShare = () => {
    const subject = encodeURIComponent(`Welcome to RetailSuite - Access Details for ${tenant.name}`)
    const body = encodeURIComponent(fullMessage)
    const emailTo = recipientEmail || tenant.adminEmail || ""
    window.open(`mailto:${emailTo}?subject=${subject}&body=${body}`, "_blank")
  }

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(fullMessage)
    window.open(`https://wa.me/?text=${text}`, "_blank")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-xl">Tenant Invitation & Setup Access</DialogTitle>
              <DialogDescription>
                Send an official onboarding email from <code className="text-primary font-mono text-xs">onboarding@bizgripsolutions.com</code> or share access links directly.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Status Feedback Alerts */}
          {sendSuccess && (
            <div className="p-3 bg-green-50 border border-green-200 text-green-800 rounded-lg flex items-center gap-2.5 text-sm dark:bg-green-950/40 dark:border-green-800 dark:text-green-300">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0" />
              <span>{sendSuccess}</span>
            </div>
          )}

          {sendError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg flex items-center gap-2.5 text-sm dark:bg-red-950/40 dark:border-red-800 dark:text-red-300">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
              <span>{sendError}</span>
            </div>
          )}

          {/* Primary Action Card: Send via Backend Email */}
          <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                <h4 className="text-sm font-semibold text-foreground">
                  Send Email via Backend Server
                </h4>
              </div>
              <span className="text-[11px] font-mono text-muted-foreground bg-background px-2 py-0.5 rounded border">
                From: onboarding@bizgripsolutions.com
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2.5 pt-1">
              <div>
                <Label className="text-xs text-muted-foreground">Recipient Email Address</Label>
                <Input
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="admin@tenantdomain.com"
                  className="mt-1 text-sm bg-background"
                />
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Custom Message / Note (Optional)</Label>
                <Input
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="e.g. Please let us know if you need any assistance setting up your printer!"
                  className="mt-1 text-sm bg-background"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                onClick={handleSendBackendEmail}
                disabled={isSending || !recipientEmail.trim()}
                className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending Email...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Onboarding Email
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Alternate Share Actions */}
          <div className="flex flex-wrap items-center gap-2 p-3 bg-muted/50 rounded-lg border">
            <Button
              variant="outline"
              className="flex-1 min-w-[140px]"
              onClick={() => handleCopy(fullMessage, "full-message")}
            >
              {copiedSection === "full-message" ? (
                <>
                  <Check className="w-4 h-4 mr-2 text-green-600" />
                  Copied Text!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Text Invite
                </>
              )}
            </Button>

            <Button
              variant="outline"
              className="flex-1 min-w-[130px] border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-300 dark:hover:bg-emerald-950"
              onClick={handleWhatsAppShare}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              WhatsApp
            </Button>

            <Button
              variant="outline"
              className="flex-1 min-w-[130px] border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-950"
              onClick={handleEmailShare}
            >
              <Mail className="w-4 h-4 mr-2" />
              Mail Client
            </Button>
          </div>

          {/* Key Access Information Card */}
          <div className="rounded-lg border bg-card p-4 space-y-3">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <Key className="w-4 h-4 text-amber-500" />
              License & Authentication
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="p-2.5 rounded bg-muted/60 border">
                <span className="text-xs text-muted-foreground block">Tenant Name</span>
                <span className="font-medium truncate block">{tenant.name}</span>
              </div>

              <div className="p-2.5 rounded bg-muted/60 border">
                <span className="text-xs text-muted-foreground block">Registered Email</span>
                <span className="font-medium truncate block">{tenant.adminEmail || "Not specified"}</span>
              </div>
            </div>

            {/* License Key */}
            <div>
              <Label className="text-xs text-muted-foreground">License Key</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  readOnly
                  value={tenant.licenseKey || "No License Key generated"}
                  className="font-mono text-xs bg-muted"
                />
                {tenant.licenseKey && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopy(tenant.licenseKey!, "license-key")}
                  >
                    {copiedSection === "license-key" ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                )}
              </div>
            </div>

            {/* Default Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <Label className="text-xs text-muted-foreground">Default Username</Label>
                <Input readOnly value="Admin" className="mt-1 text-sm bg-muted" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Default Temporary Password</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    value={tempPassword}
                    onChange={(e) => setTempPassword(e.target.value)}
                    className="text-sm font-mono"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopy(tempPassword, "password")}
                  >
                    {copiedSection === "password" ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Download & Application Links */}
          <div className="rounded-lg border bg-card p-4 space-y-3">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <MonitorDown className="w-4 h-4 text-primary" />
              Application & Setup Links
            </h4>

            {/* Windows Desktop Setup */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <Label className="text-xs font-medium text-foreground flex items-center gap-1">
                  Windows Desktop Setup Link (ClickOnce Installer)
                </Label>
                <a
                  href={desktopUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-primary hover:underline flex items-center gap-0.5"
                >
                  Test Link <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  value={desktopUrl}
                  onChange={(e) => setDesktopUrl(e.target.value)}
                  className="text-xs font-mono"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopy(desktopUrl, "desktop-link")}
                >
                  {copiedSection === "desktop-link" ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Android Mobile App Setup */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <Label className="text-xs font-medium text-foreground flex items-center gap-1">
                  <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                  Android Mobile App (APK Download)
                </Label>
                <a
                  href={androidUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-primary hover:underline flex items-center gap-0.5"
                >
                  Test Link <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  value={androidUrl}
                  onChange={(e) => setAndroidUrl(e.target.value)}
                  className="text-xs font-mono"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopy(androidUrl, "android-link")}
                >
                  {copiedSection === "android-link" ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Web Portal Link */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <Label className="text-xs font-medium text-foreground flex items-center gap-1">
                  Web Portal URL
                </Label>
                <a
                  href={webUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-primary hover:underline flex items-center gap-0.5"
                >
                  Test Link <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  value={webUrl}
                  onChange={(e) => setWebUrl(e.target.value)}
                  className="text-xs font-mono"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopy(webUrl, "web-link")}
                >
                  {copiedSection === "web-link" ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Full Message Preview */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <Label className="text-xs font-medium text-muted-foreground">
                Email / Text Message Content
              </Label>
              <span className="text-[11px] text-muted-foreground">
                Sent formatted in HTML via server
              </span>
            </div>
            <textarea
              readOnly
              rows={7}
              value={fullMessage}
              className="w-full text-xs font-mono p-3 rounded-lg border bg-muted/40 text-foreground resize-none focus:outline-none"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
