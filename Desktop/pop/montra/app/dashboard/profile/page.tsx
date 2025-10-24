import { getSupabaseServerClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Mail, Calendar } from "lucide-react"

export default async function ProfilePage() {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const userInitials = user?.email
    ? user.email
        .split("@")[0]
        .slice(0, 2)
        .toUpperCase()
    : "U"

  return (
    <div className="flex flex-col">
      <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
        <div className="flex flex-1 items-center justify-between">
          <h1 className="text-xl font-semibold">Profile</h1>
        </div>
      </header>

      <div className="flex-1 space-y-6 p-6">
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your account details and preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="text-2xl">{userInitials}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold">
                  {user?.user_metadata?.name || user?.email?.split("@")[0]}
                </h3>
                <p className="text-sm text-muted-foreground">Creator Account</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-lg border p-4">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-lg border p-4">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Member Since</p>
                  <p className="text-sm text-muted-foreground">
                    {user?.created_at
                      ? new Date(user.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
